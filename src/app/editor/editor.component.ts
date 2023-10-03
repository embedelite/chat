import { Component, EventEmitter, Output } from "@angular/core";
import { StorageService } from "../services/storage.service";

@Component({
  selector: "app-editor",
  template: `
    <div class="w-full h-full flex items-start justify-center p-6 ">
      <div
        class="relative bg-white rounded-lg shadow dark:bg-gray-700 w-4/5 max-h-full"
      >
        <div class="p-6 lg:px-8 space-y-4">
          <h3 class="mb-4 text-xl font-medium text-gray-900 dark:text-white">
            Editor Configuration
          </h3>
          <form class="space-y-6">
            <div>
              <label
                for="product-dropdown"
                class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >Select Product</label
              >
              <select
                id="product-dropdown"
                class="appearance-none px-3 py-2 h-10 text-sm leading-5 font-sans w-full border border-muted-300 bg-white text-muted-600 placeholder-muted-300 focus-visible:border-muted-300 focus-visible:shadow-lg dark:placeholder-muted-600 dark:bg-muted-700 dark:text-muted-200 dark:border-muted-600 dark:focus-visible:border-muted-600 focus-visible:ring-0 outline-transparent focus-visible:outline-2 focus-visible:outline-dashed focus-visible:outline-muted-300 dark:focus-visible:outline-muted-600 focus-visible:outline-offset-2 transition-all duration-300"
                required
                (change)="onProductChange($event)"
              >
                <option *ngFor="let product of products" [value]="product">
                  {{ product }}
                </option>
              </select>
            </div>
            <div>
              <label
                for="file-upload"
                class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >Upload File</label
              >
              <input
                type="file"
                id="file-upload"
                name="file-upload"
                class="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                required
                (change)="onFileSelected($event)"
              />
            </div>
            <div>
              <button
                type="submit"
                class="text-white bg-primary-500 hover:bg-primary-800 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-4 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800 max-w-max p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:text-white float-right mt-4 mb-4"
                (click)="saveEditorConfig()"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [],
})
export class EditorComponent {
  @Output() showEditor = new EventEmitter<boolean>();

  selectedProduct: string;
  products: string[];
  file: File | null = null;

  constructor(private storageService: StorageService) {
    this.products = ["Product1", "Product2", "Product3"];
    this.selectedProduct = this.products[0]; // default to first product
  }

  onProductChange(selectedProduct: Event) {
    const target = selectedProduct.target as HTMLSelectElement;
    if (target) {
      this.selectedProduct = target.value;
    }
  }

  onFileSelected(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target && target.files) {
      this.file = target.files[0];
    }
  }

  saveEditorConfig() {
    this.storageService.setItem("selected_product", this.selectedProduct);
    // TODO: Implement logic to upload selected file
    this.showEditor.emit(false);
  }
}
