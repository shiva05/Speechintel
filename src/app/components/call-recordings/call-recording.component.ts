import { Component, OnInit, ViewContainerRef, OnDestroy } from '@angular/core';
import { DOCUMENT } from '@angular/platform-browser';
import { Inject } from '@angular/core';
import { FileInfoService } from './shared/file-info.service';
import { Router, NavigationExtras } from '@angular/router';
import { FileInfo } from './fileInfo.interface';
import { FilterDropdownService } from '../filter-dropdown/shared/filter-dropdown.service';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { DataService } from '../../shared/data.service';
import { LambdaTriggerService } from '../../shared/lambda-trigger.service';
import { AuthorizationService } from '../../shared/authorization.service';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';
import { environment } from '../../../environments/environment';
import * as moment from 'moment';
import * as momentTz from 'moment-timezone';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/map';
import { ProfileService } from '../profile/shared/profile.service';
import * as jwt_decode from 'jwt-decode';
import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';
import * as _ from 'underscore';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-call-recording',
  templateUrl: './call-recording.component.html',
  styleUrls: ['./call-recording.component.css']
})

@Pipe({
  name: 'orderBy'
})

export class CallRecordingsComponent implements OnInit, OnDestroy {
  config: any;
  selectedColumn: '';
  filterDropdownDisplay: boolean;
  filterApplyed: boolean;
  isDesc: boolean = false;
  totalpagecount: any = [];
  searchText: string;
  // filesInfo: any = [];
  totalfilesInfo: any = [];
  loading = true;
  smallLoader = true;
  retryLoader = false;
  fileInfoLength: number;
  uploadedTimeArray: string[] = [];
  selectedListCount = 'All';
  isTilesChanged = false;
  linkToCopy: string;
  private dom: Document;
  txtArea: any;
  modalRef: NgbModalRef;
  curfileToDelete: string;
  curfileGuidToDelete: string;
  statusMessage: string;
  successValue = false;
  failureValue = false;
  isLeftSideFilterApplied: boolean = false;
  pagesCount: any;
  recindx = 0;
  selectedPage = 1;
  marginLeft = 0;
  selectedAllCheckbox: any;
  api;
  selecteditem: number;
  //pagination
  public marginLeftValue = 0;
  jobId: string; // for delete the job from aws / watson

