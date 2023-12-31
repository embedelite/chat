import {
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
} from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import {
  FileUploadInfo,
  Job,
  Product,
  ProductService,
} from "../services/product.service";
import { Subscription, interval, of, switchMap, takeWhile } from "rxjs";

@Component({
  selector: "app-editor",
  template: `
    <div class="w-full h-full flex items-start justify-center p-6 ">
      <div class="relative bg-white rounded-lg shadow dark:bg-gray-700 w-4/5">
        <div class="p-6 lg:px-8 space-y-4">
          <h3 class="mb-4 text-xl font-medium text-gray-900 dark:text-white">
            Solution Configuration
          </h3>
          <form class="space-y-6">
            <div>
              <label
                for="product-name"
                class="block mb-2 text font-medium text-gray-900 dark:text-white"
                >Solution Name</label
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
                class="block mb-2 text font-medium text-gray-900 dark:text-white"
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
              class="border border-gray-300 rounded-lg p-2 mb-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 gap-4 flex items-center justify-between w-full"
              *ngFor="let fileInfo of files; let i = index"
            >
              <h4 class="font-medium text-gray-800 dark:text-white flex-grow">
                {{ fileInfo.file.name }}
              </h4>
              <div class="file-info flex-grow flex justify-end items-center">
                <div
                  class="px-3 py-1 text-xs font-semibold rounded-full w-36"
                  [ngClass]="{
                    'bg-red-200 text-red-500':
                      (fileInfo.uploadProgress !== 100 &&
                        !fileInfo.isFileUploaded) ||
                      fileInfo.deleted,
                    'bg-green-200 text-green-500':
                      fileInfo.uploadProgress === 100 ||
                      (fileInfo.isFileUploaded && !fileInfo.deleted),
                    'bg-yellow-400 text-yellow-700':
                      fileInfo.uploadProgress > 0 &&
                      fileInfo.uploadProgress < 100 &&
                      !fileInfo.isFileUploaded &&
                      !fileInfo.deleted
                  }"
                >
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
                <div class="flex items-center justify-end w-8">
                  <button
                    class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-full h-8 inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                    (click)="removeFile(i)"
                    *ngIf="
                      fileInfo.uploadProgress === 0 ||
                      (fileInfo.uploadProgress === 100 && !fileInfo.deleted)
                    "
                  >
                    <i class="fa-regular fa-xmark"></i>
                  </button>
                  <button
                    class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-full h-8 inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                    (click)="removeFile(i)"
                    *ngIf="fileInfo.deleted"
                  >
                    <i class="fa-regular fa-arrow-rotate-left"></i>
                  </button>
                </div>
              </div>
            </div>
            <div class="mt-10 border-gray-300">
              <p class="block mb-2 font-medium text-gray-900 dark:text-white">
                Job Overview
              </p>
              <div
                *ngIf="hasJobs()"
                class="rounded-lg overflow-hidden roundex-xl "
              >
                <div
                  class="cursor-pointer py-4 bg-gray-50 dark:bg-gray-800 transition duration-200 ease-in-out grid grid-cols-3 gap-3 hover:bg-gray-100 dark:hover:bg-gray-900"
                  *ngFor="let job of jobs; let i = index"
                  (click)="toggleShowLogs(i)"
                >
                  <div
                    class="mx-2 flex items-center text-sm text-gray-900 dark:text-gray-100"
                  >
                    <p>
                      {{
                        job.createdAt
                          | date : "yyyy-MM-ddTHH:mm:ss.sssZ" : "UTC"
                      }}
                    </p>
                  </div>

                  <div
                    class="flex items-center text-sm text-gray-900 dark:text-gray-100"
                  >
                    <p>{{ job.id }}</p>
                  </div>

                  <div class="flex justify-between items-center text-right">
                    <div
                      class="status-icons flex justify-end items-center space-x-2"
                    >
                      <button
                        class="text-yellow-500"
                        *ngIf="job.status === 'pending'"
                      >
                        <i class="fa-regular fa-clock"></i>
                      </button>
                      <button
                        class="text-yellow-500"
                        *ngIf="job.status === 'running'"
                      >
                        <i class="fa-solid fa-fan fa-spin"></i>
                      </button>
                      <button
                        class="text-green-500"
                        *ngIf="job.status === 'success'"
                      >
                        <i class="fa-regular fa-circle-check"></i>
                      </button>
                      <button
                        class="text-red-500"
                        *ngIf="job.status === 'failed'"
                      >
                        <i class="fa-regular fa-circle-xmark"></i>
                      </button>
                      <p
                        class=" text-sm text-gray-900 dark:text-gray-100 capitalize"
                      >
                        {{ job.status }}
                      </p>
                      <button
                        class="ml-2 py-1 px-2 bg-red-500 text-white rounded"
                        *ngIf="job.status === 'running'"
                        (click)="stopJob(job.id); $event.stopPropagation()"
                      >
                        Stop Job
                      </button>
                    </div>
                  </div>

                  <div class="col-span-4 py-2" *ngIf="job.showLogs">
                    <pre
                      class="p-2 text-xs text-gray-400 dark:text-gray-500 whitespace-pre-wrap"
                      >{{
                        job.logs.join(
                          "
"
                        )
                      }}</pre
                    >
                  </div>
                </div>
              </div>
              <div
                *ngIf="!hasJobs()"
                class="mt-10 border-gray-300 px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg dark:bg-yellow-700 dark:text-yellow-100 dark:border-yellow-700"
              >
                <p>
                  No jobs exist at the moment. The jobs will appear here once
                  you have uploaded files and saved the product.
                </p>
              </div>
            </div>
            <div>
              <button
                type="submit"
                class="primary-btn float-right mt-4 mb-4"
                (click)="saveEditorConfig()"
              >
                <span
                  class="inset-0 flex items-center justify-center"
                  *ngIf="isSaving"
                >
                  <span
                    class="animate-spin h-5 w-5 border-t-2 border-b-2 border-primary-500 rounded-full"
                  ></span>
                </span>
                <span *ngIf="!isSaving">Save</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      @keyframes spin {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }
      }
    `,
  ],
})
export class EditorComponent implements OnInit, OnDestroy {
  @Output() showEditor = new EventEmitter<boolean>();
  isSaving = false;
  alive = true;

