import { Component, ElementRef, HostListener, OnInit, ViewChild, TemplateRef, OnDestroy, ViewContainerRef, trigger, transition, style, animate } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';
import { DataService } from '../../shared/data.service';
import { TranscriptionTimetrackerService } from '../../shared/transcription-timetracker-service';
import { ISubscription } from 'rxjs/Subscription';
import { FileInfoService } from '../call-recordings/shared/file-info.service';
import { FilterDropdownService } from '../filter-dropdown/shared/filter-dropdown.service';
import { FileInfo } from '../../components/call-recordings/fileInfo.interface';
import * as moment from 'moment';
import * as momentTz from 'moment-timezone';
import { AuthorizationService } from '../../shared/authorization.service';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';

import { Http, Response, Headers, RequestOptions, ResponseContentType, HttpModule } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { Subscription } from 'rxjs';
import { HttpClientModule, HttpClient, HttpHeaders } from '@angular/common/http';
import { blob } from 'aws-sdk/clients/codecommit';
import * as jwt_decode from 'jwt-decode';
import { DatePipe } from '@angular/common';
import { Bool } from 'aws-sdk/clients/inspector';
import * as _ from 'underscore';
import { AgentPerformanceService } from '../../components/agent-performance/shared/agent-performance.service';

@Component({
  selector: 'app-call-transcripts',
  templateUrl: './call-transcripts.component.html',
  styleUrls: ['./call-transcripts.component.css']
})

export class CallTranscriptsComponent implements OnInit {
  public marginLeftValue = 0;
  filterDropdownDisplay: boolean;
  selectedColumn: '';
  filterApplyed: boolean;
  config: any;
  role: any;
  transcription: any = [];
  NewTranscriptionObject: any;
  transcript: any;
  myInterval: any;
  transcriptData: any;
  audioSource: String;
  newTranscription: any[] = [];
  transcriptionLength: number;
  confidenceArray: any[] = [];
  durationArray: any[] = [];
  wordLength: number;
  errorWordCount: number;
  totalWordCount: any;
  newWords: any[] = [];
  subscription: ISubscription;
  saveSubcription: ISubscription;
  loading: boolean;
  audioFileSet = false;
  smallLoader: boolean;
  isLeftSideFilterApplied: boolean = false;
  speedArray: any[] = [0.5, 1.0, 1.5, 2.0];
  selectedSpeed: any;
  map: any = {};
  playing: boolean;
  selectedTagType: string;
  wordTags: string[];
  instructions: string;
  searchClick = false;
  savingWords: boolean;
  isPlaying: boolean;
  audioActive = false;
  dateFilterTranscript: Subscription;
  uploadedDateFilterTranscript: Subscription;
  selectedTranscriptionEditorStatusId: boolean;
  backToAgentPerformace: boolean;
  apiSource: any;
  viewtranscript: boolean = false;
  audioPath: string;
  wordCountType = '';
  agentValue = false;
  phonevalues = false;
  accountValues = false;

  allAgents = false;
  allAccountNos = false;
  allPhoneNos = false;
  finalSelectedList = {
    AgentNames: null,
    CustomerPhoneNo: null,
    CustomerAccountNo: null
  }

  public fileInfoLength: any;
  uploadedTimeArray: string[] = [];
  guid: any;
  params: any;
  selectedPage = 1;
  loadmoreflag: boolean = false;
  // transcriptionListLoadmore: boolean = false;
  addfrequency: boolean = false;
  selectedTranscriptedFile: any;
  navigatedFromCallRecordings: boolean = false;
  splittedAudioRequest: any = { Frequency: 30 };
  selectedFile: number;
  totalpagecount: any = [];
  recindx = 0;
  checkbox: boolean;
  callTrasncriptionList: boolean;
  isdatefilterapplied = false;
  selectedCallItem: any;
  private audio: any;
  IsViewScoreDataLoaded: boolean = true;
  