  dateFilterRecording: Subscription;
  uploadedDateFilterRecording: Subscription;
  agentValue = false;
  phonevalues = false;
  accountValues = false;
  allAgents = false;
  allAccountNos = false;
  allPhoneNos = false;
  // overallHeaderCount = { totalfileInfoLength: 0, totalDuration: '', pageNavigationCount: 0, totalCompletedLength: 0, totalProcessingLength: 0 };
  map: any = {};
  isdatefilterapplied = false;
  //sorting
  key: string = 'UploadedDate';
  reverse: boolean = false;
  sortDate = false;
  sortSize = false;
  sort(key) {
    this.key = key;
    this.reverse = !this.reverse;
  }
  sortBySize(key) {
    this.key = key;
    this.sortSize = !this.sortSize;
    this.fileInfoService.filesInfo = this.fileInfoService.filesInfo.sort((a, b) => {
      return (this.sortSize) ? a.Size - b.Size : b.Size - a.Size;
    });
  }
  sortByDate(key) {
    this.key = key;
    if (this.key == 'CallDate' || this.key == 'UploadedDate') {
      this.sortDate = !this.sortDate;
      this.getSortDate(this.sortDate);
    }
  }
  getSortDate(reverse) {
    if (this.key === 'CallDate') {
      this.fileInfoService.filesInfo = this.fileInfoService.filesInfo.sort((a, b) => {
        return (reverse) ? new Date(a.CallDate).getTime() - new Date(b.CallDate).getTime() : new Date(b.CallDate).getTime() - new Date(a.CallDate).getTime()
      })
    }
    else if (this.key === 'UploadedDate') {
      this.fileInfoService.filesInfo = this.fileInfoService.filesInfo.sort((a, b) => {
        return (reverse) ? new Date(a.UploadedDate).getTime() - new Date(b.UploadedDate).getTime() : new Date(b.UploadedDate).getTime() - new Date(a.UploadedDate).getTime()
      })
    }
  }
  role: any;
  loadmoreflag: boolean = false;
  column: string = '';
  constructor(public fileInfoService: FileInfoService,
    private modalService: NgbModal, private _profileService: ProfileService,
    private _router: Router,
    public dataService: DataService,
    @Inject(DOCUMENT) dom: Document,
    public authService: AuthorizationService, public _filterDropdownService: FilterDropdownService,
    private lambdaService: LambdaTriggerService, public toastr: ToastsManager, vRef: ViewContainerRef) {
    this.dom = dom;
    //toastr
    this.toastr.setRootViewContainerRef(vRef);
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
    this.selectedColumn = type;
    this.fileInfoService.dateFiltersApplied = !this.fileInfoService.dateFiltersApplied;
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
      this._filterDropdownService.selectedFilterItems.AgentName = this._filterDropdownService.dropdownList;
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
    // if (!this._filterDropdownService.customerFilterOptions.IsCustomerPhoneSelected && !this._filterDropdownService.customerFilterOptions.IsCustomerAccountSelected && !this._filterDropdownService.customerFilterOptions.IsAgentNameSelected && !this._filterDropdownService.customerFilterOptions.IsProgramNameSelected) {
    this.objectMaking(this._filterDropdownService.catagoryList);
    if (this.filterApplyed) {
      this.getFileInfo();
      this.filterApplyed = false;
    }
    // }
  }
  clearFilterData(type) {
    this._filterDropdownService.selectedFilterOptions[type] = [];
    this.fileInfoService.finalSelectedList[type] = null;
    this.filterApplyed = true;
    if (type === 'CallDate') {
      this.fileInfoService.finalSelectedList.CallFromDate = this.fileInfoService.finalSelectedList.CallToDate = null;
      this.fileInfoService.callDateFilterApplied = false;
    }
    if (type === 'UploadedDate') {
      this.fileInfoService.finalSelectedList.UploadedFromDate = this.fileInfoService.finalSelectedList.UploadedToDate = null;
      this.fileInfoService.uploadFilterApplied = false;
    }
    this.getFilterData(type);
  }
  applyfilter(type) {
    this.filterApplyed = true;
    this.getFilterData(type);
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
    this.fileInfoService.finalSelectedList[type] = Newstring;
  }
  ngOnInit() {
    this.fileInfoService.callDateFilterApplied = false;
    this.fileInfoService.uploadFilterApplied = false;
    this.authService.selectedRadioButtonValue = 'All';
    this.isdatefilterapplied = false; this.isLeftSideFilterApplied = false;
    this.selectedPage = 1;
    this.authService.UserSettings.pagination.selectedPageindex = 0; this.recindx = 0;
    this.fileInfoService.filtercriteria.callDateRange.callFromDate = this.fileInfoService.filtercriteria.callDateRange.orgCallFromDate = null;
    this.fileInfoService.filtercriteria.callDateRange.callToDate = this.fileInfoService.filtercriteria.callDateRange.orgCallToDate = null;
    this.fileInfoService.filtercriteria.callDateRange.uploadedFromDate = this.fileInfoService.filtercriteria.callDateRange.orgUploadedFromDate = null;
    this.fileInfoService.filtercriteria.callDateRange.uploadedToDate = this.fileInfoService.filtercriteria.callDateRange.orgUploadedToDate = null;
    this.fileInfoService.finalSelectedList = {
      "AgentName": null,
      "CustomerAccountNo": null,
      "CustomerPhoneNo": null,
      "ProgramName": null,
      "CallFromDate": null,
      "CallToDate": null,
      "UploadedFromDate": null,
      "UploadedToDate": null,
      "TranscriptStatus": 0, //all
      "FileGuid": ''
    }
    this.fileInfoService.overallHeaderCount.pageNavigationCount = 0;

    let decod = jwt_decode(this.authService.getToken());
    this.authService.UserProfiledetails.role.name = decod['userRole'];
    this.role = this.authService.UserProfiledetails.role.name;
    this.fileInfoService.originalfiledata = []; this.fileInfoService.filesInfo = [];
    this.authService.UserSettings.pagination.selectedPageindex = 0; this.recindx = 0;
    this.totalfilesInfo = [];
    if (this.role === 'Customer_Agent') {
      this.key = 'CallDate';
      this.column = 'CallDate';
    } else {
      this.key = 'UploadedDate';
      this.column = 'UploadedDate';
    }

    this.dateFilterRecording = this.fileInfoService.dateFilterApplied_Recording.subscribe(data => {
      this.fileInfoService.finalSelectedList.FileGuid = this.fileInfoService.finalSelectedList.UploadedToDate
        = this.fileInfoService.finalSelectedList.UploadedFromDate = null;
      this.fileInfoService.finalSelectedList['CallFromDate'] = (moment(data.fromDate).format("YYYY-MM-DD"));

      this.fileInfoService.finalSelectedList['CallToDate'] = (moment(data.toDate).format("YYYY-MM-DD"));
      this.isdatefilterapplied = true;
      this.selectedPage = 1;
      this.authService.UserSettings.pagination.selectedPageindex = 0; this.recindx = 0;

      //this.isLeftSideFilterApplied = false;
      this.getFileInfo();
    });

    this.uploadedDateFilterRecording = this.fileInfoService.UploadedDateFilterApplied_Recording.subscribe(data => {
      this.fileInfoService.finalSelectedList.FileGuid = this.fileInfoService.finalSelectedList.CallFromDate = this.fileInfoService.finalSelectedList.CallToDate = null;
      this.fileInfoService.finalSelectedList['UploadedFromDate'] = (moment(data.fromDate).format("YYYY-MM-DD"));

      this.fileInfoService.finalSelectedList['UploadedToDate'] = (moment(data.toDate).format("YYYY-MM-DD"));
      this.isdatefilterapplied = true;
      this.selectedPage = 1;
      this.authService.UserSettings.pagination.selectedPageindex = 0; this.recindx = 0;
      // this.isLeftSideFilterApplied = false;
      this.getFileInfo();
    });

    if (!this.isdatefilterapplied && !this.authService.navBackToCallRecordings) {
      this.getFileInfo();
    }

    if (this.authService.navBackToCallRecordings) {
      this.fileInfoService.finalSelectedList = JSON.parse(localStorage.getItem('filter'));
      localStorage.removeItem('filter');
      this.getFileInfo();
    }
  }
  // Declare local variable
  direction: number;

 
  selectedvalueToviewScore(item) {
    this.authService.selectedFileToViewScore = item;
  }