  product?: Product;
  selectedProduct: string = "";
  files: FileUploadInfo[] = [];
  jobs: (Job & { showLogs?: boolean })[] = [];
  private subscription?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService
  ) {}

  async ngOnInit() {
    const productId = this.route.snapshot.paramMap.get("id");
    if (productId === "new") {
      this.product = {
        id: "",
        name: "",
        files: [],
        jobs: [],
      };
      return;
    }
    if (productId) {
      await this.initializeProduct(productId);
    }
    this.selectedProduct = this.product?.name || "";

    this.subscription = this.productService.uploadProgressSubject.subscribe(
      (newFiles) => {
        this.files = [...this.files, ...newFiles];
      }
    );

    interval(10000)
      .pipe(
        switchMap(async () => {
          if (this.isJobRunning() && this.product) {
            this.jobs = await this.productService.getJobs(this.product.id);
            return of(
              this.jobs.sort(
                (a, b) =>
                  new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime()
              )
            );
          }
          return of(null); // return Observable of null when not running
        }),
        takeWhile(() => this.alive && this.isJobRunning())
      )
      .subscribe();
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
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
    this.jobs = await this.productService.getJobs(this.product.id);
    this.jobs.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
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

    if (this.files[index].uploadProgress === 0) {
      this.files.splice(index, 1);
    } else {
      this.files[index].deleted = !this.files[index].deleted;
    }
  }

  toggleShowLogs(index: number) {
    this.jobs[index].showLogs = !this.jobs[index].showLogs;
  }

  shouldShowDeleteButton(fileInfo: FileUploadInfo): boolean {
    return (
      fileInfo.uploadProgress === 0 ||
      (fileInfo.uploadProgress === 100 && !fileInfo.deleted)
    );
  }

  async stopJob(jobId: string) {
    if (!this.product) {
      return;
    }
    await this.productService.stopJob(this.product.id, jobId);
    //refresh jobs
    this.jobs = await this.productService.getJobs(this.product.id);
  }

  hasJobs(): boolean {
    return this.jobs && this.jobs.length > 0;
  }

  async saveEditorConfig() {
    if (!this.product) {
      return;
    }
    this.product.name = this.selectedProduct;
    this.isSaving = true;
    this.product = await this.productService.createOrUpdateProduct(
      this.product,
      this.files
    );
    this.isSaving = false;

    if (this.product) {
      await this.initializeProduct(this.product.id);
    }
  }

  isJobRunning(): boolean {
    return this.jobs.some(
      (job) => job.status === "running" || job.status === "pending"
    );
  }
}
