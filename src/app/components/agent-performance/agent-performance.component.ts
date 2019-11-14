import { Component, ViewContainerRef, ElementRef } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Router, NavigationExtras } from '@angular/router';
import { SafeResourceUrl, DomSanitizer } from '@angular/platform-browser';
import { AuthorizationService } from '../../shared/authorization.service';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { DataService } from '../../shared/data.service';
import { FileInfoService } from '../call-recordings/shared/file-info.service';
import { FilterDropdownService } from '../filter-dropdown/shared/filter-dropdown.service';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';
import { DatePipe } from '@angular/common';
import * as moment from 'moment';
import * as momentTz from 'moment-timezone';
import { AgentPerformanceService } from '../agent-performance/shared/agent-performance.service';
import { Options } from 'ng5-slider';
import { Subscription } from 'rxjs';
import * as _ from 'underscore';
import { blob } from 'aws-sdk/clients/codecommit';
import { QuestionnairService } from '../settings/shared/questionnair.service';
//declare var noUiSlider: any;
@Component({
  selector: 'app-agent-performance',
  templateUrl: './agent-performance.component.html',
  styleUrls: ['./agent-performance.component.css']
})

export class AgentPerformanceComponent {
  public marginLeftValue = 0;
  role: any;
  showCallDateLabel: boolean = false;
  IsDisputeView: boolean = false;
  dupagentsFilesInfo: any;
  totalpagecount: any = [];
  config: any;
  loading = true;
  smallLoader = true;
  agentsFilesInfo: any = [];
  recindx = 0;
  isLeftSideFilterApplied: boolean = false;
  dateFilterRecording: Subscription;
  uploadedDateFilterRecording: Subscription;
  filterApplyed = false;
  isTilesChanged = false;
  isdatefilterapplied = false;
  isScoreFilterApplied: boolean = false;
  managerStatusChanged: boolean;
  questionsList: any;
  exploreCall = false;
  wordCountType = '';
  scoreChangeComment = '';
  disputePhrase = "";
  supervisorName = "";
  scoreValue = [];
  supervisorsList = [];
  superiorsComment = '';
  status = '';
  AgentName = '';
  managerName = '';
  managerComment = '';
  selectedquestion: number;
  ReadOnlyScore: boolean = false;
  tilescount = {
    totalScore: 0,
    avgScore: 0,
    callcount: 0,
    avgHandleTime: 0.0
  };
  duplicate: boolean;
  CustomerAgentId = '';
  MangerId = '';
  SupervisorId = '';
  loggedinUserName = "";
  disputeScore = {
    "Dispute_Phrase": "",
    "ReasonForChange": '',
    "Changed_Weighted_Score": 0,
    "Call_Question_ScoreID": 0,
    "IsApproved": false,
    "IsActive": true
  };
  disputeCallDetails : any;
  totalDisputes = [];

  //scoreManualChanges = {
  //  "Call_Question_ScoreID": 0,
  //  "Changed_Weighted_Score": 0,
  //  "ReasonForChange": ''
  //}
  filterDropdownDisplay: boolean;
  programName = [];
  programCategory = [];
  Question_Template_TypeID = 1;
  selectedVersionType = 'Draft';
  agentValue = false;
  phonevalues = false;
  accountValues = false;
  ScoreDetailsList: boolean = false;
  calltranscriptNavitaged: boolean = false;
  selectedPage = 1;
  refreshFilterData = false;
  restrictedColumn: boolean;
  totalWordCount: any;
  selectedCallItem: any;
  scoreChanged  = 0;
  currentMonthData = false;
  currentMonth: any;
  selectedQuestionSet: any;
  //slider
  minValue: number = 0;
  maxValue: number = 0;
  options: Options = {
    floor: 0,
    ceil: 30,
    step: 1
  };
  selectedColumn = '';
  //sorting
  key: string = 'UploadedDate';
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
  editScore = false;
  fireEvent() {
    // this.filterDropdownDisplay = !this.filterDropdownDisplay
  }
  sortByDate(key) {
    this.key = key;
    //this.reverse = !this.reverse;
    if (this.key == 'CallDate' || this.key == 'UploadedDate') {
      this.sortDate = !this.sortDate;
      this.getSortDate(this.sortDate);
    }
  }
  getSortDate(reverse) {
    if (this.key === 'CallDate') {
      this.agentsFilesInfo = this.agentsFilesInfo.sort((a, b) => {
        return (reverse) ? new Date(a.CallDate).getTime() - new Date(b.CallDate).getTime() : new Date(b.CallDate).getTime() - new Date(a.CallDate).getTime();
      })
    }
    else if (this.key === 'UploadedDate') {
      this.agentsFilesInfo = this.agentsFilesInfo.sort((a, b) => {
        return (reverse) ? new Date(a.UploadedDate).getTime() - new Date(b.UploadedDate).getTime() : new Date(b.UploadedDate).getTime() - new Date(a.UploadedDate).getTime()
      })
    }
  }
  url: SafeResourceUrl;
  public dpConfig: Partial<BsDatepickerConfig> = new BsDatepickerConfig();
  constructor(
    private sanitizer: DomSanitizer, private _elementRef: ElementRef,
    public dataService: DataService,
    public authService: AuthorizationService,
    public fileInfoService: FileInfoService,
    public toastr: ToastsManager, vRef: ViewContainerRef,
    public _questionnairService: QuestionnairService,
    public _agentPerformanceService: AgentPerformanceService, public _filterDropdownService: FilterDropdownService,
    private _router: Router) {
    this.url = '';
    this.toastr.setRootViewContainerRef(vRef);
  }