  selectedPageIndex(pageNum) {
    this.isTilesChanged = true;
    this.authService.UserSettings.pagination.selectedPageindex = pageNum - 1;
    this.fileInfoService.filesInfo = [];
    this.selectedPage = pageNum;
    this.isTilesChanged = true;
    this.recindx = (this.authService.UserSettings.pagination.pageSize * this.authService.UserSettings.pagination.selectedPageindex) + 1;
    this.getFileInfo();
  }
  firstPage() {
    this.authService.UserSettings.pagination.selectedPageindex = 1;
    this.selectedPageIndex(this.authService.UserSettings.pagination.selectedPageindex);
    this.marginLeftValue = -0;
  }
  lastPage() {
    this.authService.UserSettings.pagination.selectedPageindex = this.totalpagecount.length;
    this.selectedPageIndex(this.authService.UserSettings.pagination.selectedPageindex);
    this.marginLeftValue = -((this.authService.UserSettings.pagination.selectedPageindex - 9) * 40) + 30;
  }
  prevPageCount() {
    this.marginLeftValue = (40 * this.authService.UserSettings.pagination.selectedPageindex);
    if (this.authService.UserSettings.pagination.selectedPageindex >= 10) {
      this.marginLeftValue = -((this.authService.UserSettings.pagination.selectedPageindex - 9) * 40);
    } else {
      this.marginLeftValue = 0;
    }
    this.selectedPageIndex(this.authService.UserSettings.pagination.selectedPageindex);
  }

  nextPageCount() {
    this.authService.UserSettings.pagination.selectedPageindex = 2 + this.authService.UserSettings.pagination.selectedPageindex;
    if (this.authService.UserSettings.pagination.selectedPageindex >= 10) {
      //  this.marginLeftValue = -(40 * this.authService.UserSettings.pagination.selectedPageindex);
      this.marginLeftValue = -((this.authService.UserSettings.pagination.selectedPageindex - 9) * 40);
    }
    this.selectedPageIndex(this.authService.UserSettings.pagination.selectedPageindex);
  }
  unique(arr) {
    const result = [];
    arr.forEach(function (item) {
      if (result.filter(r => r.name === item.name).length === 0) {
        result.push(item);
      }
    });
    return result;
  }

  

