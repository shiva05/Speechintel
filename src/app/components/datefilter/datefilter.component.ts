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
  selector: 'app-datefilter',
  templateUrl: './datefilter.component.html',
  styleUrls: ['./datefilter.component.css']
})
export class DatefilterComponent implements OnInit {
  currentDate: any;
  fromDate: '';
  toDate: '';
  minDate: Date;
  maxDate: Date;
  showCallDateLabel: boolean;
  clonedObject: any = [];
  role: any;
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
    this.minDate = new Date(this._FileInfoService.filtercriteria.callDateRange.orgCallFromDate);
    this.maxDate = new Date(this._FileInfoService.filtercriteria.callDateRange.orgCallToDate);
    this.showCallDateLabel = (this._router.url.lastIndexOf("callTranscripts") < 0) && this.role!="Customer"  ? false : true;
  }
  //initcount() {
  //  this._FileInfoService.overallHeaderCount.totalfileInfoLength = this._FileInfoService.filesInfo[0].totalrecordcount;
  //  //var overallcountdata = JSON.parse(this._FileInfoService.overallHeaderCount);
  // // this._FileInfoService.overallHeaderCount.totalDuration = this.dataservice.formattime(overallcountdata.totalduration);
  //}

  //oninput change you need to do
  //changed() {
  //  this.twoWayRange = [...this.twoWayRange];
  //}

  //revertchanges() {
  //  this._FileInfoService.finalSelectedList = {
  //    "AgentName": null,
  //    "CustomerAccountNo": null,
  //    "CustomerPhoneNo": null,
  //    "ProgramName": null,
  //    "CallFromDate": null,
  //    "CallToDate": null,
  //    "UploadedFromDate": null,
  //    "UploadedToDate": null,
  //    "FileGuid": '',
  //    "TranscriptStatus": null  //void
  //  }
  //  this._FileInfoService.filesInfo = this._FileInfoService.originalfiledata;
  //  this._FileInfoService.filtercriteria.calldaterange.fromdate = new Date(this._FileInfoService.filtercriteria.calldaterange.orgCallFromDate);
  //  this._FileInfoService.filtercriteria.calldaterange.todate = new Date(this._FileInfoService.filtercriteria.calldaterange.orgCallToDate);
  //  this.initcount();
  //}


  applyCallDateChanges(form: NgForm) {
    this._FileInfoService.finalSelectedList.CallFromDate = this._FileInfoService.filtercriteria.callDateRange.callFromDate;
    this._FileInfoService.finalSelectedList.CallToDate = this._FileInfoService.filtercriteria.callDateRange.callToDate;
    //this._FileInfoService.dateformat = value;
    if (this._FileInfoService.finalSelectedList.CallFromDate != null || this._FileInfoService.finalSelectedList.CallToDate != null) {
      this._FileInfoService.callDateFilterApplied = true;
    }
    var fromdate = this._FileInfoService.filtercriteria.callDateRange.callFromDate;
    var todate = this._FileInfoService.filtercriteria.callDateRange.callToDate;
    if (this._router.url.lastIndexOf("callTranscripts") > 0) {
      this._FileInfoService.dateFilterApplied_Transcript.next({
        fromDate: fromdate,
        toDate: todate
      });
    } else if (this._router.url.lastIndexOf("callRecordings") > 0) {
      this._FileInfoService.dateFilterApplied_Recording.next({
        fromDate: fromdate,
        toDate: todate
      });
    }
    else if (this._router.url.lastIndexOf("disputedCalls") > 0) {
      this._FileInfoService.dateFilterApplied_DisputedCalls.next({
        fromDate: fromdate,
        toDate: todate
      });
    }
    else {
      this._FileInfoService.dateFilterApplied_AgentPerformance.next({
        fromDate: fromdate,
        toDate: todate
      });
    }
    this._FileInfoService.dateFiltersApplied = false;
    this._FileInfoService.disputedFilterApplied = false;
  }

}
