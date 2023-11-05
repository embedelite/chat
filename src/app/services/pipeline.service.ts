import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";
import { StorageService } from "./storage.service";

const PIPELINE_URL = "https://api.dev.embedelite.com/jobs";

export interface PipelineResponse {
  job_id: string;
  status: string;
}

@Injectable({
  providedIn: "root",
})
export class PipelineService {
  constructor(
    private http: HttpClient,
    private storageService: StorageService
  ) {}

  triggerPipeline(productId: string): Observable<PipelineResponse> {
    let ee_api_key = this.storageService.getItem<string>("ee_api_key") || "";
    const headers = new HttpHeaders({
      "Content-Type": "application/json",
      "API-Key": ee_api_key,
    });

    return this.http.post<PipelineResponse>(
      PIPELINE_URL,
      { productId },
      { headers: headers }
    );
  }
}