  convertArrayIntoString(type) {
    if (this._filterDropdownService.selectedFilterOptions[type].length == 0) {
      this.fileInfoService.finalSelectedList[type] = '';
    }
    else {
      for (let i = 0; i < this._filterDropdownService.selectedFilterOptions[type].length; i++) {
        if (i == 0) {
          this.fileInfoService.finalSelectedList[type] = '';
          this.fileInfoService.finalSelectedList[type] = this.fileInfoService.finalSelectedList[type] + this._filterDropdownService.selectedFilterOptions[type][i];
        } else {
          this.fileInfoService.finalSelectedList[type] = this.fileInfoService.finalSelectedList[type] + ',' + this._filterDropdownService.selectedFilterOptions[type][i];
        }
      }
    }
    this._filterDropdownService.customerFilterOptions.IsAgentNameSelected = this._filterDropdownService.selectedFilterOptions.AgentName.length > 0 ? true : false;
    this._filterDropdownService.customerFilterOptions.IsCustomerAccountSelected = this._filterDropdownService.selectedFilterOptions.CustomerAccountNo.length > 0 ? true : false;
    this._filterDropdownService.customerFilterOptions.IsCustomerPhoneSelected = this._filterDropdownService.selectedFilterOptions.CustomerPhoneNo.length > 0 ? true : false;

    this.getFileInfo();
  }

  initCount() {
    // this.customerFilterOptions.AgentNames = this.customerFilterOptions.customerAccountNumbers = this.customerFilterOptions.customerPhoneNumbers = [];
    if (!this.isTilesChanged) {  //don't change 
      this.fileInfoService.overallHeaderCount.totalfileInfoLength = this.fileInfoService.overallHeaderCount.Jsondata["TotalRecordCount"];
      this.fileInfoService.overallHeaderCount.totalCompletedLength = this.fileInfoService.overallHeaderCount.Jsondata["totalCompletedLength"];
      this.fileInfoService.overallHeaderCount.totalProcessingLength = this.fileInfoService.overallHeaderCount.Jsondata["totalProcessingLength"];
    }

    this.isTilesChanged = false;
    // var overallcountdata = JSON.parse(this.fileInfoService.filesInfo[0].overallHeaderCount);
    this.fileInfoService.overallHeaderCount.totalDuration = this.dataService.formatTime(this.fileInfoService.overallHeaderCount.Jsondata["totalDuration"]);

    if (!this.isdatefilterapplied) {  //don't update calendar date again after making filter
      this.fileInfoService.filtercriteria.callDateRange.callFromDate = new Date(moment(this.fileInfoService.overallHeaderCount.Jsondata["CallDateFromDate"]).format("MM/DD/YYYY"));
      this.fileInfoService.filtercriteria.callDateRange.callToDate = new Date(moment(this.fileInfoService.overallHeaderCount.Jsondata["CallDateToDate"]).format("MM/DD/YYYY"));
      this.fileInfoService.filtercriteria.callDateRange.uploadedFromDate = new Date(moment(this.fileInfoService.overallHeaderCount.Jsondata["UploadedDateFromDate"]).format("MM/DD/YYYY"));
      this.fileInfoService.filtercriteria.callDateRange.uploadedToDate = new Date(moment(this.fileInfoService.overallHeaderCount.Jsondata["UploadedToDate"]).format("MM/DD/YYYY"));
      this.fileInfoService.filtercriteria.callDateRange.orgCallFromDate = this.fileInfoService.filtercriteria.callDateRange.callFromDate;
      this.fileInfoService.filtercriteria.callDateRange.orgCallToDate = this.fileInfoService.filtercriteria.callDateRange.callToDate;
      this.fileInfoService.filtercriteria.callDateRange.orgUploadedFromDate = this.fileInfoService.filtercriteria.callDateRange.uploadedFromDate;
      this.fileInfoService.filtercriteria.callDateRange.orgUploadedToDate = this.fileInfoService.filtercriteria.callDateRange.uploadedToDate;
    }
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
    if (this.fileInfoService.finalSelectedList.UploadedFromDate != null && this.fileInfoService.finalSelectedList.UploadedToDate != null && this.fileInfoService.finalSelectedList.UploadedFromDate.length > 0 && this.fileInfoService.finalSelectedList.UploadedToDate.length > 0) {
      this.fileInfoService.filtercriteria.callDateRange.callFromDate = new Date(moment(this.fileInfoService.overallHeaderCount.Jsondata["CallDateFromDate"]).format("MM/DD/YYYY"));
      this.fileInfoService.filtercriteria.callDateRange.callToDate = new Date(moment(this.fileInfoService.overallHeaderCount.Jsondata["CallDateToDate"]).format("MM/DD/YYYY"));
    }
    if (this.fileInfoService.finalSelectedList.CallFromDate != null && this.fileInfoService.finalSelectedList.CallToDate != null && this.fileInfoService.finalSelectedList.CallFromDate.length > 0 && this.fileInfoService.finalSelectedList.CallToDate.length > 0) {
      this.fileInfoService.filtercriteria.callDateRange.uploadedFromDate = new Date(moment(this.fileInfoService.overallHeaderCount.Jsondata["UploadedDateFromDate"]).format("MM/DD/YYYY"));
      this.fileInfoService.filtercriteria.callDateRange.uploadedToDate = new Date(moment(this.fileInfoService.overallHeaderCount.Jsondata["UploadedToDate"]).format("MM/DD/YYYY"));
    }
  }



