import { Component, OnInit } from "@angular/core";
import { Product, ProductService } from "../services/product.service";
import { Router } from "@angular/router";
import { CloudStorageService } from "../services/cloud-storage.service";
import { trigger, transition, style, animate } from "@angular/animations";

@Component({
  selector: "app-editor-overview",
  template: `
    <div class="w-full h-full flex items-start justify-center p-6 ">
      <div
        class="relative bg-white rounded-lg shadow dark:bg-gray-700 w-4/5 max-h-full"
      >
        <div class="p-6 lg:px-8 space-y-4">
          <h3 class="mb-4 text-xl font-medium text-gray-900 dark:text-white">
            My Solutions
          </h3>

          <button class="primary-btn" (click)="createNewProduct()">
            Create New Solution
          </button>
          <div *ngIf="isLoading$ | async" class="text-gray-500 dark:text-white">
            Loading...
          </div>

          <ul *ngIf="!(isLoading$ | async)" class="space-y-4">
            <li
              *ngFor="let product of products"
              class="border border-gray-300 rounded-lg p-4 mb-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300"
            >
              <div [routerLink]="['/editor', product.id]">
                <h4 class="font-medium text-gray-900 dark:text-white">
                  {{ product.name }}
                </h4>
                <p class="text-sm text-gray-700 dark:text-gray-200">
                  Number of files: {{ product.files.length }}
                </p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
    <div
      *ngIf="apiKeyPromptVisible"
      class="fixed inset-0 flex items-center justify-center bg-opacity-60 bg-gray-500 dark:bg-opacity-60 dark:bg-gray-800 blurred-bg"
    >
      <div class="bg-white dark:bg-gray-800 w-full sm:w-2/3 rounded-lg p-10">
        <div class="flex justify-between items-center">
          <h2 class="text-2xl text-gray-800 dark:text-white">
            No API key found
          </h2>
        </div>
        <p class="text-gray-800 dark:text-gray-200 mt-4 mb-4">
          Please go to settings and provide an EmbedElite API key.
        </p>
        <div class="flex justify-end">
          <button (click)="redirectToSettings()" class="primary-btn">
            Go to Settings
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .blurred-bg::after {
        content: "";
        position: fixed;
        top: 0;
        bottom: 0;
        width: 100%;
        height: 100%;
        backdrop-filter: blur(5px);
        z-index: -1;
      }
    `,
  ],
})
export class EditorOverviewComponent implements OnInit {
  products: Product[] = [];
  apiKeyPromptVisible: boolean = false;
  isLoading$ = this.cloudStorageService.isLoading;

  constructor(
    private cloudStorageService: CloudStorageService,
    private productService: ProductService,
    private router: Router
  ) {}

  async ngOnInit() {
    try {
      this.products = await this.productService.listProducts();
    } catch (err) {
      this.apiKeyPromptVisible = true;
    }
  }

  createNewProduct() {
    this.router.navigate(["/editor/new"]);
  }

  redirectToSettings() {
    this.router.navigate(["/settings"]);
  }
}
