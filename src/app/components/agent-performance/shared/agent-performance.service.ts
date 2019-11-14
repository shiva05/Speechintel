import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import { DataService } from '../../../shared/data.service';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs/Observable';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable()
export class AgentPerformanceService {

  constructor(private _dataService: DataService, private http: HttpClient) { }
  getScoreDetails(Guid,type) {
    return this._dataService.dataServiceGet(`${environment.transcription_Api}/api/Questionnaire/ScoringEngineService/Get/${Guid}/${type}`).map(res => res);
  }

  agentFileInfo(recindx, data) {
    return this.http.post(`${environment.transcription_Api}/api/Questionnaire/AgentPerfromance/${recindx}`, data).map(res => res);
  }

  scoreManualUpdate(data) {
    return this.http.post(`${environment.transcription_Api}/api/Questionnaire/Scoring/Update`, data).map(res => res);
  }
  
  //ScoringEngineService/Dispute

  agentPerformanceDownloadSheet(data,options) {    
    return this.http.post(`${environment.transcriptiondownloader_Api}/api/Document/ExportAgentScore`, data, options);
  }
}
