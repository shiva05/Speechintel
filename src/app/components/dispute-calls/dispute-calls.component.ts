import { Component, ViewContainerRef, ElementRef, OnInit } from '@angular/core';
import { AuthorizationService } from '../../shared/authorization.service';
import { DisputeCallsService } from './shared/dispute-calls.service';
import { FileInfoService } from '../call-recordings/shared/file-info.service';
import { FilterDropdownService } from '../filter-dropdown/shared/filter-dropdown.service';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';
import { Router, NavigationExtras } from '@angular/router';
import { Subscription } from 'rxjs';
import * as moment from 'moment';
import * as momentTz from 'moment-timezone';

@Component({
  selector: 'app-dispute-calls',
  templateUrl: './dispute-calls.component.html',
  styleUrls: ['./dispute-calls.component.css']
})
export class DisputeCallsComponent {
  disputedDateFilter: Subscription;
  public marginLeftValue = 0;
  selectedPage = 1;
  recindx = 0;
  totalCalls: number;
  openCalls: number;
  closedCalls: number;
  finalstatusfilter: boolean;
  disputeData: boolean = false;
  IsAgentDisputeView: boolean = false;
  IsSupervisorDisputeEdit: boolean = false;
  IsManagerDisputeEdit: boolean = false;
  IsFinalStatusDropDown: boolean = false;
  managerApproved: boolean;
  scoreChanged: number;
  supervisorStatusChanged: boolean;
  managerStatusChanged: boolean;
  currentMonth: any;
  totalpagecount: any = [];
  scoreValue = [];
  editDisputeCalls: boolean = false;
  filterDropdownDisplay: boolean;
  filterApplyed = false;
  finalstatus: any;
  selectedColumn = '';
  status = '';
  statusOpen = '';
  role = '';
  disputedCallList: any;
  ManagerComments: '';
  AgentName = "";
  SupervisorName = "";
  ManagerComment = "";
  AgentComment = "";
  SupervisorComment = "";
  ManagerName = "";
  ReadOnlyScreen: boolean = false;
  ApprovalAgentDispute = {
    "IsApproved": false,
    "SupervisorComment": "",
    "QAManagerName": "",
    "AgentComment": "",
    "Dispute_Phrase": "",
    "RecordIndex": 0
  }
  updatedDisputeScore = {
    "Dispute_Phrase": "",
    "ReasonForChange": '',
    "Changed_Weighted_Score": 0,
    "Call_Question_ScoreID": 0,
    "IsApproved": false,
    "IsActive": true,
    "Supervisor_Name": ""
  };
  totalAgentDisputes = [];
  totalUpdatedDisputes = [];
  //sorting
  key: string = 'Id';
  reverse: boolean = false;
  sortDate = false;
  sort(key) {
    this.key = key;
    this.reverse = !this.reverse;
  }
  property: string = '';
  iconToggle: boolean = true;
  sortBy(property) {
    this.property = property;
    this.iconToggle = !this.iconToggle;
  }
  sortByDate(key) {
    this.key = key;
    //this.reverse = !this.reverse;
    if (this.key == 'Requested_On') {
      this.sortDate = !this.sortDate;
      this.getSortDate(this.sortDate);
    }
  }
  getSortDate(reverse) {
    if (this.key === 'Requested_On') {
      this.disputedCallList = this.disputedCallList.sort((a, b) => {
        return (reverse) ? new Date(a.Requested_On).getTime() - new Date(b.Requested_On).getTime() : new Date(b.Requested_On).getTime() - new Date(a.Requested_On).getTime();
      })
    }
  }
  constructor(public auth: AuthorizationService,
    private _elementRef: ElementRef,
    public dipsuteCallsService: DisputeCallsService,
    public fileInfoService: FileInfoService,
    public toastr: ToastsManager,
    vRef: ViewContainerRef,
    private _router: Router,
    public _filterDropdownService: FilterDropdownService) {
    this.toastr.setRootViewContainerRef(vRef);
  }