  getFileInfo() {  // To get the information of the files to display in the table in the dashboard/home page.
    this.fileInfoService.originalfiledata = [];
    this.fileInfoService.filesInfo = [];
  
    this.loading = true;
    this.smallLoader = true;

    this.fileInfoService.getFileInfo(this.recindx, false, this.fileInfoService.finalSelectedList).subscribe(data => {
      if (data == null || data == undefined || data["FileInfo"].length == 0) {
        this.toastr.error('No record found!');
        this.loading = false;
        this.smallLoader = false;
        this.fileInfoService.filtercriteria.callDateRange.uploadedToDate = this.fileInfoService.filtercriteria.callDateRange.uploadedFromDate =
          this.fileInfoService.filtercriteria.callDateRange.callToDate = this.fileInfoService.filtercriteria.callDateRange.callFromDate = '';
        return;
      }
      data["FileInfo"].forEach(element => {
        element["isActive"] = false;
        const filedocx = element.Guid.replace('mp3', 'docx'); // we need to call the API with the guid having docx extension
        this.dataService.downloadLinks.set(element.Guid, `${environment.download_Api}/${filedocx}`);

        this.fileInfoService.filesInfo.push(element);
        if (this.totalfilesInfo.filter(f => f.Guid === element.Guid).length == 0)
          this.totalfilesInfo.push(element); //duplicate array

        if (this.fileInfoService.originalfiledata.filter(f => f.Guid === element.Guid).length == 0)
          this.fileInfoService.originalfiledata.push(element);
      });
      this.fileInfoLength = this.fileInfoService.filesInfo.length;
     // this.fileInfoService.filesInfo = this.fileInfoService.filesInfo.sort((a, b) => new Date(b.UploadedDate).getTime() - new Date(a.UploadedDate).getTime()); //sorting date
      this.fileInfoService.overallHeaderCount.Jsondata = JSON.parse(data["Jsondata"]);
      this.initCount();
      this.authService.UserSettings.pagination.pageSize = this.fileInfoService.overallHeaderCount.Jsondata["pageSize"];
      //this.loadmoreflag = data.length >= this.PageSize;
      this.totalpagecount = [];
      var p1 = parseInt(this.fileInfoService.overallHeaderCount.Jsondata["TotalRecordCount"]);
      var p2 = parseInt(this.fileInfoService.overallHeaderCount.Jsondata["pageSize"]) + 1;
      var tct = Math.ceil(p1 / p2);
      for (var p = 1; p <= tct; this.totalpagecount.push({ pagemumber: p }), ++p);
   },
      error => {
        this.toastr.error(error.message);
      //  console.log(error);
      },
      () => {
        this.loading = false;
        this.smallLoader = false;
      });
  }

