import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";
import { StorageService } from "./storage.service";

const PIPELINE_URL = "https://api.dev.embedelite.com/jobs";

export enum JobStatus {
  PENDING = "pending",
  RUNNING = "running",
  FAILED = "failed",
  SUCCESS = "success",
  CANCELLED = "cancelled",
}

export interface PipelineResponse {
  job_id: string;
  status: JobStatus;
}

@Injectable({
  providedIn: "root",
})
export class PipelineService {
  constructor(
    private http: HttpClient,
    private storageService: StorageService
  ) {}

  startNewJob(productId: string): Observable<PipelineResponse> {
    const ee_api_key = this.storageService.getItem<string>("ee_api_key") || "";
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

  stopJob(jobId: string): Observable<PipelineResponse> {
    const ee_api_key = this.storageService.getItem<string>("ee_api_key") || "";
    const headers = new HttpHeaders({
      "Content-Type": "application/json",
      "API-Key": ee_api_key,
    });

    return this.http.delete<PipelineResponse>(`${PIPELINE_URL}/${jobId}`, {
      headers: headers,
    });
  }
}