  ngOnInit() {
    this.fileInfoService.finalSelectedList.AgentName = this.fileInfoService.finalDisputeCallFilterList.AgentName;
    this.fileInfoService.finalSelectedList.CustomerAccountNo = this.fileInfoService.finalDisputeCallFilterList.CustomerAccountNo;
    this.fileInfoService.finalSelectedList.CustomerPhoneNo = this.fileInfoService.finalDisputeCallFilterList.CustomerPhoneNo;
    this.fileInfoService.finalSelectedList.ProgramName = this.fileInfoService.finalDisputeCallFilterList.ProgramName;
    if (this.fileInfoService.finalDisputeCallFilterList.FinalStatus != null) {
      this.IsFinalStatusDropDown = true;
    }
    this.auth.navigatedFromDisputeCalls = false;
    //this.fileInfoService.finalDisputeCallFilterList = {
    //  "RecordIndex": 0,
    //  "FromDate": null,
    //  "ToDate": null,
    //  "AgentName": null,
    //  "CustomerAccountNo": null,
    //  "CustomerPhoneNo": null,
    //  "ProgramName": null,
    //  "FinalStatus": null
    //}
    this.disputeData = false;
    this.role = this.auth.UserProfiledetails.role.name;
    this.currentMonth = new Date();
    this.disputedDateFilter = this.fileInfoService.dateFilterApplied_DisputedCalls.subscribe(data => {
      this.fileInfoService.finalSelectedList.FileGuid = this.fileInfoService.finalSelectedList.UploadedToDate
        = this.fileInfoService.finalSelectedList.UploadedFromDate = null;
      this.fileInfoService.finalDisputeCallFilterList['FromDate'] = (moment(data.fromDate).format("YYYY-MM-DD"));
      this.fileInfoService.finalDisputeCallFilterList['ToDate'] = (moment(data.toDate).format("YYYY-MM-DD"));
      //this.isdatefilterapplied = true;
      this.selectedPage = 1;
      this.auth.UserSettings.pagination.selectedPageindex = 0; this.recindx = 0;
      this.getDisputedCallsData(this.fileInfoService.finalDisputeCallFilterList);
    });
    this.getDisputedCallsData(this.fileInfoService.finalDisputeCallFilterList);
  }
  selectedPageIndex(pageNum) {
    this.auth.UserSettings.pagination.selectedPageindex = pageNum - 1;
    this.disputedCallList = [];
    this.selectedPage = pageNum;
    this.recindx = (this.auth.UserSettings.pagination.pageSize * this.auth.UserSettings.pagination.selectedPageindex) + 1;
    this.ApprovalAgentDispute.RecordIndex = this.recindx;
    this.getDisputedCallsData(this.ApprovalAgentDispute);
  }
  firstPage() {
    this.auth.UserSettings.pagination.selectedPageindex = 1;
    this.selectedPageIndex(this.auth.UserSettings.pagination.selectedPageindex);
    this.marginLeftValue = -0;
  }
  lastPage() {
    this.auth.UserSettings.pagination.selectedPageindex = this.totalpagecount.length;
     this.selectedPageIndex(this.auth.UserSettings.pagination.selectedPageindex);
    this.marginLeftValue = -((this.auth.UserSettings.pagination.selectedPageindex - 9) * 40) + 30;
  }
  prevPageCount() {
    this.marginLeftValue = (40 * this.auth.UserSettings.pagination.selectedPageindex);
    if (this.auth.UserSettings.pagination.selectedPageindex >= 10) {
      this.marginLeftValue = -((this.auth.UserSettings.pagination.selectedPageindex - 9) * 40);
    } else {
      this.marginLeftValue = 0;
    }
     this.selectedPageIndex(this.auth.UserSettings.pagination.selectedPageindex);
  }

