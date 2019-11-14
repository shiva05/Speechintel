import { Component, OnInit, EventEmitter, ViewContainerRef } from '@angular/core';
import { FileInfoService } from '../call-recordings/shared/file-info.service';
import { DatePipe } from '@angular/common';
import { NgForm } from '@angular/forms';
import { DataService } from '../../shared/data.service';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import * as cloneDeep from 'lodash/cloneDeep';
import { AuthorizationService } from '../../shared/authorization.service';
import * as jwt_decode from 'jwt-decode';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';
import { Router } from '@angular/router';
@Component({
  selector: 'app-uploadDateFilter',
  templateUrl: './uploadDateFilter.component.html',
  styleUrls: ['./uploadDateFilter.component.css']
})
export class UploadDatefilterComponent implements OnInit {
  currentDate: any;
  fromDate: '';
  toDate: '';
  minDate: Date;
  maxDate: Date;
  showCallDateLabel: boolean;
  clonedObject: any = [];
  role: any;
  uploadFilterApplied: boolean;
  //min:any;
  //max:any;
  //twoWayRange: Array<any> = [];

  constructor(public _FileInfoService: FileInfoService,
    public dataService: DataService,
    public toastr: ToastsManager, vRef: ViewContainerRef, public authService: AuthorizationService,
    private _router: Router) {
  }
  ngOnInit() {
    let decod = jwt_decode(this.authService.getToken());
    this.authService.UserProfiledetails.role.name = decod['userRole'];
    this.role = this.authService.UserProfiledetails.role.name;
    this.minDate = new Date(this._FileInfoService.filtercriteria.callDateRange.orgUploadedFromDate);
    this.maxDate = new Date(this._FileInfoService.filtercriteria.callDateRange.orgUploadedToDate);
    this.showCallDateLabel = (this._router.url.lastIndexOf("callTranscripts") < 0) && this.role != "Customer" ? false : true;
  }
  //initCount() {
  //  this._FileInfoService.overallHeaderCount.totalfileInfoLength = this._FileInfoService.filesInfo[0].TotalRecordCount;
  //  var overallcountdata = JSON.parse(this._FileInfoService.filesInfo[0].overallHeaderCount);
  //  this._FileInfoService.overallHeaderCount.totalDuration = this.dataService.formatTime(overallcountdata.totalDuration);


  //}

  //oninput change you need to do
  //changed() {
  //  this.twoWayRange = [...this.twoWayRange];
  //}

  //revertchanges() {
  //  this._FileInfoService.filesInfo = this._FileInfoService.originalfiledata;
  //  this._FileInfoService.filtercriteria.callDateRange.fromDate = this._FileInfoService.filtercriteria.callDateRange.orgfromDate;
  //  this._FileInfoService.filtercriteria.callDateRange.toDate = this._FileInfoService.filtercriteria.callDateRange.orgtoDate;
  //  this.initCount();
  //}

  applyUploadedDateChanges(form: NgForm) {
    // this._FileInfoService.dateformat = value;
    this._FileInfoService.finalSelectedList.UploadedFromDate = this._FileInfoService.filtercriteria.callDateRange.uploadedFromDate;
    this._FileInfoService.finalSelectedList.UploadedToDate = this._FileInfoService.filtercriteria.callDateRange.uploadedToDate;
    if (this._FileInfoService.finalSelectedList.UploadedFromDate != null || this._FileInfoService.finalSelectedList.UploadedToDate != null) {
      this._FileInfoService.uploadFilterApplied = true;
    }
   
    var fromdate = this._FileInfoService.filtercriteria.callDateRange.uploadedFromDate;
    var todate = this._FileInfoService.filtercriteria.callDateRange.uploadedToDate;
    if (this._router.url.lastIndexOf("callTranscripts") > 0) {
      this._FileInfoService.UpladedDateFilterApplied_Transcript.next({
        fromDate: fromdate,
        toDate: todate
      });
    } else if (this._router.url.lastIndexOf("callRecordings") > 0) {
      this._FileInfoService.UploadedDateFilterApplied_Recording.next({
        fromDate: fromdate,
        toDate: todate
      });
    }
    else {
      this._FileInfoService.UpladedDateFilterApplied_AgentPerformance.next({
        fromDate: fromdate,
        toDate: todate
      });
    }
    this._FileInfoService.dateFiltersApplied = false;
  }

}
