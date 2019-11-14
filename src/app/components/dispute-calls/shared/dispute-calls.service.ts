import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import { DataService } from '../../../shared/data.service';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs/Observable';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable()
export class DisputeCallsService {

  constructor(private _dataService: DataService, private http: HttpClient) { }

  disupteCallsUpdate(data) {
    return this.http.post(`${environment.transcription_Api}/api/Questionnaire/Scoring/Dispute`, data).map(res => res);
  }
  disputeApprovalUpdate(data) {
    return this.http.post(`${environment.transcription_Api}/api/Questionnaire/Scoring/Update`, data).map(res => res);
  }
  disputedCallsDownloadSheet(data, options) {
    return this.http.post(`${environment.download_Api}/ExportDisputeCalls`, data, options);
  }
}