  nextPageCount() {
    this.auth.UserSettings.pagination.selectedPageindex = 2 + this.auth.UserSettings.pagination.selectedPageindex;
    if (this.auth.UserSettings.pagination.selectedPageindex >= 10) {
      this.marginLeftValue = -(40 * this.auth.UserSettings.pagination.selectedPageindex);
      this.marginLeftValue = -((this.auth.UserSettings.pagination.selectedPageindex - 9) * 40);
    }
     this.selectedPageIndex(this.auth.UserSettings.pagination.selectedPageindex);
  }
  disputedCallSelected(item) {
    this.auth.selectedFileToViewScore = item;
  }
  editFile(Guid, FileName, Status, FileIndex, apiSource) {
    this.auth.navigatedFromDisputeCalls = true;
    if (Status === 'Completed') {
      let navigationExtras: NavigationExtras = {
        queryParams: {
          guid: Guid,
          fileName: FileName,
          status: Status,
          //  fileIndex: FileIndex % this.authService.UserSettings.pagination.pageSize,
          fileIndex: FileIndex,
          apiSource: apiSource,
          navigatedFrom: 'disputedCalls'
        }
      }
      //reset pageindex to select correct page pagination

      this.auth.UserSettings.pagination.selectedPageindex = Math.ceil(FileIndex / this.auth.UserSettings.pagination.pageSize + 1);
      //this.authService.currentMenu.next('/dashboard/callTranscripts');
      this._router.navigate(['dashboard/callTranscripts'], navigationExtras);
      this.auth.navigationFromDisputedCalls = true;
    }
  }
  activemenu(menu) {
    this.auth.currentMenu = menu;
  }
  getDisputedCallsData(data) {
    this.disputedCallList = [];
    this.dipsuteCallsService.disupteCallsUpdate(data).subscribe((response) => {
      this.disputedCallList = JSON.parse(response["scoringdata"]);

      //console.log(this.disputedCallList);
      this.fileInfoService.overallHeaderCount.Jsondata = JSON.parse(JSON.parse(response["Jsondata"])[0]["overallHeaderCount"]);
      this.auth.UserSettings.pagination.pageSize = this.fileInfoService.overallHeaderCount.Jsondata["pageSize"];
      this.totalpagecount = [];
      var p1 = parseInt(this.fileInfoService.overallHeaderCount.Jsondata["TotalRecordCount"]);
      var p2 = parseInt(this.fileInfoService.overallHeaderCount.Jsondata["pageSize"]) + 1;
      var tct = Math.ceil(p1 / p2);
      for (var p = 1; p <= tct; this.totalpagecount.push({ pagemumber: p }), ++p);
      this.totalCalls = this.fileInfoService.overallHeaderCount.Jsondata["TotalRecordCount"];
      this.openCalls = this.fileInfoService.overallHeaderCount.Jsondata["OpenDisputedCount"];
      this.closedCalls = this.fileInfoService.overallHeaderCount.Jsondata["ClosedDisputedCount"];


      if (this.fileInfoService.overallHeaderCount.Jsondata["AgentName"] != null)
        var AgentNamesfromdb = this.fileInfoService.overallHeaderCount.Jsondata["AgentName"].split(",");
      let arr = [];
      for (let i = 0; i < AgentNamesfromdb.length; i++) {
        let obj = {};
        obj = {
          'selected': false,
          'name': AgentNamesfromdb[i],
        };
        arr.push(obj)
      }
      AgentNamesfromdb = arr;
      if (this.fileInfoService.overallHeaderCount.Jsondata["CustomerAccountNo"] != null)
        var customerAccountNumbersfromdb = this.fileInfoService.overallHeaderCount.Jsondata["CustomerAccountNo"].split(",");
      let arrAccounts = [];
      for (let i = 0; i < customerAccountNumbersfromdb.length; i++) {
        let obj = {};
        obj = {
          'selected': false,
          'name': customerAccountNumbersfromdb[i],
        };
        arrAccounts.push(obj)
      }
      customerAccountNumbersfromdb = arrAccounts;
      if (this.fileInfoService.overallHeaderCount.Jsondata["CustomerPhoneNo"] != null)
        var customerPhoneNumbersfromdb = this.fileInfoService.overallHeaderCount.Jsondata["CustomerPhoneNo"].split(",");
      let arrPhones = [];
      for (let i = 0; i < customerPhoneNumbersfromdb.length; i++) {
        let obj = {};
        obj = {
          'selected': false,
          'name': customerPhoneNumbersfromdb[i],
        };
        arrPhones.push(obj)
      }
      customerPhoneNumbersfromdb = arrPhones;
      if (this.fileInfoService.overallHeaderCount.Jsondata["ProgramName"] != null)
        var ProgramNamefromdb = this.fileInfoService.overallHeaderCount.Jsondata["ProgramName"].split(",");
      let arrProgram = [];
      for (let i = 0; i < ProgramNamefromdb.length; i++) {
        let obj = {};
        obj = {
          'selected': false,
          'name': ProgramNamefromdb[i].trim(),
        };
        arrProgram.push(obj);
      }
      ProgramNamefromdb = arrProgram;
    //first time display all the list
      if (this._filterDropdownService.customerFilterOptions.IsAgentNameSelected && this._filterDropdownService.customerFilterOptions.IsCustomerAccountSelected && this._filterDropdownService.customerFilterOptions.IsProgramNameSelected) {
        this._filterDropdownService.customerFilterOptions.customerPhoneNumbers = customerPhoneNumbersfromdb;
      }
      else if (this._filterDropdownService.customerFilterOptions.IsAgentNameSelected && this._filterDropdownService.customerFilterOptions.IsCustomerPhoneSelected && this._filterDropdownService.customerFilterOptions.IsProgramNameSelected) {
        this._filterDropdownService.customerFilterOptions.customerAccountNumbers = customerAccountNumbersfromdb;
      }
      else if (this._filterDropdownService.customerFilterOptions.IsCustomerAccountSelected && this._filterDropdownService.customerFilterOptions.IsCustomerPhoneSelected && this._filterDropdownService.customerFilterOptions.IsProgramNameSelected) {
        this._filterDropdownService.customerFilterOptions.AgentNames = AgentNamesfromdb;
      }
      else if (this._filterDropdownService.customerFilterOptions.IsAgentNameSelected && this._filterDropdownService.customerFilterOptions.IsCustomerAccountSelected && this._filterDropdownService.customerFilterOptions.IsCustomerPhoneSelected) {
        this._filterDropdownService.customerFilterOptions.ProgramName = ProgramNamefromdb;
      }
      else if (this._filterDropdownService.customerFilterOptions.IsAgentNameSelected) {
        this._filterDropdownService.customerFilterOptions.customerAccountNumbers = customerAccountNumbersfromdb;
        this._filterDropdownService.customerFilterOptions.customerPhoneNumbers = customerPhoneNumbersfromdb;
        this._filterDropdownService.customerFilterOptions.ProgramName = ProgramNamefromdb;
      }
      else if (this._filterDropdownService.customerFilterOptions.IsCustomerAccountSelected) {
        this._filterDropdownService.customerFilterOptions.AgentNames = AgentNamesfromdb;
        this._filterDropdownService.customerFilterOptions.customerPhoneNumbers = customerPhoneNumbersfromdb;
        this._filterDropdownService.customerFilterOptions.ProgramName = ProgramNamefromdb;
      }
      else if (this._filterDropdownService.customerFilterOptions.IsCustomerPhoneSelected) {
        this._filterDropdownService.customerFilterOptions.AgentNames = AgentNamesfromdb;
        this._filterDropdownService.customerFilterOptions.customerAccountNumbers = customerAccountNumbersfromdb;
        this._filterDropdownService.customerFilterOptions.ProgramName = ProgramNamefromdb;
      }
      else if (this._filterDropdownService.customerFilterOptions.IsProgramNameSelected) {
        this._filterDropdownService.customerFilterOptions.AgentNames = AgentNamesfromdb;
        this._filterDropdownService.customerFilterOptions.customerAccountNumbers = customerAccountNumbersfromdb;
        this._filterDropdownService.customerFilterOptions.customerPhoneNumbers = customerPhoneNumbersfromdb;
      }
      else {
        this._filterDropdownService.customerFilterOptions.customerPhoneNumbers = customerPhoneNumbersfromdb;
        this._filterDropdownService.customerFilterOptions.AgentNames = AgentNamesfromdb;
        this._filterDropdownService.customerFilterOptions.customerAccountNumbers = customerAccountNumbersfromdb;
        this._filterDropdownService.customerFilterOptions.ProgramName = ProgramNamefromdb;
      }
      if (this.fileInfoService.finalDisputeCallFilterList.FromDate != null && this.fileInfoService.finalDisputeCallFilterList.ToDate != null && this.fileInfoService.finalDisputeCallFilterList.FromDate.length > 0 && this.fileInfoService.finalDisputeCallFilterList.ToDate.length > 0) {
        this.fileInfoService.filtercriteria.callDateRange.callFromDate = new Date(moment(this.fileInfoService.overallHeaderCount.Jsondata["UploadedDateFromDate"]).format("MM/DD/YYYY"));
        this.fileInfoService.filtercriteria.callDateRange.callToDate = new Date(moment(this.fileInfoService.overallHeaderCount.Jsondata["UploadedToDate"]).format("MM/DD/YYYY"));
      }
    // this.obectMaking(this.customerFilterOptions.AgentNames);

      this.disputedCallList.forEach((e) => {
        e.ProgramName = e.ProgramName.toUpperCase(); // for sorting
        // sorting  of Q.No
        if (e.Question_No < 10) {
          e.Question_No = 0 + e.Question_No;
        }
        if (e.IsApprovedByManager == 1) {
          e.Status = "CSQAM_Approved ";
          e.finalStatus = 'Close';
        } else if (e.IsApprovedByManager == 0 && e.ManagerComments === null) {
          if (e.IsApprovedBySupervisor == 1) {
            e.Status = "CSTM_Approved ";
          } else if (e.IsApprovedBySupervisor == 0 && e.SupervisorComment === null) {
            e.Status = "Pending";
          } else if (e.IsApprovedBySupervisor == 0 && e.SupervisorComment != null) {
            e.Status = "CSTM_Rejected ";
          }
          e.finalStatus = 'Open';
        } else if (e.IsApprovedByManager == 0 && e.ManagerComments != null) {
          e.Status = "CSQAM_Rejected ";
          e.finalStatus = 'Close';
        }
      });
      // this.disputedCallList = this.disputedCallList.sort((a, b) => new Date(b.UploadedDate).getTime() - new Date(a.UploadedDate).getTime()); //sorting date
      if (this.disputedCallList == null || this.disputedCallList == undefined || this.disputedCallList.length == 0) {
        this.disputeData = true;
        this.toastr.error("No record found.");
      }
    },
      error => {
        this.toastr.error(error.message);
      },
      () => {

      })
  }

