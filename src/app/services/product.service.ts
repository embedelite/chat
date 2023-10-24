import { Injectable } from "@angular/core";
import { CloudStorageService } from "./cloud-storage.service";
import { v4 } from "uuid";

export interface Product {
  id: string;
  name: string;
  files: Array<string>;
}

@Injectable({ providedIn: "root" })
export class ProductService {
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

  async createProduct(product: Product): Promise<void> {
    const products = await this.listProducts();
    const index = products.findIndex((p) => p.id === product.id);
    if (index !== -1) {
      throw new Error(`Product with id ${product.id} already exists`);
    }
    //generate uuid only if it doesn't exist
    product.id = product.id || v4();
    products.push(product);

    const file = this.jsonObjectToFile(products, "index.json");
    await this.cloudStorageService.storeFile(file);
  }

  async updateProduct(product: Product): Promise<Product> {
    const products = await this.listProducts();
    const index = products.findIndex((p) => p.id === product.id);
    if (index === -1) {
      throw new Error(`Product with id ${product.id} not found`);
    }
    products[index] = product;

    const file = this.jsonObjectToFile(products, "index.json");
    await this.cloudStorageService.storeFile(file);

    return product; // return updated product
  }

  jsonObjectToFile(jsonObject: any, fileName: string): File {
    const jsonBlob = new Blob([JSON.stringify(jsonObject)], {
      type: "application/json",
    });
    return new File([jsonBlob], fileName, { type: "application/json" });
  }
}
