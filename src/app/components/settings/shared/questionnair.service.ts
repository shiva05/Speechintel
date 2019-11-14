import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { DataService } from '../../../shared/data.service';
import { environment } from '../../../../environments/environment';
//import { Observable } from 'rxjs/Observable';

@Injectable()
export class QuestionnairService {
  questions: any;
  constructor(private _dataService: DataService, private http: HttpClient) { }


  getQuestionnair(questionnairtype, versionid,  programName) {
    
    return this._dataService.dataServiceGet(`${environment.transcription_Api}/api/questionnaire/GetCustomerQuestionnaire/${questionnairtype}/${versionid}/${programName}`).map(res => res);
  }

  updateQuestionnaire(data, type) {
    return this._dataService.dataServicePost(`${environment.transcription_Api}/api/Questionnaire/UpdateQuestionnaire/${type}`, data);
  }

  questionaryDownloadSheet(questionnairtype, versionid, programName, options) {
    return this.http.get(`${environment.download_Api}/ExportQuestionnaire/${questionnairtype}/${versionid}/${programName}`, options);
  }
}

