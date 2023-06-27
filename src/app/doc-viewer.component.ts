import { Component, Input, OnChanges, SimpleChanges } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";

@Component({
  selector: "app-doc-viewer",
  template: `
    <div class="h-full w-full relative">
      <iframe
        class="absolute inset-0 w-full h-full"
        [src]="url | safe : 'resourceUrl'"
        (load)="onLoad()"
      >
      </iframe>
      <div
        class="absolute inset-0 flex items-center justify-center bg-primary-100 dark:bg-primary-700"
        *ngIf="isLoading"
      >
        <div class="flex flex-col items-center justify-center">
          <div
            class="animate-spin h-10 w-10 border-b-2 border-gray-800 dark:border-gray-200 rounded-full"
          ></div>
          <div class="mt-4 text-gray-800 dark:text-gray-200">
            Loading patent...
          </div>
        </div>
        <!-- The above div is a simple loading spinner using Tailwind CSS, replace it with your preferred animation -->
      </div>
    </div>
  `,
})
export class DocViewerComponent implements OnChanges {
  @Input() url: string;
  isLoading: boolean = true;

  constructor() {
    this.url = "";
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes["url"]) {
      console.log("URL changed: ", this.url);
      this.isLoading = true; // Set loading to true when url changes
    }
  }

  onLoad() {
    this.isLoading = false; // Set loading to false when iframe has loaded the content
  }
}