  //sorting
  key: string = 'UploadedDate';
  reverse: boolean = false;
  sortDate = false;
  sort(key) {
    this.key = key;
    this.reverse = !this.reverse;
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
  //overallHeaderCount = { totalfileInfoLength: 0, totalDuration: '', pageNavigationCount: 0 };

  @ViewChild('track') private track: ElementRef; // referencing the audio in the html

  constructor(private _timeTrackerService: TranscriptionTimetrackerService,
    public dataService: DataService, public authService: AuthorizationService,
    private _route: ActivatedRoute,
    private _router: Router,
    public _agent: AgentPerformanceService, public _filterDropdownService: FilterDropdownService,
    public fileInfoService: FileInfoService, public toastr: ToastsManager, vRef: ViewContainerRef) {
    let decod = jwt_decode(this.authService.getToken());
    this.authService.UserProfiledetails.role.name = decod['userRole'];
    this.role = this.authService.UserProfiledetails.role.name;
    //toastr
    this.toastr.setRootViewContainerRef(vRef);
    this.checkbox = false;

  }

  audioFileUrlSet() {
    this.audioFileSet = false;
    this.loading = true;
    setTimeout(() => {
      this.track.nativeElement.addEventListener('play', () => { // adding play event on audio
        this.playing = true;
        this.myInterval = setInterval(() => {
          // sending current time on the audio for every 100 milliseconds as an observable
          this._timeTrackerService.sendCurrentTime(this.track.nativeElement.currentTime);
        }, 100);
      });
      // adding pause event on audio and clearing the interval when audio is paused.
      this.track.nativeElement.addEventListener('pause', () => {
        this.playing = false;
        clearInterval(this.myInterval);
      });

      // when there is a double click on the word, we are setting the current time on the audio based on the word clicked
      this.subscription = this._timeTrackerService.setCurrentTime$.subscribe(clickedTime => {
        this.track.nativeElement.currentTime = clickedTime;
      });
      this.loading = false;
      if (this.guid) {
        this.audioFileSet = true;
        this.getTranscriptdata(this.guid);
      }
      this.track.nativeElement.playbackRate = 1.0; // setting initial playback rate and speed of the audio.
    }, 2000);
  }

  ngOnInit() {
    this.fileInfoService.callDateFilterApplied = false;
    this.fileInfoService.uploadFilterApplied = false;
    this.wordCountType = 'All';
    this.audioActive = false;
    this.isdatefilterapplied = false; this.selectedPage = 1; this.viewtranscript = false;
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
      "TranscriptStatus": 2,  //all
      "FileGuid": ''
    }
    this._route.queryParams.subscribe(params => {
      this.params = params;
      if (this.params.fileIndex != undefined) {
        this.navigatedFromCallRecordings = true;
        this.fileInfoService.finalSelectedList.FileGuid = this.params.guid;
      }
      if (this.params.navigationFrom === 'agentperformance') {
        this.backToAgentPerformace = true;
      }
    });
    this.dateFilterTranscript = this.fileInfoService.dateFilterApplied_Transcript.subscribe(data => {
      this.fileInfoService.finalSelectedList.FileGuid = this.fileInfoService.finalSelectedList.UploadedToDate
        = this.fileInfoService.finalSelectedList.UploadedFromDate = null;
     this.fileInfoService.finalSelectedList['CallFromDate'] = (moment(data.fromDate).format("YYYY-MM-DD"));

      this.fileInfoService.finalSelectedList['CallToDate'] = (moment(data.toDate).format("YYYY-MM-DD"));
      this.isdatefilterapplied = true;
      this.selectedPage = 1;
      this.authService.UserSettings.pagination.selectedPageindex = 0; this.recindx = 0;
      this.getFileInfo();

    });
    this.uploadedDateFilterTranscript = this.fileInfoService.UpladedDateFilterApplied_Transcript.subscribe(data => {
      this.fileInfoService.finalSelectedList.FileGuid = this.fileInfoService.finalSelectedList.CallFromDate = this.fileInfoService.finalSelectedList.CallToDate = null;
      this.fileInfoService.finalSelectedList['UploadedFromDate'] = (moment(data.fromDate).format("YYYY-MM-DD"));

      this.fileInfoService.finalSelectedList['UploadedToDate'] = (moment(data.toDate).format("YYYY-MM-DD"));
      this.isdatefilterapplied = true;
      this.selectedPage = 1;
      this.authService.UserSettings.pagination.selectedPageindex = 0; this.recindx = 0;

      this.getFileInfo();
    });

    this.callTrasncriptionList = true;
    this.fileInfoService.overallHeaderCount.pageNavigationCount = 0;
    this.fileInfoService.originalfiledata = []; this.fileInfoService.filesInfo = [];
    this.recindx = 0;
    if (!this.isdatefilterapplied) this.getFileInfo();
    this.cleanUp();
    this.wordCleanUp();
    this.dataService.updatedTranscript.subscribe(() => {
      this.audioFileSet = false;
      this.getTranscriptdata(this.guid);
    });
    this.saveSubcription = this.dataService.saveTranscript$.subscribe(data => { // on save click
      if (data === 'saveWords') { // if save words icon is clicked
        this.newWords = this.dataService.newWords;
        if (this.newWords.length > 0) { // save words only if the new words are present
          this.newWords = this.createOutArray(this.newWords); // removes duplicates
          this.newWords = this.newWords.filter(function (props) {
            delete props.from; // deleting key from object.
            return true;
          });

          this.saveWords(this.newWords, data);
        } else {
          // if there are are no new words in the array.
        }
      } else if (data === 'saveSpeakerLabels') { // To save speaker labels (we are saving speaker labels on blur)

        this.saveWords(this.dataService.speakerLabels, data);
      } else if (data === 'saveTag') { // To save tags.

        this.saveWords(this.dataService.wordTags, data);
      }
    });
    this.defaultFilter();

   // this.audioFileUrlSet();
    this.selectedSpeed = 1.0;
    this.savingWords = false;

  }
  defaultFilter() {
    this.filterDropdownDisplay = true;
  }
  selectedPageIndex(pageNum) {
    this.authService.UserSettings.pagination.selectedPageindex = pageNum - 1;
    this.fileInfoService.filesInfo = [];
    this.selectedPage = pageNum;
    //this.recindx = (this.PageSize * this.authService.UserSettings.selectedPageindex) + 1;
    this.getFileInfo();
  }
  changeWordCount(type) {
    this.wordCountType = type;
    if (this.callTrasncriptionList == true) {
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
    } else if (this.callTrasncriptionList == false) {
      if (type == 'All') {
        if (this.fileInfoService.overallHeaderCount.Jsondata['Call_Transcripts_All_WordCount'] > 1000) {
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
          this.totalWordCount = this.fileInfoService.overallHeaderCount.Jsondata['Call_Transcripts_Customer_WordCount'];
        }
      }
    }
    //console.log(this.wordCountType);
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
  navigateToAgentperformance(menu) {
    this.authService.navigationBackFromAgentPage = true;
    this.authService.currentMenu = menu;
    this._router.navigate(['dashboard/agentPerformance']);
  }
  navigateToRedAlert(menu) {
    this.authService.navigationBackFromRedAlertScorePage = true;
    this.authService.currentMenu = menu;
    this._router.navigate(['dashboard/redAlerts']);
  }
  backtoRedAlertScore(menu) {
    this.authService.navigationBackFromRedAlertPage = true;
    this.authService.currentMenu = menu;
    this._router.navigate(['dashboard/redAlerts']);
  }
  navigateToCustomerSatisfaction(menu) {
    this.authService.currentMenu = menu;
    this._router.navigate(['dashboard/customerSatisfaction']);
  }
  navigatedScoreDetails(menu) {
    this.authService.currentMenu = menu;
    this._router.navigate(['dashboard/agentPerformance']);
    // this.authService.viewScoreDetails.next('navigated');
    this.authService.navigatedfromCallTranscriptionPage = true;
  }
  backtoAgentScore(menu) {
    this.authService.navigationBackFromAgentScore = true;
    this.authService.currentMenu = menu;
    this._router.navigate(['dashboard/agentPerformance']);
  }

  backtoCustomerSatisfaction(menu) {
    this.authService.navigationBackFromCustomerSatisfactionPage = true;
    this.authService.currentMenu = menu;
    this._router.navigate(['dashboard/customerSatisfaction']);
  }
  backtoDisputedCalls(menu) {
    // this.authService.navigationFromDisputedCallsScorePage = true;
    this.authService.navigationFromDisputedCalls = false;
    this.authService.currentMenu = menu;
    this._router.navigate(['dashboard/disputedCalls']);
  }
  selectedRowToViewDetailedScore(item, index) {
    this.authService.navigationBackFromcalltranscrtiptionPage = true;
    this.authService.selectedFileToViewScore = item;
    this.authService.selectedFileindex = index;
  }
  backToCallRecordings(menu) {
    this.authService.navBackToCallRecordings = true;
    this.authService.currentMenu = menu;
    this._router.navigate(['dashboard/callRecordings']);
  }

  agentScore(Guid, FileName) {
    let navigationExtras: NavigationExtras = {
      queryParams: {
        guid: Guid,
        fileName: FileName
      }
    }
    this._router.navigate(['dashboard/agentPerformance'], navigationExtras);
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

  selectedFilter(selectedOption, category) {
    this.selectedPage = 1;
    this.isdatefilterapplied = false;
    this.fileInfoService.finalSelectedList.FileGuid = this.fileInfoService.finalSelectedList.CallFromDate = this.fileInfoService.finalSelectedList.CallToDate = this.fileInfoService.finalSelectedList.UploadedToDate = this.fileInfoService.finalSelectedList.UploadedFromDate = null;
    this.authService.UserSettings.pagination.selectedPageindex = 0; this.recindx = 0;
    if (category == 'Agent') {
      if (this._filterDropdownService.selectedFilterOptions.AgentName.length == 0) {
        this._filterDropdownService.selectedFilterOptions.AgentName.push(selectedOption);
      } else {
        var dulipcate = false;
        for (let i = 0; i < this._filterDropdownService.selectedFilterOptions.AgentName.length; i++) {
          if (this._filterDropdownService.selectedFilterOptions.AgentName[i] == selectedOption) {
            this._filterDropdownService.selectedFilterOptions.AgentName.splice(i, 1);
            dulipcate = true;
          }
        }
        if (dulipcate == false) {
          this._filterDropdownService.selectedFilterOptions.AgentName.push(selectedOption);
        }
      }
      this.convertArrayIntoString('AgentName');
    }
    else if (category == 'PhoneNumber') {
      if (this._filterDropdownService.selectedFilterOptions.CustomerPhoneNo.length == 0) {
        this._filterDropdownService.selectedFilterOptions.CustomerPhoneNo.push(selectedOption);
      } else {
        var dulipcate = false;
        for (let i = 0; i < this._filterDropdownService.selectedFilterOptions.CustomerPhoneNo.length; i++) {
          if (this._filterDropdownService.selectedFilterOptions.CustomerPhoneNo[i] == selectedOption) {
            this._filterDropdownService.selectedFilterOptions.CustomerPhoneNo.splice(i, 1);
            dulipcate = true;
          }
        }
        if (dulipcate == false) {
          this._filterDropdownService.selectedFilterOptions.CustomerPhoneNo.push(selectedOption);
        }
      }
      this.convertArrayIntoString('CustomerPhoneNo');
    } else if (category == 'AccountNumber') {
      if (this._filterDropdownService.selectedFilterOptions.CustomerAccountNo.length == 0) {
        this._filterDropdownService.selectedFilterOptions.CustomerAccountNo.push(selectedOption);
      } else {
        var dulipcate = false;
        for (let i = 0; i < this._filterDropdownService.selectedFilterOptions.CustomerAccountNo.length; i++) {
          if (this._filterDropdownService.selectedFilterOptions.CustomerAccountNo[i] == selectedOption) {
            this._filterDropdownService.selectedFilterOptions.CustomerAccountNo.splice(i, 1);
            dulipcate = true;
          }
        }
        if (dulipcate == false) {
          this._filterDropdownService.selectedFilterOptions.CustomerAccountNo.push(selectedOption);
        }
      }
      this.convertArrayIntoString('CustomerAccountNo');
    }
    if (this._filterDropdownService.selectedFilterOptions.AgentName.length > 0 || this._filterDropdownService.selectedFilterOptions.CustomerPhoneNo.length > 0 || this._filterDropdownService.selectedFilterOptions.CustomerAccountNo.length > 0)
      this.isLeftSideFilterApplied = true;
  }

  selectAndDeselectAll(type) {
    this.selectedPage = 1; this.isdatefilterapplied = false;
    this.fileInfoService.finalSelectedList.FileGuid = this.fileInfoService.finalSelectedList.CallFromDate = this.fileInfoService.finalSelectedList.CallToDate = this.fileInfoService.finalSelectedList.UploadedToDate = this.fileInfoService.finalSelectedList.UploadedFromDate = null;
    this.authService.UserSettings.pagination.selectedPageindex = 0; this.recindx = 0;
    if (type == 1) {
      this._filterDropdownService.selectedFilterOptions.AgentName = [];

      if (this.allAgents) {
        this._filterDropdownService.selectedFilterOptions.AgentName = [];
        this.agentValue = false;
      } else {
        this.agentValue = true;
        for (let i = 0; i < this._filterDropdownService.customerFilterOptions.AgentNames.length; i++) {
          this._filterDropdownService.selectedFilterOptions.AgentName.push(this._filterDropdownService.customerFilterOptions.AgentNames[i].name);
          this._filterDropdownService.customerFilterOptions.AgentNames[i].selected = true;
        }
      }
      this.convertArrayIntoString('AgentName');
    }
    if (type == 2) {
      this._filterDropdownService.selectedFilterOptions.CustomerAccountNo = [];
      if (this.allAccountNos) {
        this._filterDropdownService.selectedFilterOptions.CustomerAccountNo = [];
        this.accountValues = false;
      } else {
        this.accountValues = true;
        for (let i = 0; i < this._filterDropdownService.customerFilterOptions.customerAccountNumbers.length; i++) {
          this._filterDropdownService.selectedFilterOptions.CustomerAccountNo.push(this._filterDropdownService.customerFilterOptions.customerAccountNumbers[i].name);
          this._filterDropdownService.customerFilterOptions.customerAccountNumbers[i].selected = true;
        }
      }
      this.convertArrayIntoString('CustomerAccountNo');
    }
    if (type == 3) {
      this._filterDropdownService.selectedFilterOptions.CustomerPhoneNo = [];
      if (this.allPhoneNos) {
        this._filterDropdownService.selectedFilterOptions.CustomerPhoneNo = [];
        this.phonevalues = false;
      } else {
        this.phonevalues = true;
        for (let i = 0; i < this._filterDropdownService.customerFilterOptions.customerPhoneNumbers.length; i++) {
          this._filterDropdownService.selectedFilterOptions.CustomerPhoneNo.push(this._filterDropdownService.customerFilterOptions.customerPhoneNumbers[i].name);
          this._filterDropdownService.customerFilterOptions.customerPhoneNumbers[i].selected = true;
        }
      }
      this.convertArrayIntoString('CustomerPhoneNo');
    }
    if (this._filterDropdownService.selectedFilterOptions.AgentName.length > 0 || this._filterDropdownService.selectedFilterOptions.CustomerPhoneNo.length > 0 || this._filterDropdownService.selectedFilterOptions.CustomerAccountNo.length > 0)
      this.isLeftSideFilterApplied = true;
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
    this.getFileInfo()
  }
  initCount() {
    //this.customerFilterOptions.AgentNames = this.customerFilterOptions.customerAccountNumbers = this.customerFilterOptions.customerPhoneNumbers = [];
    this.fileInfoService.overallHeaderCount.totalfileInfoLength = this.fileInfoService.overallHeaderCount.Jsondata["TotalRecordCount"];
    //var overallcountdata = JSON.parse(this.fileInfoService.filesInfo[0].overallHeaderCount);
    this.fileInfoService.overallHeaderCount.totalDuration = this.dataService.formatTime(this.fileInfoService.overallHeaderCount.Jsondata["totalDuration"]);
    this.fileInfoService.overallHeaderCount.avgHandleTime = this.dataService.formatTime(
      this.fileInfoService.overallHeaderCount.Jsondata["totalDuration"] / this.fileInfoService.overallHeaderCount.totalfileInfoLength);

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
    //first time display all the list

    if (this._filterDropdownService.customerFilterOptions.IsAgentNameSelected && this._filterDropdownService.customerFilterOptions.IsCustomerAccountSelected) {
      this._filterDropdownService.customerFilterOptions.customerPhoneNumbers = customerPhoneNumbersfromdb;
    }
    else if (this._filterDropdownService.customerFilterOptions.IsAgentNameSelected && this._filterDropdownService.customerFilterOptions.IsCustomerPhoneSelected) {
      this._filterDropdownService.customerFilterOptions.customerAccountNumbers = customerAccountNumbersfromdb;
    }
    else if (this._filterDropdownService.customerFilterOptions.IsCustomerAccountSelected && this._filterDropdownService.customerFilterOptions.IsCustomerPhoneSelected) {
      this._filterDropdownService.customerFilterOptions.AgentNames = AgentNamesfromdb;
    }
    else if (this._filterDropdownService.customerFilterOptions.IsAgentNameSelected) {
      this._filterDropdownService.customerFilterOptions.customerAccountNumbers = customerAccountNumbersfromdb;
      this._filterDropdownService.customerFilterOptions.customerPhoneNumbers = customerPhoneNumbersfromdb;
    }
    else if (this._filterDropdownService.customerFilterOptions.IsCustomerAccountSelected) {
      this._filterDropdownService.customerFilterOptions.AgentNames = AgentNamesfromdb;
      this._filterDropdownService.customerFilterOptions.customerPhoneNumbers = customerPhoneNumbersfromdb;
    }
    else if (this._filterDropdownService.customerFilterOptions.IsCustomerPhoneSelected) {
      this._filterDropdownService.customerFilterOptions.AgentNames = AgentNamesfromdb;
      this._filterDropdownService.customerFilterOptions.customerPhoneNumbers = customerPhoneNumbersfromdb;
    }
    else {
      this._filterDropdownService.customerFilterOptions.customerPhoneNumbers = customerPhoneNumbersfromdb;
      this._filterDropdownService.customerFilterOptions.AgentNames = AgentNamesfromdb;
      this._filterDropdownService.customerFilterOptions.customerAccountNumbers = customerAccountNumbersfromdb;
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

  //sortDates(a, b) {
  //  return b.getTime() - a.getTime();
  //}
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
      this._filterDropdownService.selectedFilterItems.CustomerPhoneNo = this._filterDropdownService.dropdownList;
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
   // console.log(this.fileInfoService.finalSelectedList);
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
      this.filterApplyed = false;
    }
  }
  refresh() {
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
      "TranscriptStatus": 2, //all
      "FileGuid": ''
    };
    this._filterDropdownService.customerFilterOptions.IsCustomerPhoneSelected = this._filterDropdownService.customerFilterOptions.IsCustomerAccountSelected = this._filterDropdownService.customerFilterOptions.IsAgentNameSelected = false;
    this.fileInfoService.filesInfo = []; this.recindx = 0; this.authService.UserSettings.pagination.selectedPageindex = 0;
    this.selectedPage = 1;
    this.isdatefilterapplied = false;
    this.getFileInfo();
  }

  getFileInfo() {  // To get the information of the files to display in the table in the dashboard/home page.
    //this.transcriptionListLoadmore = true;
    this.fileInfoService.originalfiledata = [];
    this.fileInfoService.filesInfo = [];

    this.fileInfoService.overallHeaderCount = {
      Jsondata: {}, totalfileInfoLength: 0, totalDuration: '', pageNavigationCount: 0, totalCompletedLength: 0, totalProcessingLength: 0, avgHandleTime: ''
    };
    this.loading = true;
    this.smallLoader = true;

    if (this.authService.UserSettings.pagination.selectedPageindex > 0) {
      this.recindx =
        (this.authService.UserSettings.pagination.pageSize * this.authService.UserSettings.pagination.selectedPageindex) + 1;
      this.selectedPage = this.authService.UserSettings.pagination.selectedPageindex + 1;
    }
    else this.recindx = 0;
    let i: any;
    this.fileInfoService.getFileInfo(this.recindx, true, this.fileInfoService.finalSelectedList).subscribe(data => {
      if (data == null || data == undefined || data["FileInfo"].length == 0) {
        this.toastr.error('No record found!');
        this.loading = false;
        this.smallLoader = false;
        this.fileInfoService.overallHeaderCount.totalfileInfoLength = 0;
        this.fileInfoService.overallHeaderCount.totalDuration =
          this.fileInfoService.overallHeaderCount.avgHandleTime = "0";
        this.fileInfoService.filtercriteria.callDateRange.uploadedToDate = this.fileInfoService.filtercriteria.callDateRange.uploadedFromDate =
          this.fileInfoService.filtercriteria.callDateRange.callToDate = this.fileInfoService.filtercriteria.callDateRange.callFromDate = null;
        return;
      }
      data["FileInfo"].forEach(element => {
        element["isActive"] = false;
        const filedocx = element.Guid.replace('mp3', 'docx'); // we need to call the API with the guid having docx extension
        this.dataService.downloadLinks.set(element.Guid, `${environment.download_Api}/${filedocx}`);
        this.fileInfoService.filesInfo.push(element);
        if (this.fileInfoService.originalfiledata.filter(f => f.Guid === element.Guid).length == 0)
          this.fileInfoService.originalfiledata.push(element);  //for calendar filter
        element["OtherColumns"] = JSON.parse(element.OtherColumns);

      });
     // this.fileInfoService.filesInfo = this.fileInfoService.filesInfo.sort((a, b) => new Date(b.UploadedDate).getTime() - new Date(a.UploadedDate).getTime()); //sorting date
      this.fileInfoLength = this.fileInfoService.filesInfo.length;
      this.fileInfoService.overallHeaderCount.Jsondata = JSON.parse(data["Jsondata"]);
      this.initCount();
      this.authService.UserSettings.pagination.pageSize = this.fileInfoService.overallHeaderCount.Jsondata["pageSize"];
      this.loadmoreflag = data["FileInfo"].length >= this.authService.UserSettings.pagination.pageSize;
      //this.totalpagecount = [];
      //for (var p = 1; p <= Math.ceil(this.fileInfoService.filesInfo[0].TotalRecordCount / this.fileInfoService.filesInfo[0].PageSize); this.totalpagecount.push({ pagemumber: p }), ++p);
      this.totalpagecount = [];
      var p1 = parseInt(this.fileInfoService.overallHeaderCount.Jsondata["TotalRecordCount"]);
      var p2 = parseInt(this.fileInfoService.overallHeaderCount.Jsondata["pageSize"]) + 1;

      var tct = Math.ceil(p1 / p2);
      for (var p = 1; p <= tct; this.totalpagecount.push({ pagemumber: p }), ++p);
      this.createUploadedTimeArray(); // creating array containing time based on the time zone.
      //load first file by default
      let indexCount;
      if (this.fileInfoService.filesInfo.length > 0) {
        var firstFile = this.fileInfoService.filesInfo[0];
        if (this.navigatedFromCallRecordings) {
          // if (this.params.fileIndex < this.fileInfoLength)
          this.callTrasncriptionList = false;
          this.changeWordCount('All');
          this.apiSource = this.params.apiSource;
          this.editFile(this.params.guid, this.params.fileName, this.params.status, this.params.fileIndex, this.params.apiSource);
          this.navigatedFromCallRecordings = false;
          this.fileInfoService.finalSelectedList.FileGuid = '';

          this.fileInfoService.finalSelectedList = {
            "AgentName": null,
            "CustomerAccountNo": null,
            "CustomerPhoneNo": null,
            "ProgramName": null,
            "CallFromDate": this.fileInfoService.filtercriteria.callDateRange.orgCallFromDate,
            "CallToDate": this.fileInfoService.filtercriteria.callDateRange.orgCallToDate,
            "UploadedFromDate": this.fileInfoService.filtercriteria.callDateRange.orgUploadedFromDate,
            "UploadedToDate": this.fileInfoService.filtercriteria.callDateRange.orgUploadedToDate,
            "TranscriptStatus": 2,  //all
            "FileGuid": ''
          };

        } else {
          this.callTrasncriptionList = !this.viewtranscript;
          //   this.editFile(firstFile.Guid, firstFile.FileName, firstFile.Status, 1); don't call not showing on page load
        }
      }
      this.loading = false;
      this.smallLoader = false;
      this.changeWordCount(this.wordCountType);
    },
      error => {
        console.log(error);
        this.toastr.error(error.message);
        this.loading = false;
        this.smallLoader = false;
      },
      () => {
        this.loading = false; this.smallLoader = false;
      });
  }


  addFrequencyDownloadChunck() {
    this.addfrequency = true;
  }
  closePopup() {
    this.addfrequency = false;
  }
  transcriptList() {
    this.audioActive = false;
    this.fileInfoService.finalSelectedList.FileGuid = '';
    this.viewtranscript = false;
    this.isLeftSideFilterApplied = this._filterDropdownService.selectedFilterOptions.AgentName.length > 0 || this._filterDropdownService.selectedFilterOptions.CustomerPhoneNo.length > 0 || this._filterDropdownService.selectedFilterOptions.CustomerAccountNo.length > 0;
    this.getFileInfo();
    this.callTrasncriptionList = true;
  }
 getsplittedaudiofiles(url) {
    this.addfrequency = false;
    var requestdata = { 'Frequency': this.splittedAudioRequest.Frequency, 'FileGuid': this.guid, 'FileUrl': url };
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Accept': 'application/zip'
    });
    const options = {
      responseType: "arraybuffer",
      headers: headers
    };
    this.dataService.dataServicePostWithOptions(
      `${environment.transcriptiondownloader_Api}/api/document/downloadtranscriptinchunks`,
      requestdata, options)
      .subscribe((response) => {
        let saveAs = require('file-saver');
        this.loading = false;
        let b: any = new Blob([response], { type: 'application/zip' });
        saveAs.saveAs(b, `${this.guid}.zip`);
      }),
      err => {
        console.log(err);
      },
      () =>
        this.loading = false;
  }
  proceedToDownloadChunks() {
    this.loading = true;
    let filepathurl = '';
    if (typeof this.guid === 'undefined') {
      return false;
    } else {
      this.dataService.dataServiceGet(`${environment.transcription_Api}/api/watson/GetReadPreSignedUrl/${this.guid}/${this.apiSource}`)
        .subscribe((response: any) => {
          filepathurl = response.url;
        },
          err => {
            console.log(err);
          },
          () => {
            this.getsplittedaudiofiles(filepathurl);
          });
    }
  }

  
  createUploadedTimeArray() {
    for (let i = 0; i < this.fileInfoLength; i++) {
      if (!(this.fileInfoService.filesInfo[i].Status === 'Not Uploaded')) {
        if (this.fileInfoService.filesInfo[i].UploadedDate) {
          const gmtDateTime = moment.utc(this.fileInfoService.filesInfo[i].UploadedDate);
          //  const local = momentTz(gmtDateTime).tz('America/Los_Angeles').format('MMM DD, YYYY h:mmA'); // using moment library to format
          const local = momentTz(gmtDateTime).tz('UTC').format('MMM DD, YYYY h:mmA'); // using moment library to format
          // let local = gmtDateTime.local().format('MMM DD, YYYY h:mmA');
          this.uploadedTimeArray.push(local);
        } else {
          this.uploadedTimeArray.push(' ');
        }
      } else {
        this.uploadedTimeArray.push(' ');
      }
    }
  }
  transcriptionDetails(transcriptStatus, apiSource) {
    this.callTrasncriptionList = false;
    
    this.apiSource = apiSource;
    if (transcriptStatus === 2) {
      this.selectedTranscriptionEditorStatusId = true;
    } else {
      this.selectedTranscriptionEditorStatusId = false;
    }
    this.fileInfoService.finalSelectedList.FileGuid = this.guid; this.authService.UserSettings.pagination.selectedPageindex = 0;
    this.viewtranscript = true; this.isdatefilterapplied = false;
    this.getFileInfo();  //FILTERING LEFT SIDE PANEL AND TOP PANEL DATA

  }

  editFile(Guid, FileName, Status, FileIndex, transcriptSource) {
    this.selectedTranscriptedFile = FileName;
    this.apiSource = transcriptSource;
    this.transcription = [];
    this.loading = true;
    if (Status === 'Completed') {
      this.fileInfoService.filesInfo.map((item, index) => {
        if (item.Guid === Guid) {
          //if (FileIndex == index) {
          item.isActive = true;
          this.dataService.selectedFile = item;
          this.authService.disputedCallDuration = item.Duration;

         // this.IsViewScoreDataLoaded = true;
        } else {
          item.isActive = false;
        }
        //}
      },
        err => {
          this.loading = false;
        },
        () => {
          this.loading = false;
          //this.IsViewScoreDataLoaded = false;
        });
      this.audioFileUrlSet();
      this.guid = Guid;
     // this.getTranscriptdata(this.guid); commented this as we are calling aready in audioFileUrlSet();
    }

  }
  ngOnDestroy() { // clearing the interval of the audio and unsubscribing from the subscriptions.
    this.authService.navigationFromAgentPage = false;
    this.authService.navigationFromDisputedCalls = false;
    this.authService.navigationFromAgentScorePage = false;
    this.authService.navigationFromRedAlertPage = false;
    this.authService.navigationFromRedAlertScorePage = false;
    this.authService.navfromCallRecordings = false;
    this.authService.navigationFromCustomerSatisfactionPage = this.authService.navigationFromCustomerSatisfactionScorePage = false;
    clearInterval(this.myInterval);
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.saveSubcription) {
      this.saveSubcription.unsubscribe();
    }
    this.map = {};
    this.dataService.removeCurrentTime();

    this.dateFilterTranscript.unsubscribe();
    this.uploadedDateFilterTranscript.unsubscribe();
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

  speedChanger(speed) { // changing playback rate.
    this.track.nativeElement.playbackRate = speed;
    this.selectedSpeed = speed;
  }

  @HostListener('window:keypress', ['$event'])
  handleKeyboardEvent(e: KeyboardEvent) {  // keyboard shortcuts
    this.map[e.keyCode] = e.type === 'keydown';
    this.pauseAndPlay();
    if (this.map[18] && this.map[39]) { // ALT + right arrow
      this.track.nativeElement.currentTime += 5;
      return false;
    } else if (this.map[18] && this.map[37]) { // ALT + left arrow
      if (!this.track.nativeElement.currentTime) {
        return false; // to prevent default behaviour when current time is zero.
      }
      this.track.nativeElement.currentTime -= 5;
      return false; // to overwrite the default behaviour
    } else if (this.map[18] && this.map[38]) { // ALT + UP
      this.track.nativeElement.volume += 0.1;
      return false;
    } else if (this.map[18] && this.map[40]) { // ALT + DOWN
      this.track.nativeElement.volume -= 0.1;
      return false;
    } else if (this.map[18] && this.map[83]) { // ALT + S
      this.dataService.saveEditedTranscript('saveWords');
      return false;
    } else if (this.map[13]) { // Enter key
      return false; // preventing from creating new line.
    }
  }

  pauseAndPlay() {
    if (this.map[18] && this.map[80]) { // ALT + P
      if (this.playing) { // if playing pause and vice versa
        this.track.nativeElement.pause();
      } else {
        this.track.nativeElement.play();
      }
      return false;
    }
  }

  searchClicked(e) { // to toggle search and replace
    this.searchClick = !this.searchClick;
  }

  saveWords(editedTranscriptData, saveType) { // to save words
    // checking the audio status before saving (after saving, we will play/pause if it was playing/pausing )
    this.isPlaying = this.playing;
    this.track.nativeElement.pause();

    this.dataService
      .dataServicePut(`${environment.transcription_Api}/api/watson/save/` + this.guid, editedTranscriptData)
      .subscribe(data => {
        this.wordCleanUp(); // deleting data from the variables
        this.savingWords = true;
        this.toastr.success('Changes saved successfully');

        if (this.isPlaying) {
          this.track.nativeElement.play();
        }
        if (saveType === 'saveTag') {

          this.getTranscriptdata(this.guid);
        }
      },
        error => {
          console.log(error);
          this.toastr.error('Error occured while saving data');
          this.wordCleanUp();
        }, () => {
          this.loading = false;
          if (!(saveType === 'saveTag')) {

            // this.getTranscriptdata(this.guid); to retain scroll bar
          }
        });
  }

  wordCleanUp() {
    this.newWords = [];
    this.dataService.newWords = [];
    this.dataService.speakerLabels = [];
    this.dataService.wordTags = [];
  }
  updateTranscriptEditorStatus(statusid, guid) {

    var tmpfile = this.fileInfoService.filesInfo.filter(f => f.Guid == guid);
    if (tmpfile != null && tmpfile.length > 0)
      if (this.role != 'Customer' && tmpfile[0].TranscriptionEditorStatusId != 2) {
        this.fileInfoService.updateEditorStatus(guid, statusid).subscribe(d => {
          if (statusid == 2)
            this.toastr.success('Updated successfully');
        }
          , (err) => {
            console.log(err);
            this.toastr.error('Error occured while saving data');
          });
      }
  }
  getTranscriptdata(guid) {
    this.dataService.setGuid(guid);
    let url = '';
    if (this.apiSource === 'AWSAPI') {
      url = `${environment.transcription_Api}/api/watson/file/` + guid + `/1`;
    } else {
      url = `${environment.transcription_Api}/api/watson/file/` + guid;
    }
    this.dataService
      .dataServiceGet(url)
      .subscribe(data => {
        // this.loading = false;
        this.IsViewScoreDataLoaded = true;
        this.cleanUp();
        this.audioSource = '';
        this.transcriptData = data;
        if (this.audioFileSet) {
          this.audioActive = true;
          this.audioSource = this.transcriptData.FileUrl;
          this.authService.transcriptdataLoaded = false;
        }
        //if (!this.audioSource) { // because we do not want to load audio again if it is already set.
        //  this.audioSource = this.transcriptData.FileUrl;
        //}
        this.instructions = this.transcriptData.Instruction;
        this.transcription = JSON.parse(this.transcriptData.Body);
        this.loading = false;
        this.newTranscription = this.transcription;
        this.transcriptionLength = this.transcription.length;
        this.createWordStats();
      },
        (err) => {
          console.log(err);
        },
      () => {
        this.IsViewScoreDataLoaded = false;
          if (this.role != 'Customer')
            this.updateTranscriptEditorStatus(1, guid); //1 for processing 2 for completed
          
        });
  }

  cleanUp() {
    this.confidenceArray = [];
    this.durationArray = [];
    this.errorWordCount = 0;
    this.totalWordCount = 0;
    this.wordLength = 0;
  }

  createWordStats() { // analysis on words (confidence array and duration array is used to create graph.)
    this.wordTags = [];
    for (let i = 0; i < this.transcriptionLength; i++) {
      for (let j = 0; j < this.transcription[i].SpeakerTranscript.Content.length; j++) {
        if (this.transcription[i].SpeakerTranscript.Content[j].Confidence < 0.8) {
          this.errorWordCount++;
        }
        this.confidenceArray.push(this.transcription[i].SpeakerTranscript.Content[j].Confidence);
        this.durationArray.push(
          this.dataService
            .formatTime(
              this.transcription[i].SpeakerTranscript.Content[j].Begin + this.transcription[i].SpeakerTranscript.Content[j].Duration));
        if (this.transcription[i].SpeakerTranscript.Content[j].Tag) {
          this.wordTags = this.wordTags.concat(this.transcription[i].SpeakerTranscript.Content[j].Tag.split(','));
        }
      }
    }
    this.totalWordCount = this.confidenceArray.length;
    this.wordLength = (this.confidenceArray.length - 1);
  }

  tagSelected(tag) {
    this.selectedTagType = tag;
  }

  createOutArray(a) { // to filter out duplicates from the array.
    const len = a.length;
    const fromValues = [];
    fromValues[0] = a[len - 1];
    for (let i = len - 1; i >= 0; i--) {
      let flag = 0;
      const flen = fromValues.length;
      for (let j = 0; j < flen; j++) {
        if (a[i].from === fromValues[j].from) {
          flag = 1;
        }
      }
      if (flag === 0) {
        fromValues.push(a[i]);
      }
    }
    return fromValues;
  }
}