  ngOnInit() {
    this.fileInfoService.callDateFilterApplied = false;
    this.fileInfoService.uploadFilterApplied = false;
    this.currentMonthData = false;
    var date = new Date();
    this.currentMonth = date;
    this.totalWordCount = 0;
    this.wordCountType = 'All';
    this.role = this.authService.UserProfiledetails.role.name;
    this.restrictedColumn = this.role === 'Customer_Agent' ? true : false;
    this.isdatefilterapplied = false;
    this.selectedPage = 1;
    this.authService.UserSettings.pagination.selectedPageindex = 0;
    this.fileInfoService.filtercriteria.callDateRange.fromDate = this.fileInfoService.filtercriteria.callDateRange.orgfromDate = null;
    this.fileInfoService.filtercriteria.callDateRange.toDate = this.fileInfoService.filtercriteria.callDateRange.orgtoDate = null;
    this.fileInfoService.finalSelectedList = {
      "AgentName": null,
      "CustomerAccountNo": null,
      "CustomerPhoneNo": null,
      "ProgramName": null,
      "CallFromDate": null,
      "CallToDate": null,
      "UploadedFromDate": null,
      "UploadedToDate": null,
      "FileGuid": '',
      "TranscriptStatus": null  //void
    }
    this.dateFilterRecording = this.fileInfoService.dateFilterApplied_AgentPerformance.subscribe(data => {
      this.fileInfoService.finalSelectedList.FileGuid = this.fileInfoService.finalSelectedList.UploadedToDate
        = this.fileInfoService.finalSelectedList.UploadedFromDate = null;
      this.fileInfoService.finalSelectedList['CallFromDate'] = (moment(data.fromDate).format("YYYY-MM-DD"));
      this.fileInfoService.finalSelectedList['CallToDate'] = (moment(data.toDate).format("YYYY-MM-DD"));
      this.isdatefilterapplied = true;
      this.selectedPage = 1;
      this.authService.UserSettings.pagination.selectedPageindex = 0; this.recindx = 0;
      this.getAgentFileInfo();
    });
    this.uploadedDateFilterRecording = this.fileInfoService.UpladedDateFilterApplied_AgentPerformance.subscribe(data => {
      this.fileInfoService.finalSelectedList.FileGuid = this.fileInfoService.finalSelectedList.CallFromDate = this.fileInfoService.finalSelectedList.CallToDate = null;
      this.fileInfoService.finalSelectedList['UploadedFromDate'] = (moment(data.fromDate).format("YYYY-MM-DD"));
      this.fileInfoService.finalSelectedList['UploadedToDate'] = (moment(data.toDate).format("YYYY-MM-DD"));
      this.isdatefilterapplied = true;
      this.selectedPage = 1;
      this.authService.UserSettings.pagination.selectedPageindex = 0; this.recindx = 0;
      this.getAgentFileInfo();
    });

    this.fileInfoService.overallHeaderCount.pageNavigationCount = 0;
    if (!this.isdatefilterapplied && !this.authService.navigatedfromCallTranscriptionPage && !this.authService.navigationBackFromAgentPage && !this.authService.navigationBackFromAgentScore)
      this.getAgentFileInfo();

    if (this.authService.navigationBackFromAgentPage) {
      this.fileInfoService.finalSelectedList = JSON.parse(localStorage.getItem('filter'));
      localStorage.removeItem('filter');
      this.getAgentFileInfo();
    }
    if (this.authService.navigatedfromCallTranscriptionPage || this.authService.navigationBackFromAgentScore || this.authService.navigatedFromDisputeCalls) {
      this.calltranscriptNavitaged = true;
      this._filterDropdownService.customerFilterOptions.AgentNames.push(this.authService.selectedFileToViewScore['AgentName']);
      this._filterDropdownService.customerFilterOptions.customerPhoneNumbers.push(this.authService.selectedFileToViewScore['CustomerPhoneNo']);
      this._filterDropdownService.customerFilterOptions.customerAccountNumbers.push(this.authService.selectedFileToViewScore['CustomerAccountNo']);
      this.ScoreDetailsList = true;
      this.showDetailedScore(this.authService.selectedFileToViewScore);
    }
    this.defaultFilter();
  }
  defaultFilter() {
    this.filterDropdownDisplay = true;
  }
  //change score functions
  changeScore(item) {
    this.duplicate = false;
    this.selectedQuestionSet = item;
    if (this.totalDisputes.length === 0 || item.IsEdited === false) {
      this.disputeScore = {
        "Dispute_Phrase": "",
        "ReasonForChange": '',
        "Changed_Weighted_Score": 0,
        "Call_Question_ScoreID": 0,
        "IsApproved": false,
        "IsActive": true
      };
      this.scoreChangeComment = "";
      this.scoreValue = JSON.parse(item.PossibleScoreValue);
      this.supervisorsList = JSON.parse(item.OtherColumns);
      this.loggedinUserName = this.supervisorsList["UserName"];
      this.editScore = true;
      this.disputeScore.Call_Question_ScoreID = item.Call_Question_ScoreID;
      this.disputeScore.Changed_Weighted_Score = item.Score_Weightage;
    } else {
      this.totalDisputes.forEach((e) => {
        if (e.Call_Question_ScoreID == item.Call_Question_ScoreID) {
          this.duplicate = true;
          this.editScore = true;
          this.disputeScore.Dispute_Phrase = e.Dispute_Phrase;
          this.scoreChangeComment = e.ReasonForChange;
          this.supervisorsList = JSON.parse(item.OtherColumns);
          this.supervisorName = this.supervisorsList["SupervisorName"];
          this.disputeScore.Changed_Weighted_Score = item.Score_Weightage;
        }
        console.log(this.totalDisputes);
      });
    }
  }
  ChangedManagerStatus(event) {
    if (this.status === 'QAM_Rejected') {
      this.disputeScore.IsApproved = false;
    } else if (this.status === 'QAM_Approved') {
      this.disputeScore.IsApproved = true;
    }
  }
  scoreView(item) {
    this.IsDisputeView = true;
    this.disputeScore.Dispute_Phrase = item.Dispute_Phrase;
    this.scoreChangeComment = item.ReasonForChange;
    this.supervisorsList = JSON.parse(item.OtherColumns);
    this.supervisorName = this.supervisorsList["SupervisorName"];
    this.AgentName = this.supervisorsList["UserName"];
    this.disputeScore.Changed_Weighted_Score = item.Score_Weightage;
   // this.status = item.Status;
  }
  closePopup() {
    this.editScore = false;
    this.IsDisputeView = false;    
  }
  selectedQuestion(index) {
    this.selectedquestion = index;
  }
  agentPerformanceScoreChanges() {
      this.toastr.success("Reviewed Calls Saved Successfully");
   
    this.selectedQuestionSet.IsEdited = true;
    this.disputeScore.ReasonForChange = this.scoreChangeComment;
    this.disputeScore.Changed_Weighted_Score = JSON.parse(this.scoreChanged + " ");
    // this.totalDisputes.push(this.disputeScore);
    if (this.totalDisputes.length > 0) {
        for (var dup = 0; dup < this.totalDisputes.length; dup++) {
          if (this.totalDisputes[dup].Call_Question_ScoreID === this.disputeScore.Call_Question_ScoreID) {
            this.totalDisputes.splice(dup, 1);
          }        
         }
        this.totalDisputes.push(this.disputeScore);      
    } else {
      this.totalDisputes.push(this.disputeScore);
    }
    this.closePopup();
  }

