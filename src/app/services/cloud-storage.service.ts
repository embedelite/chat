import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import {
  BlobServiceClient,
  AnonymousCredential,
  newPipeline,
  BlobUploadCommonResponse,
} from "@azure/storage-blob";
import { StorageService } from "./storage.service";

interface ProgressEvent {
  loadedBytes: number;
}
// define the block size for the file chunks; Azure supports up to 100MB (in bytes)
const UPLOAD_BLOCK_SIZE = 512 * 1024;
@Injectable({ providedIn: "root" })
export class CloudStorageService {
  private containerName?: string;
  private readonly apiUrl: string =
    "https://api.dev.embedelite.com/files/token";
  private readonly blobUrl: string =
    "https://stuploadsprod.blob.core.windows.net";
  private authorizationData: Promise<{
    sas_token: string;
    blob_url: string;
    expiry: Date;
  }> = this.refreshAuthorization();

  constructor(
    private http: HttpClient,
    private storageService: StorageService
  ) {
    this.refreshAuthorization();

    setInterval(async () => {
      const authData = await this.authorizationData;
      if (this.isTokenExpiryClose(authData)) {
        this.authorizationData = this.refreshAuthorization();
      }
    }, 60 * 1000); // Check every minute
  }

  // Refreshing the SAS token
  private refreshAuthorization(): Promise<{
    sas_token: string;
    blob_url: string;
    expiry: Date;
  }> {
    return (async () => {
      const ee_api_key = this.storageService.getItem<string>("ee_api_key");
      if (!ee_api_key) {
        throw new Error("API key not found in storage");
      }
      const headers = { "API-Key": ee_api_key };
      const response = await this.http
        .get<{
          sas_token: string;
          blob_url: string;
        }>(this.apiUrl, { headers })
        .toPromise();

      if (!response) {
        throw new Error("No response received from the server.");
      }

      const { sas_token, blob_url } = response;
      const expiry = this.decodeTokenExpiry(sas_token); // Get token expiry
      console.log("sas_token", sas_token);
      this.containerName = blob_url.substr(blob_url.lastIndexOf("/") + 1);
      return { sas_token, blob_url, expiry };
    })();
  }

  // Fetching the Blob Service Client
  private async getBlobServiceClient(): Promise<BlobServiceClient> {
    const authData = await this.authorizationData; // await for the authorization data
    if (!authData) {
      // check if authorization data is not undefined
      throw new Error("Authorization data is not available");
    }

    const { sas_token } = authData; // now sas_token is available
    const pipeline = newPipeline(new AnonymousCredential(), {
      retryOptions: { maxTries: 4 },
      userAgentOptions: { userAgentPrefix: "Sample V1" },
      keepAliveOptions: { enable: false },
    });
    return new BlobServiceClient(`${this.blobUrl}?${sas_token}`, pipeline);
  }

  async listFiles(): Promise<string[]> {
    const blobServiceClient = await this.getBlobServiceClient();
    let containerClient = blobServiceClient.getContainerClient(
      this.containerName!
    );
    let blobs = containerClient.listBlobsFlat();
    let files: string[] = [];
    for await (let blob of blobs) {
      files.push(blob.name);
    }
    return files;
  }

  async storeFile(file: File): Promise<BlobUploadCommonResponse> {
    // obtain the current BlobServiceClient
    const blobServiceClient = await this.getBlobServiceClient();

    // create a BlockBlobClient for the given file
    const blockBlobClient = blobServiceClient
      .getContainerClient(this.containerName!)
      .getBlockBlobClient(file.name);

    // define concurrency for simultaneous uploading of the blocks; can be adjusted according to network conditions for optimal results
    const concurrency = 20;

    // upload the file in parallel
    const uploadOptions = {
      UPLOAD_BLOCK_SIZE,
      maxSingleShotSize: UPLOAD_BLOCK_SIZE,
      concurrency,
    };
    const uploadResponse = await blockBlobClient.uploadData(
      file,
      uploadOptions
    );

    // return response
    return uploadResponse;
  }

  async storeFiles(
    file: File,
    path: string,
    onProgress: (progress: number) => void // explicit `void` return type
  ): Promise<BlobUploadCommonResponse> {
    const filePath = `${path}/${file.name}`;
    const blobServiceClient = await this.getBlobServiceClient();

    const blockBlobClient = blobServiceClient
      .getContainerClient(this.containerName!)
      .getBlockBlobClient(filePath);

    const concurrency = 20;

    const uploadOptions = {
      UPLOAD_BLOCK_SIZE,
      maxSingleShotSize: UPLOAD_BLOCK_SIZE,
      concurrency,
      onProgress: (progress: ProgressEvent) => {
        const uploadedFraction = (progress.loadedBytes / file.size) * 100; // convert decimal to percentage
        onProgress(uploadedFraction);
      },
    };

    const uploadResponse = await blockBlobClient.uploadData(
      file,
      uploadOptions
    );

    return uploadResponse;
  }

  async getFile(filename: string): Promise<string> {
    // get the blob service client
    const blobServiceClient = await this.getBlobServiceClient();

    // create a BlobClient for the provided filename
    const blobClient = blobServiceClient
      .getContainerClient(this.containerName!)
      .getBlobClient(filename);

    // download and read the text from the blob
    const response = await blobClient.download();
    const blobBody = await this.blobToString(await response.blobBody!);

    return blobBody;
  }

  async deleteFile(path: string): Promise<void> {
    const blobServiceClient = await this.getBlobServiceClient();
    const blobClient = blobServiceClient
      .getContainerClient(this.containerName!)
      .getBlobClient(path);
    await blobClient.delete();
  }

  // Converts a browser Blob into a string.
  async blobToString(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsText(blob);
    });
  }

  private decodeTokenExpiry(sasToken: string): Date {
    // Split the token into separate key=value strings
    const parts = sasToken.split("&");
    let tokenExpiry: Date | undefined;
    // Find the "se" part
    for (let part of parts) {
      if (part.includes("se=")) {
        // Convert the "se" part into a proper date time string (replace the URL encoding)
        const expiryDateTimeString = decodeURIComponent(
          part.replace("se=", "")
        );
        tokenExpiry = new Date(expiryDateTimeString);
        break;
      }
    }

    if (tokenExpiry === undefined) {
      throw new Error("Could not find expiry date in SAS token");
    }

    return tokenExpiry;
  }

  private isTokenExpiryClose(authData: {
    sas_token: string;
    blob_url: string;
    expiry: Date;
  }): boolean {
    // Get the current date time
    const currentDateTime = new Date();
    // Adjust it to X minutes in the future
    currentDateTime.setMinutes(currentDateTime.getMinutes() + 5); // 5 minutes buffer
    // Compare
    return authData.expiry <= currentDateTime;
  }
}