  refresh() {
    this.authService.selectedRadioButtonValue = 'All';
    this.fileInfoService.uploadFilterApplied = this.fileInfoService.callDateFilterApplied = false;
    this.fileInfoService.finalSelectedList = {
      "AgentName": null,
      "CustomerAccountNo": null,
      "CustomerPhoneNo": null,
      "ProgramName": null,
      "CallFromDate": null,
      "CallToDate": null,
      "UploadedFromDate": null,
      "UploadedToDate": null,
      "TranscriptStatus": 0, //all
      "FileGuid": ''
    };
    this.fileInfoService.finalSelectedList.TranscriptStatus = 0;
    this._filterDropdownService.customerFilterOptions.IsCustomerPhoneSelected = this._filterDropdownService.customerFilterOptions.IsCustomerAccountSelected = this._filterDropdownService.customerFilterOptions.IsAgentNameSelected = false;
    this.fileInfoService.filesInfo = []; this.recindx = 0; this.authService.UserSettings.pagination.selectedPageindex = 0;
    this.selectedPage = 1;
    this.isdatefilterapplied = false;
    this.getFileInfo();
  }
  getModifiedDate(status, date) {
    let local = '';
    if (status !== 'Not Uploaded') {
      const gmtDateTime = moment.utc(date);
      //    const local = momentTz(gmtDateTime).tz('America/Los_Angeles').format('MMM DD, YYYY h:mmA'); // using moment library to format
      local = momentTz(gmtDateTime).tz('UTC').format('MMM DD, YYYY'); // using moment library to format
    } else {
      return local;
    }
    return local;
  }

  trackByData(file: any) { // using in the html
    return file.fileName;
  }

  editFile(Guid, FileName, Status, FileIndex, apiSource) {
    // get correct fileindex from completed status to navigate in transcript and select file
    var tmpfiledata = this.totalfilesInfo.filter(f => f.Status === 'Completed');
    FileIndex = tmpfiledata.findIndex(f => f.Guid === Guid);
    if (Status === 'Completed') {
      let navigationExtras: NavigationExtras = {
        queryParams: {
          guid: Guid,
          fileName: FileName,
          status: Status,
          fileIndex: FileIndex % this.authService.UserSettings.pagination.pageSize,
          apiSource: apiSource
        }
      }
      //reset pageindex to select correct page pagination

      this.authService.UserSettings.pagination.selectedPageindex = Math.ceil(FileIndex / this.authService.UserSettings.pagination.pageSize + 1);
      //this.authService.currentMenu.next('/dashboard/callTranscripts');

      this._router.navigate(['dashboard/callTranscripts'], navigationExtras);
    }
  }
  activemenu(menu) {
    this.authService.currentMenu = menu;
    this.authService.navfromCallRecordings = true;
    localStorage.setItem('filter', JSON.stringify(this.fileInfoService.finalSelectedList));
  }
  copyTextToClipboard(text) {
    this.createAndSelectTextArea(text); // to select text
    try {
      const successful = this.dom.execCommand('copy'); // to copy text
      if (successful) {
        return true;
      }
    } catch (err) {
    } finally {
      this.dom.body.removeChild(this.txtArea);
    }
    return false;
  }

  createAndSelectTextArea(text) {
    this.txtArea = this.dom.createElement('textarea'); // creating a textarea to select and copy.
    this.txtArea.id = 'txt';
    this.txtArea.style.position = 'fixed';
    this.txtArea.style.top = '0';
    this.txtArea.style.left = '0';
    this.txtArea.style.opacity = '0';
    this.txtArea.value = text;
    document.body.appendChild(this.txtArea);
    this.txtArea.select();
  }

  copyToClipboard(guid, fileName, status, popover, FileIndex, apiSource) {
    // creating URL to access edit page
    //this.linkToCopy = encodeURI(`${environment.base_Url}/#/transcription/${fileName}/${guid}/${FileIndex}`);
    this.linkToCopy = encodeURI(`${environment.base_Url}/#/dashboard/callTranscripts?guid=${guid}&fileName=${fileName}&status=${status}&fileIndex=${FileIndex}&apiSource=${apiSource}`);

    const result = this.copyTextToClipboard(this.linkToCopy);
    if (result) {
      setTimeout(() => {
        popover.close();
      }, 1000);
    }
  }