  submitDisputes() {
    this._agentPerformanceService.scoreManualUpdate(this.totalDisputes).subscribe((res: any) => {
     
      if (this.role != 'Customer_Management') {
        this.toastr.success("Dispute call Submitted Successfully");
      } else {
        this.toastr.success("Reviewed Score Updated Successfully");
      }

      setTimeout(function () {
        this.showDetailedScore(this.selectedCallItem);
      }, 5000);

      this.status = res.Status;
    }, error => {
      this.toastr.error(error.message);
    },
      () => {
        this.loading = false;
        this.editScore = false;
      });
  }

  clearScoreChanges() {
    this.scoreChangeComment = '';
    this.scoreChanged = 0;
    this.disputeScore.Dispute_Phrase = "";
  }
  getvalue() {
  }
  changeWordCount(type) {
    this.wordCountType = type;
    if (this.ScoreDetailsList != true) {
      if (type == 'All') {
        if (this.fileInfoService.overallHeaderCount.Jsondata['Call_Transcripts_All_WordCount'] >= 1000) {
          this.totalWordCount = Math.floor(this.fileInfoService.overallHeaderCount.Jsondata['Call_Transcripts_All_WordCount'] / 1000) + 'K';
        } else {
          this.totalWordCount = this.fileInfoService.overallHeaderCount.Jsondata['Call_Transcripts_All_WordCount'];
        }
      } else if (type == 'Agent') {
        if (this.fileInfoService.overallHeaderCount.Jsondata['Call_Transcripts_Agent_WordCount'] >= 1000) {
          this.totalWordCount = Math.floor(this.fileInfoService.overallHeaderCount.Jsondata['Call_Transcripts_Agent_WordCount'] / 1000) + 'K';
        } else {
          this.totalWordCount = this.fileInfoService.overallHeaderCount.Jsondata['Call_Transcripts_Agent_WordCount'];
        }
      } else if (type == 'Customer') {
        if (this.fileInfoService.overallHeaderCount.Jsondata['Call_Transcripts_Customer_WordCount'] >= 1000) {
          this.totalWordCount = Math.floor(this.fileInfoService.overallHeaderCount.Jsondata['Call_Transcripts_Customer_WordCount'] / 1000) + 'K';
        } else {
          this.totalWordCount = this.fileInfoService.overallHeaderCount.Jsondata['Call_Transcripts_Customer_WordCount']
        }
      }
    }
    else if (this.ScoreDetailsList == true) {
      if (type == 'All') {
        if (this.selectedCallItem['Call_Transcripts_All_WordCount'] > 1000) {
          this.totalWordCount = Math.floor(this.selectedCallItem['Call_Transcripts_All_WordCount'] / 1000) + 'K';
        } else {
          this.totalWordCount = this.selectedCallItem['Call_Transcripts_All_WordCount'];
        }
      } else if (type == 'Agent') {
        if (this.selectedCallItem['Call_Transcripts_Agent_WordCount'] >= 1000) {
          this.totalWordCount = Math.floor(this.selectedCallItem['Call_Transcripts_Agent_WordCount'] / 1000) + 'K';
        } else {
          this.totalWordCount = this.selectedCallItem['Call_Transcripts_Agent_WordCount'];
        }
      } else if (type == 'Customer') {
        if (this.selectedCallItem['Call_Transcripts_Customer_WordCount'] >= 1000) {
          this.totalWordCount = Math.floor(this.selectedCallItem['Call_Transcripts_Customer_WordCount'] / 1000) + 'K';
        } else {
          this.totalWordCount = this.selectedCallItem['Call_Transcripts_Customer_WordCount'];
        }
      }
    }
    //console.log(this.wordCountType);
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
    this.fileInfoService.dateFiltersApplied = !this.fileInfoService.dateFiltersApplied;
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
    // if (!this._filterDropdownService.customerFilterOptions.IsCustomerPhoneSelected && !this._filterDropdownService.customerFilterOptions.IsCustomerAccountSelected && !this._filterDropdownService.customerFilterOptions.IsAgentNameSelected && !this._filterDropdownService.customerFilterOptions.IsProgramNameSelected) {
    this.objectMaking(this._filterDropdownService.catagoryList);
    if (this.filterApplyed) {
      this.getAgentFileInfo();
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
    if (this.filterApplyed === true) {
      this.fileInfoService.finalSelectedList[type] = Newstring;
    }
    else {
      this.fileInfoService.finalSelectedList[type] = null;
    }
  }
  refresh() {
    this.currentMonthData = false;
    this.refreshFilterData = true;
    this.fileInfoService.uploadFilterApplied = this.fileInfoService.callDateFilterApplied = false;
    this._filterDropdownService.selectedFilterOptions = {
      AgentName: [],
      CustomerPhoneNo: [],
      CustomerAccountNo: [],
      ProgramName: [],
      DisputeStatus: [],
      FinalStatus: []
    };
    this._filterDropdownService.selectedItems = [];
    this.fileInfoService.finalSelectedList = {
      "AgentName": null,
      "CustomerAccountNo": null,
      "CustomerPhoneNo": null,
      "ProgramName": null,
      "CallFromDate": null,
      "CallToDate": null,
      "UploadedFromDate": null,
      "UploadedToDate": null,
      "FileGuid": '',
      "TranscriptStatus": null //void
    };
    this.fileInfoService.finalSelectedList["LowScore"] = this.fileInfoService.finalSelectedList["HighScore"] = null;
    this.agentValue = this.accountValues = this.phonevalues = false;
    this._filterDropdownService.customerFilterOptions.IsCustomerPhoneSelected = this._filterDropdownService.customerFilterOptions.IsCustomerAccountSelected = this._filterDropdownService.customerFilterOptions.IsAgentNameSelected = false;
    this.isScoreFilterApplied = false;
    this.recindx = 0; this.authService.UserSettings.pagination.selectedPageindex = 0;
    this.selectedPage = 1;
    this.isdatefilterapplied = false;
    this.ScoreDetailsList = false;
    this.changeWordCount('All');
    this.getAgentFileInfo();
  }

  initCount() {
    //this.customerFilterOptions.AgentNames = this.customerFilterOptions.customerAccountNumbers = this.customerFilterOptions.customerPhoneNumbers = [];
    this.isTilesChanged = false;
    this.fileInfoService.overallHeaderCount.totalfileInfoLength = this.fileInfoService.overallHeaderCount.Jsondata["TotalRecordCount"];
    this.isTilesChanged = false;

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
    if (!this.isScoreFilterApplied) {
      this.minValue = this.fileInfoService.overallHeaderCount.Jsondata["LowScore"];
      this.maxValue = this.fileInfoService.overallHeaderCount.Jsondata["HighScore"];
    }
    this.isScoreFilterApplied = false;
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
    // this.obectMaking(this.customerFilterOptions.AgentNames);
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

  scorefilter() {
    this.isScoreFilterApplied = true;
    this.fileInfoService.finalSelectedList["LowScore"] = this.minValue; this.fileInfoService.finalSelectedList["HighScore"] = this.maxValue;
    this.selectedPage = 1;
    this.authService.UserSettings.pagination.selectedPageindex = 0; this.recindx = 0;
    this.fileInfoService.finalSelectedList.CallFromDate = this.fileInfoService.finalSelectedList.CallToDate = this.fileInfoService.finalSelectedList.UploadedFromDate = this.fileInfoService.finalSelectedList.UploadedToDate = null;
    this.getAgentFileInfo();
  }
  getModifiedDate(date) {
    let local = '';
    const gmtDateTime = moment.utc(date);
    //    const local = momentTz(gmtDateTime).tz('America/Los_Angeles').format('MMM DD, YYYY h:mmA'); // using moment library to format
    local = momentTz(gmtDateTime).tz('UTC').format('MMM DD, YYYY'); // using moment library to format
    return local;
  }

  backToAgentsPerformance() {
    this.ScoreDetailsList = false;
    this.property = ''; // clearing score sorting in back
    this.isLeftSideFilterApplied = this._filterDropdownService.selectedFilterOptions.AgentName.length > 0 || this._filterDropdownService.selectedFilterOptions.CustomerPhoneNo.length > 0 || this._filterDropdownService.selectedFilterOptions.CustomerAccountNo.length > 0;
    this.getAgentFileInfo();
  }

  backToAgentsPerformanceFromScore() {
    this.ScoreDetailsList = false;
    this.property = '';
    this.fileInfoService.finalSelectedList = JSON.parse(localStorage.getItem('filter'));
    localStorage.removeItem('filter');
    this.getAgentFileInfo();
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

  }

  distinctdata(a) {
    var b = a.filter(function (item, index, inputArray) {
      return inputArray.indexOf(item) == index;
    });
    return b;
  }
  showtilesdata() {
    this.tilescount = {
      totalScore: 0,
      avgScore: 0,
      callcount: 0,
      avgHandleTime: 0.0
    };
    let totalScore = 0;
    let callDuration = 0.0;

    this.tilescount.totalScore = this.fileInfoService.overallHeaderCount.Jsondata["totalScore"];
    callDuration = this.fileInfoService.overallHeaderCount.Jsondata["totalDuration"];
    this.fileInfoService.overallHeaderCount.Jsondata["ProgramName"].split(',').forEach(e => this.programName.push(e));
    this.tilescount.callcount = this.fileInfoService.overallHeaderCount.Jsondata["TotalRecordCount"];
    this.tilescount.avgScore = this.tilescount.totalScore / this.tilescount.callcount;
    this.tilescount.avgHandleTime = callDuration / this.tilescount.callcount;
  }

  selectedPageIndex(pageNum) {
    this.changeWordCount('All');
    this.authService.UserSettings.pagination.selectedPageindex = pageNum - 1;
    this.agentsFilesInfo = [];
    this.selectedPage = pageNum;
    this.recindx = (this.authService.UserSettings.pagination.pageSize * this.authService.UserSettings.pagination.selectedPageindex) + 1;
    this.getAgentFileInfo();
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
  exploreCallDetails() {
    this.exploreCall = true;
  }
  editFile(Guid, FileName, Status, FileIndex, apiSource) {
    if (Status === 'Completed') {
      let navigationExtras: NavigationExtras = {
        queryParams: {
          guid: Guid,
          fileName: FileName,
          status: Status,
          //  fileIndex: FileIndex % this.authService.UserSettings.pagination.pageSize,
          fileIndex: FileIndex,
          apiSource: apiSource,
          navigatedFrom: 'agentperformance'
        }
      }
      //reset pageindex to select correct page pagination

      this.authService.UserSettings.pagination.selectedPageindex = Math.ceil(FileIndex / this.authService.UserSettings.pagination.pageSize + 1);
      //this.authService.currentMenu.next('/dashboard/callTranscripts');
      if (!this.exploreCall) {
        this._router.navigate(['dashboard/callTranscripts'], navigationExtras);
      } else {
        this._router.navigate(['dashboard/ExploreCall'], navigationExtras);
        this.exploreCall = false;
      }

    }
  }
  navigationFromDisputeCalls() {
    this.authService.navigationFromDisputedCalls = true;
  }
  navigationFromAgent() {
    this.authService.navigationFromAgentPage = true;
    this.authService.navigationFromAgentScorePage = false;
  }
  navigationFromAgentScorepage() {
    this.authService.navigationFromAgentScorePage = true;
    this.authService.navigationFromAgentPage = false;
  }
  activemenu(menu) {
    this.authService.currentMenu = menu;
    this.setFiltervalues();
  }
  setFiltervalues() {
    localStorage.setItem('filter', JSON.stringify(this.fileInfoService.finalSelectedList));
  }
  getAgentFileInfo() {
    this.agentsFilesInfo = [];
    this.loading = true;
    this.smallLoader = true;
    this._agentPerformanceService.agentFileInfo(this.recindx, this.fileInfoService.finalSelectedList).subscribe((response: any) => {
      this.agentsFilesInfo = JSON.parse(response.scoringdata);
      this.agentsFilesInfo.forEach((item) => {
        item.colorzone = item.TotalWeighted_Score < 90 ? '#feecd1' : '#c3d6c1';
      });
      if (this.agentsFilesInfo == null || this.agentsFilesInfo == undefined || this.agentsFilesInfo.length == 0) {
        if (this.fileInfoService.uploadFilterApplied === false) {
          this.currentMonthData = true;
        } else {
          this.toastr.error("No record found.");
        }
        this.tilescount.callcount = this.tilescount.avgScore = this.tilescount.avgHandleTime = this.minValue = this.maxValue = this.totalWordCount = 0;
        this.fileInfoService.filtercriteria.callDateRange.uploadedToDate = this.fileInfoService.filtercriteria.callDateRange.uploadedFromDate =
          this.fileInfoService.filtercriteria.callDateRange.callToDate = this.fileInfoService.filtercriteria.callDateRange.callFromDate = null;
        this.totalpagecount = [];
        return;
      }
      else {
        this.currentMonthData = false;
      }
      this.dupagentsFilesInfo = this.agentsFilesInfo;
      this.fileInfoService.overallHeaderCount.Jsondata = JSON.parse(JSON.parse(response["Jsondata"])[0]["overallHeaderCount"]);
      this.showtilesdata();
      this.changeWordCount(this.wordCountType);
      this.authService.UserSettings.pagination.pageSize = this.fileInfoService.overallHeaderCount.Jsondata["pageSize"];
      //this.loadmoreflag = data.length >= this.PageSize;
      this.totalpagecount = [];
      var p1 = parseInt(this.fileInfoService.overallHeaderCount.Jsondata["TotalRecordCount"]);
      var p2 = parseInt(this.fileInfoService.overallHeaderCount.Jsondata["pageSize"]) + 1;
      var tct = Math.ceil(p1 / p2);
      for (var p = 1; p <= tct; this.totalpagecount.push({ pagemumber: p }), ++p);
      this.initCount();
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
  
  showDetailedScore(item) {
    this.ScoreDetailsList = true;
    this.selectedCallItem = item;
    this.changeWordCount('All');
    this.authService.selectedFileToViewScore = item;
    this.agentsFilesInfo = []; this.isdatefilterapplied = false;
    this.agentsFilesInfo.push(item);
    this._filterDropdownService.customerFilterOptions.AgentNames = [];
    this._filterDropdownService.customerFilterOptions.customerPhoneNumbers = [];
    this._filterDropdownService.customerFilterOptions.customerAccountNumbers = [];
    this._filterDropdownService.customerFilterOptions.ProgramName = [];
    this.tilescount = {
      totalScore: 0,
      avgScore: 0,
      callcount: 0,
      avgHandleTime: 0.0
    };
    let obj = {
      'selected': false,
      'name': item['AgentName']
    };
    let obj1 = {
      'selected': false,
      'name': item['CustomerPhoneNo']
    };
    let obj2 = {
      'selected': false,
      'name': item['CustomerAccountNo']
    };
    this._filterDropdownService.customerFilterOptions.AgentNames.push(obj);
    this._filterDropdownService.customerFilterOptions.customerPhoneNumbers.push(obj1);
    this._filterDropdownService.customerFilterOptions.customerAccountNumbers.push(obj2);

    this.fileInfoService.filtercriteria.callDateRange.callFromDate = new Date(moment(this.agentsFilesInfo[0]["CallDate"]).format("MM/DD/YYYY"));
    this.fileInfoService.filtercriteria.callDateRange.callToDate = new Date(moment(this.agentsFilesInfo[0]["CallDate"]).format("MM/DD/YYYY"));
    this.fileInfoService.filtercriteria.callDateRange.uploadedFromDate = new Date(moment(this.agentsFilesInfo[0]["UploadedDate"]).format("MM/DD/YYYY"));
    this.fileInfoService.filtercriteria.callDateRange.uploadedToDate = new Date(moment(this.agentsFilesInfo[0]["UploadedDate"]).format("MM/DD/YYYY"));
    this.tilescount.callcount = this.agentsFilesInfo.length;
    this.tilescount.avgHandleTime = this.agentsFilesInfo[0]['Duration'];
    let Guid = '';
    if (this.authService.navigatedFromDisputeCalls === true) {
      this.selectedCallItem["Duration"] = this.tilescount.avgHandleTime = this.authService.disputedCallDuration;
      this.selectedCallItem["Guid"] = item.FileGuid;
      Guid = item.FileGuid;
    } else {
      Guid = item.Guid;
    }
    this._agentPerformanceService.getScoreDetails(Guid, 1).subscribe((response: any) => {
      this.questionsList = JSON.parse(response);
      this.disputeCallDetails = JSON.parse(this.questionsList[0]["OtherColumns"]);
      if (this.questionsList.length == 0 || this.questionsList == null || this.questionsList == undefined) {
        this.toastr.error('No calls for Current month');
        this.tilescount.callcount = this.tilescount.avgScore = this.tilescount.avgHandleTime = this.minValue = this.maxValue = 0;
        this.fileInfoService.filtercriteria.callDateRange.uploadedToDate = this.fileInfoService.filtercriteria.callDateRange.uploadedFromDate =
          this.fileInfoService.filtercriteria.callDateRange.callToDate = this.fileInfoService.filtercriteria.callDateRange.callFromDate = null;
        return;
      }
      for (var i = 0; i < this.questionsList.length; i++) {
        var spottedkeywords = '';
        var keysListArr = [];
        if (this.questionsList[i]['Spotted_Keyword'] === '""""') {
          spottedkeywords = '';
        } else {
          spottedkeywords = this.questionsList[i]['Spotted_Keyword'];
          spottedkeywords = spottedkeywords.replace(/"/g, '');
          keysListArr = spottedkeywords.split(',');
        }
        this.questionsList[i]["sportedKewords"] = keysListArr;
      }
      for (var j = 0; j < this.questionsList.length; j++) {
        this.questionsList[j]["IsEdited"] = false;
        if (this.questionsList[j].Score_Weightage <= 0) {
          this.questionsList[j]['colorzone'] = '#ffb6c1';
        } else if (this.questionsList[j].Score_Weightage > 0) {
          this.questionsList[j]['colorzone'] = '#c3d6c1';
        }
      }
      this.loading = false;
      this.smallLoader = false;
      this.tilescount.avgScore = 0;
      this.questionsList.forEach(f => {
        this.tilescount.avgScore = this.tilescount.avgScore + f['Score_Weightage'];
        //  callDuration += f['Call_Duration'];
      });
      if (this.questionsList.length > 0) {
        this.minValue = _.min(this.questionsList.map(function (rec) { return rec.Score_Weightage }));
        this.maxValue = _.max(this.questionsList.map(function (rec) { return rec.Score_Weightage }));
      } else {
        this.tilescount.callcount = this.tilescount.avgScore = this.tilescount.avgHandleTime = this.minValue = this.maxValue = 0;
      }
    },
      error => {
        this.toastr.error('No calls for Current month');
      },
      () => {
        this.loading = false;
        this.smallLoader = false;
      });
    //this.showtilesdata();
  }

  downloadAgentPerformanceSheet() {
    this.loading = true;
    const headers = new Headers({
      'Content-Type': 'text/csv',
    });
    const options = {
      responseType: "arraybuffer",
      headers: headers
    };

    this._agentPerformanceService.
      agentPerformanceDownloadSheet(this.fileInfoService.finalSelectedList, options).subscribe(blob => {
        let saveAs = require('file-saver');
        this.loading = false;
        let b: any = new Blob([blob], { type: 'text/csv' });
        saveAs.saveAs(b, `AgentPerformanceScore.csv`);

      }, (err) => {
        this.toastr.error(err.message);
      }, () => { this.loading = false; }

      );
  }



  viewFile(Guid, FileName, Status, FileIndex) {
    // get correct fileindex from completed status to navigate in transcript and select file
    var tmpfiledata = this.agentsFilesInfo;
    FileIndex = tmpfiledata.findIndex(f => f.Guid === Guid);
    let navigationExtras: NavigationExtras = {
      queryParams: {
        guid: Guid,
        fileName: FileName,
        Status: 'Completed',
        fileIndex: FileIndex
      }
    }
    //reset pageindex to select correct page pagination
    this.authService.UserSettings.pagination.selectedPageindex = Math.floor(FileIndex / this.authService.UserSettings.pagination.pageSize);
    this.authService.currentMenu.next('/dashboard/callTranscripts');
    this._router.navigate(['dashboard/callTranscripts'], navigationExtras);
  }
  audioPlay(item, index) {
    this.loading = true;
    if (typeof item.Guid === 'undefined') {
      return false;
    } else {
      this.agentsFilesInfo.forEach((item) =>
        item.audioPath = "");
      this.dataService.dataServiceGet(`${environment.transcription_Api}/api/watson/GetReadPreSignedUrl/${item.Guid}/${item.TranscriptAPISource}`)
        .subscribe((response: any) => {
          item["audioPath"] = response.url;
        },
          err => {
            //    console.log(err);
          },
          () => {
            this.loading = false;
          });
    }
  }

  ngOnDestroy() {
    this.dateFilterRecording.unsubscribe();
    this.uploadedDateFilterRecording.unsubscribe();
    // this.viewScoreDetailsList.unsubscribe();
    this.authService.navigatedfromCallTranscriptionPage = false;
    this.authService.navigationBackFromcalltranscrtiptionPage = false;
    this.authService.navigationBackFromAgentPage = false;
    this.authService.navigationBackFromAgentScore = false;
    this.authService.navigatedFromDisputeCalls = false;
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