  ChangedCustomerStatus(event) {
    //   console.log(this.status);
  }
  ChangedSupervisorStatus(event) {
    this.supervisorStatusChanged = true;
    if (this.status === 'TM_Rejected') {
      this.updatedDisputeScore.IsApproved = false;
    } else if (this.status === 'TM_Approved') {
      this.updatedDisputeScore.IsApproved = true;
    }
  }
  ChangedManagerStatus(event) {
    this.managerStatusChanged = true;
    if (this.status === 'QAM_Rejected') {
      this.updatedDisputeScore.IsApproved = false;
    } else if (this.status === 'QAM_Approved') {
      this.updatedDisputeScore.IsApproved = true;
    }
  }
  agentDisputeView(item) {
    this.ApprovalAgentDispute = {
      "IsApproved": false,
      "SupervisorComment": "",
      "QAManagerName": "",
      "AgentComment": "",
      "Dispute_Phrase": "",
      "RecordIndex": 0
    }
    //this.ManagerName = this.ManagerComment = this.AgentComment = this.AgentName = this.SupervisorComment = this.SupervisorName = '';
    this.ManagerComment = item.ManagerComments;
    this.AgentComment = item.ReasonForChange;
    this.SupervisorComment = item.SupervisorComment;
    this.AgentName = item.AgentName;
    this.SupervisorName = item.SupervisorName;
    this.ManagerName = item.ManagerName;
    this.IsAgentDisputeView = true;
    this.status = item.Status;
    this.ApprovalAgentDispute.QAManagerName = item.ManagerName;
    this.ApprovalAgentDispute.SupervisorComment = item.SupervisorComment;
    this.ApprovalAgentDispute.AgentComment = item.ReasonForChange;
    this.ApprovalAgentDispute.Dispute_Phrase = item.Dispute_Phrase;
    this.ReadOnlyScreen = true;
  }
  superVisordisputeCallsEdit(item) {
    this.supervisorStatusChanged = false;
    this.ApprovalAgentDispute = {
      "IsApproved": false,
      "SupervisorComment": "",
      "QAManagerName": "",
      "AgentComment": "",
      "Dispute_Phrase": "",
      "RecordIndex": 0
    }

    if (item.ManagerComments != null) {
      this.managerApproved = true;
    } else {
      this.managerApproved = false;
    }
    this.ManagerComment = item.ManagerComments;
    this.AgentComment = item.ReasonForChange;
    this.SupervisorComment = item.SupervisorComment;
    this.AgentName = item.AgentName;
    this.SupervisorName = item.SupervisorName;
    this.ManagerName = item.ManagerName;
    this.scoreValue = JSON.parse(item.PossibleScoreValue);
    this.status = item.Status;
    this.ApprovalAgentDispute.QAManagerName = item.ManagerName;
    this.ApprovalAgentDispute.SupervisorComment = item.SupervisorComment;
    this.ApprovalAgentDispute.AgentComment = item.ReasonForChange;
    this.ApprovalAgentDispute.Dispute_Phrase = item.Dispute_Phrase;
    this.updatedDisputeScore.Dispute_Phrase = this.ApprovalAgentDispute.Dispute_Phrase;
    this.updatedDisputeScore.Changed_Weighted_Score = item.Changed_Weighted_Score;
    this.updatedDisputeScore.Call_Question_ScoreID = item.Call_Question_ScoreID;
    this.updatedDisputeScore.Supervisor_Name = item.SupervisorName;
    this.IsSupervisorDisputeEdit = true;
    this.ReadOnlyScreen = true;
    // console.log(this.updatedDisputeScore);
  }
  managerdisputeCallsEdit(item) {
    this.managerStatusChanged = false;
    this.ApprovalAgentDispute = {
      "IsApproved": false,
      "SupervisorComment": "",
      "QAManagerName": "",
      "AgentComment": "",
      "Dispute_Phrase": "",
      "RecordIndex": 0
    }
    this.ManagerName =   this.AgentName = this.SupervisorName = '';
    this.ManagerComment = this.AgentComment = this.SupervisorComment = null;
    this.ManagerComment = item.ManagerComments;
    this.AgentComment = item.ReasonForChange;
    this.SupervisorComment = item.SupervisorComment;
    this.AgentName = item.AgentName;
    this.SupervisorName = item.SupervisorName;
    this.ManagerName = item.ManagerName;
    this.status = item.Status;
    this.scoreValue = JSON.parse(item.PossibleScoreValue);
    this.ApprovalAgentDispute.QAManagerName = item.ManagerName;
    this.ApprovalAgentDispute.SupervisorComment = item.SupervisorComment;
    this.updatedDisputeScore.Changed_Weighted_Score = this.scoreChanged;
    this.ApprovalAgentDispute.AgentComment = item.ReasonForChange;
    this.ManagerComments = item.ManagerComments;
    this.ApprovalAgentDispute.Dispute_Phrase = item.Dispute_Phrase;
    this.updatedDisputeScore.Dispute_Phrase = this.ApprovalAgentDispute.Dispute_Phrase;
    this.updatedDisputeScore.ReasonForChange = this.ApprovalAgentDispute.AgentComment;
    this.updatedDisputeScore.Call_Question_ScoreID = item.Call_Question_ScoreID;
    this.updatedDisputeScore.Supervisor_Name = item.SupervisorName;
    this.IsManagerDisputeEdit = true;
  }
  closePopup() {
    this.IsAgentDisputeView = false;
    this.IsSupervisorDisputeEdit = false;
    this.IsManagerDisputeEdit = false;
  }
  approvalSupervisorDispute() {
    this.updatedDisputeScore.ReasonForChange = this.ApprovalAgentDispute.SupervisorComment;
    this.totalUpdatedDisputes.push(this.updatedDisputeScore);
    this.dipsuteCallsService.disputeApprovalUpdate(this.totalUpdatedDisputes).subscribe((response) => {
      this.toastr.success("Calls updated successfully");
      this.totalUpdatedDisputes = [];
    });
    this.getDisputedCallsData(this.ApprovalAgentDispute);
    this.IsSupervisorDisputeEdit = false;
  }
  getvalue() {
    //console.log(this.scoreChanged)
  }

