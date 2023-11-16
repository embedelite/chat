import { Injectable } from "@angular/core";
import { CloudStorageService } from "./cloud-storage.service";
import { v4 } from "uuid";
import { BehaviorSubject, take } from "rxjs";
import { JobStatus, PipelineService } from "./pipeline.service";

export interface Product {
  id: string;
  name: string;
  files: Array<string>;
  jobs: Array<string>;
}

export interface FileUploadInfo {
  file: File;
  uploadProgress: number;
  isFileUploaded: boolean;
  deleted?: boolean;
}

export interface Job {
  id: string;
  product_id: string;
  status: JobStatus;
  createdAt: string;
  updatedAt: string;
  image: string;
  logs: string[];
  error: string;
}

@Injectable({ providedIn: "root" })
export class ProductService {
  uploadProgressSubject = new BehaviorSubject<FileUploadInfo[]>([]);

  constructor(
    private cloudStorageService: CloudStorageService,
    private pipelineService: PipelineService
  ) {}

  async listProducts(): Promise<Product[]> {
    const json = await this.cloudStorageService.getFile("index.json");
    const products: Product[] = JSON.parse(json);
    return products;
  }

  async getProduct(id: string): Promise<Product> {
    const products = await this.listProducts();
    const product = products.find((product) => product.id === id);
    if (!product) {
      throw new Error(`Product ${id} not found`);
    }
    return product;
  }

  async createOrUpdateProduct(
    product: Product,
    files: FileUploadInfo[]
  ): Promise<Product> {
    let updatedProduct;
    if (product.id === "") {
      updatedProduct = await this.createProduct(product, files);
    } else {
      updatedProduct = await this.updateProduct(product, files);
    }

    await this.submitJob(updatedProduct.id);

    return updatedProduct;
  }

  async createProduct(
    product: Product,
    files: FileUploadInfo[]
  ): Promise<Product> {
    const products = await this.listProducts();
    const index = products.findIndex((p) => p.id === product.id);
    if (index !== -1) {
      throw new Error(`Product with id ${product.id} already exists`);
    }
    //generate uuid only if it doesn't exist
    product.id = product.id || v4();
    product.files = await this.uploadFiles(files, product.id);
    products.push(product);

    const file = this.jsonObjectToFile(products, "index.json");
    await this.cloudStorageService.storeFile(file);
    return product;
  }

  async updateProduct(
    product: Product,
    files: FileUploadInfo[]
  ): Promise<Product> {
    const products = await this.listProducts();
    const index = products.findIndex((p) => p.id === product.id);
    if (index === -1) {
      throw new Error(`Product with id ${product.id} not found`);
    }
    product.files = await this.uploadFiles(files, product.id);
    products[index] = product;

    const file = this.jsonObjectToFile(products, "index.json");
    await this.cloudStorageService.storeFile(file);
    return product; // return updated product
  }

  async uploadFiles(
    files: FileUploadInfo[],
    productId: string
  ): Promise<string[]> {
    const uploadPromises = files.map((fileInfo) => {
      if (fileInfo.uploadProgress !== 100) {
        return this.cloudStorageService.storeFiles(
          fileInfo.file,
          productId,
          (progress) => {
            const individualFileProgress = Math.floor(progress);
            fileInfo.uploadProgress = individualFileProgress;

            console.log(
              `Upload Progress of ${fileInfo.file.name}: ${individualFileProgress}% `
            );

            if (individualFileProgress === 100) {
              fileInfo.isFileUploaded = true;
            }
            this.uploadProgressSubject.next(files);
          }
        );
      } else {
        return null;
      }
    });

    await Promise.all(uploadPromises.filter((promise) => promise !== null));

    return files
      .filter((fileInfo) => !fileInfo.deleted)
      .map((fileInfo) => fileInfo.file.name);
  }

  private async submitJob(productId: string): Promise<any> {
    try {
      const result = await this.pipelineService
        .startNewJob(productId)
        .pipe(take(1))
        .toPromise();

      console.log(result);

      if (!result?.job_id) {
        throw new Error("Job id not found in response");
      }

      await this.addToJobs(productId, result.job_id);

      return result;
    } catch (error) {
      console.error("Error while submitting job ", error);
    }
  }

  async addToJobs(productId: string, jobId: string) {
    const products = await this.listProducts();
    const product = products.find((p) => p.id === productId);

    if (!product) throw new Error(`Product with id ${productId} not found`);

    if (!product.jobs) {
      product.jobs = [];
    }
    product.jobs.push(jobId);

    products[products.indexOf(product)] = product;

    const file = this.jsonObjectToFile(products, "index.json");
    await this.cloudStorageService.storeFile(file);
  }

  async getJobs(productId: string): Promise<Job[]> {
    if (!productId) {
      console.error("Product id is not provided. Cannot fetch jobs");
      return [];
    }
    const product = await this.getProduct(productId);

    if (!product.jobs || product.jobs.length === 0) {
      return [];
    }
    const jobs: Job[] = [];
    for (const jobId of product.jobs) {
      const jobData = await this.cloudStorageService.getFile(
        `jobs/${jobId}.json`
      );
      jobs.push(JSON.parse(jobData));
    }
    return jobs;
  }

  async stopJob(productId: string, jobId: string): Promise<void> {
    const jobs = await this.getJobs(productId);
    const job = jobs.find((job) => job.id === jobId);
    if (!job) {
      throw new Error(`Job with id ${jobId} not found`);
    }
    await this.pipelineService.stopJob(jobId).subscribe(
      (result) => {
        console.log(result);
        //remove from jobs array and update the product
        this.removeFromJobs(productId, jobId);
      },
      (error) => {
        console.error("Error while stopping job ", error);
      }
    );
  }

  async removeFromJobs(productId: string, jobId: string) {
    const products = await this.listProducts();
    const product = products.find((p) => p.id === productId);

    if (!product) throw new Error(`Product with id ${productId} not found`);

    if (!product.jobs) {
      product.jobs = [];
    }
    product.jobs = product.jobs.filter((id) => id !== jobId);

    products[products.indexOf(product)] = product;

    const file = this.jsonObjectToFile(products, "index.json");
    await this.cloudStorageService.storeFile(file);
  }

  jsonObjectToFile(jsonObject: any, fileName: string): File {
    const jsonBlob = new Blob([JSON.stringify(jsonObject)], {
      type: "application/json",
    });
    return new File([jsonBlob], fileName, { type: "application/json" });
  }
}
