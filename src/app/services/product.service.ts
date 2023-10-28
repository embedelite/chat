import { Injectable } from "@angular/core";
import { CloudStorageService } from "./cloud-storage.service";
import { v4 } from "uuid";
import { BehaviorSubject } from "rxjs";

export interface Product {
  id: string;
  name: string;
  files: Array<string>;
}

export interface FileUploadInfo {
  file: File;
  uploadProgress: number;
  isFileUploaded: boolean;
  deleted?: boolean;
}

@Injectable({ providedIn: "root" })
export class ProductService {
  uploadProgressSubject = new BehaviorSubject<FileUploadInfo[]>([]);

  constructor(private cloudStorageService: CloudStorageService) {}

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
    if (product.id === "") {
      return this.createProduct(product, files);
    } else {
      return this.updateProduct(product, files);
    }
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

  jsonObjectToFile(jsonObject: any, fileName: string): File {
    const jsonBlob = new Blob([JSON.stringify(jsonObject)], {
      type: "application/json",
    });
    return new File([jsonBlob], fileName, { type: "application/json" });
  }
}
