import { Component, EventEmitter, Output } from "@angular/core";
import { StorageService } from "../services/storage.service";
import { ActivatedRoute } from "@angular/router";
import { Product, ProductService } from "../services/product.service";
import { CloudStorageService } from "../services/cloud-storage.service";

interface FileUploadInfo {
  file: File;
  uploadProgress: number;
  isFileUploaded: boolean;
  deleted?: boolean;
}

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
                for="product-name"
                class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >Product Name</label
              >
              <input
                id="product-name"
                name="product-name"
                [(ngModel)]="selectedProduct"
                class="appearance-none px-3 py-2 h-10 text-sm leading-5 font-sans w-full border border-muted-300 bg-white text-muted-600 placeholder-muted-300 focus-visible:border-muted-300 focus-visible:shadow-lg dark:placeholder-muted-600 dark:bg-muted-700 dark:text-muted-200 dark:border-muted-600 dark:focus-visible:border-muted-600 focus-visible:ring-0 outline-transparent focus-visible:outline-2 focus-visible:outline-dashed focus-visible:outline-muted-300 dark:focus-visible:outline-muted-600 focus-visible:outline-offset-2 transition-all duration-300"
                required
              />
            </div>
            <div>
              <label
                for="file-upload"
                class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >Upload Files</label
              >
              <input
                type="file"
                id="file-upload"
                name="file-upload"
                class="hidden"
                required
                multiple
                (change)="onFileSelected($event)"
              />
              <button
                type="button"
                class="text-white bg-primary-500 hover:bg-primary-800 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-4 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800 max-w-max p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:text-white mt-4 mb-4"
                (click)="addFiles()"
              >
                Select Files
              </button>
            </div>
            <div
              *ngFor="let fileInfo of files; let i = index"
              class="file-upload p-4 gap-4 rounded-xl bg-white dark:bg-gray-700 shadow-md flex items-center justify-between w-full bg-white text-gray-600 my-3 border-2 border-muted-300"
            >
              <h4 class="font-medium text-gray-800 dark:text-white flex-grow">
                {{ fileInfo.file.name }}
              </h4>
              <div
                class="px-3 py-1 text-xs font-semibold rounded-full"
                [ngClass]="{
                  'bg-red-200 text-red-500':
                    (fileInfo.uploadProgress !== 100 &&
                      !fileInfo.isFileUploaded) ||
                    fileInfo.deleted,
                  'bg-green-200 text-green-500':
                    fileInfo.uploadProgress === 100 ||
                    (fileInfo.isFileUploaded && !fileInfo.deleted)
                }"
                style="width: 150px;"
              >
                <div
                  class="h-full rounded-full"
                  [style.width.%]="fileInfo.uploadProgress"
                  [ngClass]="{
                    'bg-red-500':
                      fileInfo.uploadProgress === 0 || fileInfo.deleted,
                    'bg-green-500':
                      fileInfo.uploadProgress > 0 && !fileInfo.deleted
                  }"
                ></div>
                <span
                  class="relative inset-0 flex items-center justify-center pointer-events-none"
                >
                  {{
                    fileInfo.deleted
                      ? "Marked for Deletion"
                      : (fileInfo.uploadProgress | number : "1.0-0")
                  }}{{ fileInfo.deleted ? "" : "%" }}
                </span>
              </div>
              <button
                class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                (click)="removeFile(i)"
                *ngIf="
                  fileInfo.uploadProgress === 0 ||
                  (fileInfo.uploadProgress === 100 && !fileInfo.deleted)
                "
              >
                <svg
                  class="h-5 w-5"
                  fill="none"
                  viewBox="0 0 20 20"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </button>
              <button
                class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                (click)="removeFile(i)"
                *ngIf="fileInfo.deleted"
              >
                <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fill-rule="evenodd"
                    d="M10 2a8 8 0 100 16 8 8 0 000-16zM8.707 14.707a1 1 0 01-1.414-1.414L8.586 10 7.293 8.707a1 1 0 011.414-1.414L10 8.586l1.293-1.293a1 1 0 111.414 1.414L11.414 10l1.293 1.293a1 1 0 01-1.414 1.414L10 11.414l-1.293 1.293z"
                    clip-rule="evenodd"
                  />
                </svg>
              </button>
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

  product?: Product;
  selectedProduct: string = "";
  files: FileUploadInfo[] = [];

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cloudStorageService: CloudStorageService
  ) {}

  async ngOnInit() {
    const productId = this.route.snapshot.paramMap.get("id");
    if (productId) {
      await this.initializeProduct(productId);
    }
    this.selectedProduct = this.product?.name || "";
  }

  async initializeProduct(productId: string): Promise<void> {
    this.product = await this.productService.getProduct(productId);
    this.selectedProduct = this.product?.name || "";
    this.files =
      this.product?.files.map((filePath) => {
        const fileName = filePath.split("/").pop() || "";
        return {
          file: new File([""], fileName),
          uploadProgress: 100,
          isFileUploaded: true,
        };
      }) ?? [];
  }

  addFiles() {
    const fileUpload = document.getElementById("file-upload") as HTMLElement;
    fileUpload.click();
  }

  onFileSelected(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.files) {
      for (let i = 0; i < target.files.length; i++) {
        this.files.push({
          file: target.files[i],
          uploadProgress: 0,
          isFileUploaded: false,
        });
      }
    }
  }

  removeFile(index: number) {
    if (
      this.files[index].uploadProgress > 0 &&
      this.files[index].uploadProgress < 100
    ) {
      alert("You cannot remove a file while it's uploading");
      return;
    }

    this.files[index].deleted = !this.files[index].deleted;
  }

  async saveEditorConfig() {
    if (this.product) {
      this.product.name = this.selectedProduct;
      this.product.files = [];

      const uploadPromises = this.files.map((fileInfo, index) => {
        //TODO: Update SAS token to allow delete
        // if (fileInfo.deleted) {
        //   return this.cloudStorageService.deleteFile(
        //     `${this.product?.id}/${fileInfo.file.name}`
        //   );
        // }
        if (fileInfo.uploadProgress !== 100) {
          return this.cloudStorageService.storeFiles(
            fileInfo.file,
            this.product!.id,
            (progress) => {
              const individualFileProgress = Math.floor(progress);
              this.files[index].uploadProgress = individualFileProgress;

              console.log(
                `Upload Progress of ${fileInfo.file.name}: ${individualFileProgress}% `
              );

              if (individualFileProgress === 100) {
                this.files[index].isFileUploaded = true;
              }
            }
          );
        } else {
          return null;
        }
      });

      await Promise.all(uploadPromises.filter((promise) => promise !== null));

      this.product.files = this.files
        .filter((fileInfo) => !fileInfo.deleted) // Remove deleted files
        .map((fileInfo) => fileInfo.file.name);

      this.product = await this.productService.updateProduct(this.product);
      if (this.product) {
        await this.initializeProduct(this.product.id);
      }
      this.showEditor.emit(false);
    }
  }
}