  approvalManagerDispute() {
    this.updatedDisputeScore.Changed_Weighted_Score = JSON.parse(this.scoreChanged + " ");
    this.updatedDisputeScore.ReasonForChange = this.ManagerComments;
    // this.totalAgentDisputes.push(this.ApprovalAgentDispute);
    this.totalUpdatedDisputes.push(this.updatedDisputeScore);
    this.dipsuteCallsService.disputeApprovalUpdate(this.totalUpdatedDisputes).subscribe((response) => {
      this.toastr.success("Reviewed score updated successfully");
      this.totalUpdatedDisputes = [];
    });
    this.getDisputedCallsData(this.ApprovalAgentDispute);
    this.IsManagerDisputeEdit = false;
   // this.refresh();
  }
  refresh() {
    this.recindx = 0;
    this.auth.UserSettings.pagination.selectedPageindex = 0;
    this.selectedPage = 1;
    this.getDisputedCallsData(this.ApprovalAgentDispute);
  }

  downloadDisputedCallsSheet() {
    const headers = new Headers({
      'Content-Type': 'text/csv',
    });
    const options = {
      responseType: "arraybuffer",
      headers: headers
    };

    this.dipsuteCallsService.disputedCallsDownloadSheet(this.ApprovalAgentDispute, options).subscribe(blob => {
      let saveAs = require('file-saver');
      let b: any = new Blob([blob], { type: 'text/csv' });
      saveAs.saveAs(b, `DisputedcallsSheet.csv`);

    }, (err) => {
      this.toastr.error(err.message);
    },
      () => {
        //this.loading = false;
      }

    );
  }