  onSelectListCount(selectedRadioButtonValue: string) {
    this.fileInfoService.finalSelectedList = {
      "AgentName": null,
      "CustomerAccountNo": null,
      "CustomerPhoneNo": null,
      "ProgramName": null,
      "CallFromDate": null,
      "CallToDate": null,
      "UploadedFromDate": null,
      "UploadedToDate": null,
      "TranscriptStatus": 0, //all
      "FileGuid": ''
    }
    this.selectedListCount = selectedRadioButtonValue;
    this.isTilesChanged = true;
    this.selectedPage = 1;
    this.authService.UserSettings.pagination.selectedPageindex = 0; this.recindx = 0;
    switch (selectedRadioButtonValue) {
      case "Processing": this.fileInfoService.finalSelectedList.TranscriptStatus = 1; break;
      case "Completed": this.fileInfoService.finalSelectedList.TranscriptStatus = 2; break;
      default: this.fileInfoService.finalSelectedList.TranscriptStatus = 0; break;
    }
    this.getFileInfo();
  }

  onClickDeleteFile(guid, name, modal, apiSource, jobId) {
    this.curfileToDelete = name;
    this.curfileGuidToDelete = guid;
    this.api = apiSource;
    this.jobId = jobId;
    this.modalRef = this.modalService.open(modal);
  }

  deleteFile() {
    this.loading = true;
    let pullParams;
    if (this.api === 'AWSAPI') {
      pullParams = {
        FunctionName: `AllTriggers`,
        Payload: `{"fileGuid" : "${this.curfileGuidToDelete}","API": "${this.api}", "job": "${this.jobId}","env":"${environment.envName}"}`
      };
    } else {
      pullParams = {
        FunctionName: `AllTriggers`,
        Payload: `{"fileGuid" : "${this.curfileGuidToDelete}", "id": "${this.jobId}","env":"${environment.envName}"}`
      };
    }


    const lambdaPromise = this.lambdaService.executeLambda(pullParams);
    lambdaPromise.then(data => {
      if (data.StatusCode === 200 && data.Payload === '"Success"') {
        this.successValue = true;
        this.toastr.success('File Deleted Successfully');

        this.setMessage('');
      } else if (data.StatusCode === 200 && data.Payload === '"Failure"') {
        this.toastr.error('Error deleting file');
        this.failureValue = true;
        this.setMessage('');
      }
    }, () => { this.loading = false; });
  }

  setMessage(value: string) {
    if (value !== 'retry') {
      this.close();
    }

    setTimeout(() => {
      this.getFileInfo();
    }, 2000);
  }

  close() {
    this.modalRef.close();
  }

  retryFile(watsonJobId, apiSource, i, file) {
    this.selecteditem = i;
    let pullParams;
    file.processing = true;
    if (apiSource === 'AWSAPI') {
      pullParams = {
        FunctionName: `AllTriggers`,
        Payload: `{"jobName" : "${watsonJobId}","env":"${environment.envName}"}`
      };
    } else {
      pullParams = {
        FunctionName: `AllTriggers`,
        Payload: `{"job_id" : "${watsonJobId}","env":"${environment.envName}"}`
      };
    }


    const lambdaPromise = this.lambdaService.executeLambda(pullParams);
    lambdaPromise.then(data => {
      if (data.StatusCode === 200 && data.Payload === '"processing"') {
        this.toastr.warning('File is still under process');
        file.processing = false;
      } else if (data.StatusCode === 200 && data.Payload === '"completed"') {
        this.toastr.success('File processed successfully ');
        this.setMessage('retry');
      } else if (data.StatusCode === 200 && data.Payload === '"failed"') {
        this.toastr.error('Job failed');
        this.setMessage('retry');
      }
      this.retryLoader = false;
    });
  }

  ngOnDestroy() {
    this.dateFilterRecording.unsubscribe();
    this.uploadedDateFilterRecording.unsubscribe();
    this.authService.navigationBackFromcalltranscrtiptionPage = false;
    this.authService.navBackToCallRecordings = false;
    this._filterDropdownService.selectedFilterOptions = {
      AgentName: [],
      CustomerPhoneNo: [],
      CustomerAccountNo: [],
      ProgramName: [],
      DisputeStatus: [],
      FinalStatus: []
    }
    this._filterDropdownService.selectedFilterItems = {
      AgentName: [],
      CustomerPhoneNo: [],
      CustomerAccountNo: [],
      ProgramName: []
    }
  }
}
