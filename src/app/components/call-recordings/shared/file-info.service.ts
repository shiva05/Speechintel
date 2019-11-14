import { Injectable } from '@angular/core';

import 'rxjs/add/operator/map';
import { FileInfo } from '../fileInfo.interface';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DataService } from '../../../shared/data.service';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
@Injectable()
export class FileInfoService {
  fileData: any;
  public filesInfo: any = [];
  public agentsList: any = [];
  public originalfiledata: any = [];
  public dateFilterApplied_Transcript = new Subject<{ fromDate: '', toDate: '' }>();
  public dateFilterApplied_Recording = new Subject<{ fromDate: '', toDate: '' }>();
  public dateFilterApplied_AgentPerformance = new Subject<{ fromDate: '', toDate: '' }>();

  public UpladedDateFilterApplied_Transcript = new Subject<{ fromDate: '', toDate: '' }>();
  public UploadedDateFilterApplied_Recording = new Subject<{ fromDate: '', toDate: '' }>();
  public UpladedDateFilterApplied_AgentPerformance = new Subject<{ fromDate: '', toDate: '' }>();

  public dateFilterApplied_DisputedCalls = new Subject<{ fromDate: '', toDate: '' }>();

  dateFiltersApplied = true;
  uploadFilterApplied = false;
  callDateFilterApplied = false;
  disputedFilterApplied = false;
  filtersFromDisputedCalls: boolean = false;
  public dateformat: '';
  public filtercriteria: any = {
    callDateRange:
    {
      callFromDate: '', callToDate: '',
      uploadedFromDate: '',
      uploadedToDate: '',
      orgCallFromDate: '',
      orgCallToDate: '',
      orgUploadedFromDate: '',
      orgUploadedToDate: ''
    }
  };
  finalSelectedList = {
    "AgentName": null,
    "CustomerAccountNo": null,
    "CustomerPhoneNo": null,
    "ProgramName": null,
    "CallFromDate": this.filtercriteria.callDateRange.orgCallFromDate,
    "CallToDate": this.filtercriteria.callDateRange.orgCallToDate,
    "UploadedFromDate": this.filtercriteria.callDateRange.orgUploadedFromDate,
    "UploadedToDate": this.filtercriteria.callDateRange.orgUploadedToDate,
    "TranscriptStatus": 0,  //all
    "FileGuid": ''
  }

  finalDisputeCallFilterList = {
    "RecordIndex": 0,
    "FromDate": this.filtercriteria.callDateRange.callFromDate,
    "ToDate": this.filtercriteria.callDateRange.callToDate,
    "AgentName": null,
    "CustomerAccountNo": null,
    "CustomerPhoneNo": null,
    "ProgramName": null,
    "FinalStatus": null
  }


  public overallHeaderCount = {
    Jsondata: {},
    totalfileInfoLength: 0,
    totalDuration: '',
    pageNavigationCount: 0,
    totalCompletedLength: 0,
    totalProcessingLength: 0,
    avgHandleTime: ''
  };
  
  constructor(private _dataService: DataService, private http: HttpClient) { }

  getFileInfo(recindx, iscalltranscript, data) {
    return this.http.post(`${environment.transcription_Api}/api/file/${recindx}/${iscalltranscript}`, data).map(res => res);
    //  return this._dataService.dataServiceGet(`${environment.transcription_Api}/api/file/${recindx}/${iscalltranscript}`).map(res => <FileInfo[]>res);
  }


  //getSortedInformation(recindx, iscalltranscript, data) {
  //  return this.http.post(`${environment.transcription_Api}/api/file/${recindx}/${iscalltranscript}`, data);
  //}

  updateEditorStatus(guid, editorstatusid) {
    return this._dataService.dataServicePut(`${environment.transcription_Api}/api/file/${guid}/Editorstatus/${editorstatusid}`, null).map(res => <FileInfo[]>res);
  }
}