  objectMaking(obj) {
    newObjSet = {
      "item_id": null,
      "item_text": ''
    }
    if (this._filterDropdownService.selectedFilterOptions[obj].length === 0) {
      this._filterDropdownService.selectedItems = [];
    }
    this._filterDropdownService.dropdownList = [];
    if (obj === 'AgentName') {
      obj = this._filterDropdownService.customerFilterOptions.AgentNames;
      this._filterDropdownService.catagoryList = 'AgentName';
      this._filterDropdownService.filterPlaceHolder = 'Agent Name';
      this._filterDropdownService.selectedFilterItems.AgentName = this._filterDropdownService.dropdownList;
    } else if (obj === 'CustomerAccountNo') {
      obj = this._filterDropdownService.customerFilterOptions.customerAccountNumbers;
      this._filterDropdownService.catagoryList = 'CustomerAccountNo';
      this._filterDropdownService.filterPlaceHolder = 'Customer Account No';
      this._filterDropdownService.selectedFilterItems.CustomerAccountNo = this._filterDropdownService.dropdownList;
    } else if (obj === 'CustomerPhoneNo') {
      obj = this._filterDropdownService.customerFilterOptions.customerPhoneNumbers;
      this._filterDropdownService.catagoryList = 'CustomerPhoneNo';
      this._filterDropdownService.filterPlaceHolder = 'Customer Phone No';
      this._filterDropdownService.selectedFilterItems.CustomerPhoneNo = this._filterDropdownService.dropdownList;
    } else if (obj === 'ProgramName') {
      obj = this._filterDropdownService.customerFilterOptions.ProgramName;
      this._filterDropdownService.catagoryList = 'ProgramName';
      this._filterDropdownService.filterPlaceHolder = 'Program Name';
      this._filterDropdownService.selectedFilterItems.ProgramName = this._filterDropdownService.dropdownList;
    }
    else {
      obj = obj;
    }
    for (var set = 0; set < obj.length; set++) {
      var newObjSet = {
        "item_id": set + 1,
        "item_text": obj[set].name
      }
      this._filterDropdownService.dropdownList.push(newObjSet);
    }
    this._filterDropdownService.dataSet = true;
   
  }
  getFilterData(type) {
   // this.IsFinalStatusDropDown = !this.IsFinalStatusDropDown;
    this.fileInfoService.disputedFilterApplied = !this.fileInfoService.disputedFilterApplied;
    this.selectedColumn = type;
    this.filterDropdownDisplay = !this.filterDropdownDisplay;
    this._filterDropdownService.selectedItems = this._filterDropdownService.selectedFilterOptions[type];
    if (this.filterApplyed) {
      this._filterDropdownService.selectedFilterOptions[type] = this._filterDropdownService.selectedItems;
      this._filterDropdownService.selectedFilterItems[type] = this._filterDropdownService.selectedItems;
    }
    this._filterDropdownService.filterDropdownSelection_agent.next(this._filterDropdownService.dropdownList);
    if (type !== 'All') {
      this._filterDropdownService.catagoryList = type;
    }
    if (this._filterDropdownService.selectedFilterOptions.AgentName.length > 0 && type == 'AgentName') {
      this.convertObjectToNewString('AgentName');
      this._filterDropdownService.customerFilterOptions.IsAgentNameSelected = true;

    } else {
      this._filterDropdownService.customerFilterOptions.IsAgentNameSelected = false;
    }
    if (this._filterDropdownService.selectedFilterOptions.CustomerAccountNo.length > 0 && type == 'CustomerAccountNo') {
      this.convertObjectToNewString('CustomerAccountNo');
      this._filterDropdownService.customerFilterOptions.IsCustomerAccountSelected = true;
      this._filterDropdownService.selectedFilterItems.CustomerAccountNo = this._filterDropdownService.dropdownList;
    } else {
      this._filterDropdownService.customerFilterOptions.IsCustomerAccountSelected = false;
    }
    if (this._filterDropdownService.selectedFilterOptions.CustomerPhoneNo.length > 0 && type == 'CustomerPhoneNo') {
      this.convertObjectToNewString('CustomerPhoneNo');
      this._filterDropdownService.customerFilterOptions.IsCustomerPhoneSelected = true;
    } else {
      this._filterDropdownService.customerFilterOptions.IsCustomerPhoneSelected = false;
    }
    if (this._filterDropdownService.selectedFilterOptions.ProgramName.length > 0 && type == 'ProgramName') {
      this.convertObjectToNewString('ProgramName');
      this._filterDropdownService.customerFilterOptions.IsProgramNameSelected = true;
      this._filterDropdownService.selectedFilterItems.ProgramName = this._filterDropdownService.dropdownList;
    } else {
      this._filterDropdownService.customerFilterOptions.IsProgramNameSelected = false;
    }
    if (this.selectedColumn == 'FinalStatus') {
     // this._filterDropdownService.selectedFilterOptions.FinalStatus = this.statusOpen;
      console.log(this.statusOpen);
    }
    this.objectMaking(this._filterDropdownService.catagoryList);
    if (this.filterApplyed) {
      this.getDisputedCallsData(this.fileInfoService.finalDisputeCallFilterList);
      this.filterApplyed = false;
    }
    // }
  }
  clearFilterData(type) {
    this._filterDropdownService.selectedFilterOptions[type] = this._filterDropdownService.selectedItems= [];
    this.fileInfoService.finalDisputeCallFilterList[type] = null;
    this.fileInfoService.finalDisputeCallFilterList[type] = null;
    this.filterApplyed = true;
    if (type === 'Requested_On') {
      this.fileInfoService.finalDisputeCallFilterList.FromDate = this.fileInfoService.finalDisputeCallFilterList.ToDate = null;
      this.fileInfoService.callDateFilterApplied = false;
    }
    this.getFilterData(type);
  }
  applyfilter(type) {
    this.filterApplyed = true;
    this.fileInfoService.filtersFromDisputedCalls = true;
    this.getFilterData(type);
   // this.getDisputedCallsData(this.fileInfoService.finalDisputeCallFilterList);
  //  console.log(this.fileInfoService.finalDisputeCallFilterList);
  }
  finalstatusFilter() {
    this.finalstatusfilter = !this.finalstatusfilter;
  }
  clearFinalstatusFilter() {
    this.finalstatusfilter = this.IsFinalStatusDropDown = false;
    this.fileInfoService.finalDisputeCallFilterList.FinalStatus = null;
    this.getDisputedCallsData(this.fileInfoService.finalDisputeCallFilterList);
  }
  checkFinalStatus() {
    this.finalstatusfilter = false;
    this.IsFinalStatusDropDown = true;
    if (this.finalstatus === 'open') {
      this.fileInfoService.finalDisputeCallFilterList.FinalStatus = 1;
    } else if (this.finalstatus === 'close') {
      this.fileInfoService.finalDisputeCallFilterList.FinalStatus = 0;
    }
    this.getDisputedCallsData(this.fileInfoService.finalDisputeCallFilterList);
    //console.log(this.fileInfoService.finalDisputeCallFilterList);
  }
  convertObjectToNewString(type) {
    var Newstring = '';
    for (var strn = 0; strn < this._filterDropdownService.selectedFilterOptions[type].length; strn++) {
      if (Newstring === '') {
        Newstring = this._filterDropdownService.selectedFilterOptions[type][strn].item_text;
      } else {
        Newstring += ',' + this._filterDropdownService.selectedFilterOptions[type][strn].item_text;
      }
    }
    if (this.filterApplyed === true) {
      this.fileInfoService.finalSelectedList[type] = Newstring;
      this.fileInfoService.finalDisputeCallFilterList[type] = Newstring;
    }
    else {
      this.fileInfoService.finalSelectedList[type] = null;
      this.fileInfoService.finalDisputeCallFilterList[type] = null;
    }
  }
  ngOnDestroy() {
    this.fileInfoService.filtersFromDisputedCalls = false;
    this._filterDropdownService.selectedFilterOptions = {
      AgentName: [],
      CustomerPhoneNo: [],
      CustomerAccountNo: [],
      ProgramName: [],
      DisputeStatus: [],
      FinalStatus: []
    }
  }
}
