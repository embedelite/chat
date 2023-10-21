import { Component, OnInit } from "@angular/core";
import { StorageService } from "../services/storage.service";
import { CloudStorageService } from "../services/cloud-storage.service";
import { ProductService } from "../services/product.service";

@Component({
  selector: "app-editor-overview",
  template: `
    <div class="w-full h-full flex items-start justify-center p-6 ">
      <div
        class="relative bg-white rounded-lg shadow dark:bg-gray-700 w-4/5 max-h-full"
      >
        <div class="p-6 lg:px-8 space-y-4">
          <h3 class="mb-4 text-xl font-medium text-gray-900 dark:text-white">
            My Knowledge Bases
          </h3>
          <ul class="space-y-4">
            <li
              *ngFor="let product of products"
              class="product border border-gray-300 rounded-lg p-4 mb-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300"
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
  `,
  styles: [],
})
export class EditorOverviewComponent implements OnInit {
  products: any[] = []; // Replace any with your product data type

  constructor(private productService: ProductService) {}

  async ngOnInit() {
    this.products = await this.productService.listProducts();
    // more logic...
  }
}
