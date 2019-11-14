import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import { DataService } from '../../../shared/data.service';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs/Observable';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable()
export class CustomerSatisfactionService {
  getScoreDetails(Guid, type) {
    return this._dataService.dataServiceGet(`${environment.transcription_Api}/api/Questionnaire/ScoringEngineService/Get/${Guid}/${type}`).map(res => res);
  }
  constructor(private _dataService: DataService, private http: HttpClient) { }
  customerSatisfactionFileInfo(recindx, data) {
    return this.http.post(`${environment.transcription_Api}/api/Questionnaire/CustomerSatisfactionPerfromance/${recindx}`, data).map(res => res);
  }

  customerSatisfactionDownloadSheet(data, options) {
    return this.http.post(`${environment.transcriptiondownloader_Api}/api/Document/ExportCustomerSatisfactionScore`, data, options).map(res => res);
  }
}
