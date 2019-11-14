
import { Component, ElementRef, HostListener, OnInit, ViewChild, TemplateRef, OnDestroy, ViewContainerRef, trigger, transition, style, animate, NgZone } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';
import { DataService } from '../../../shared/data.service';
import { TranscriptionTimetrackerService } from '../../../shared/transcription-timetracker-service';
import { ISubscription } from 'rxjs/Subscription';
import { FileInfoService } from '../../call-recordings/shared/file-info.service';
import { FileInfo } from '../../../components/call-recordings/fileInfo.interface';
import * as moment from 'moment';
import * as momentTz from 'moment-timezone';
import { AuthorizationService } from '../../../shared/authorization.service';
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
import { AgentPerformanceService } from '../../../components/agent-performance/shared/agent-performance.service';
import { Boolean } from 'aws-sdk/clients/appstream';
import { TranscriptService } from '../shared/transcript.service';

@Component({
  selector: 'app-view-transcript',
  templateUrl: './view-transcript.component.html',
  styleUrls: ['./view-transcript.component.css']
})
export class ViewTranscriptComponent implements OnInit {
  config: any;
  role: any;
  audioVisible = false;
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
  totalWordCount: number;
  newWords: any[] = [];
  subscription: ISubscription;
  saveSubcription: ISubscription;
  loading: boolean;
  smallLoader: boolean;
  isLeftSideFilterApplied: boolean = false;
  speedArray: any[] = [0.5, 1.0, 1.5, 2.0];
  selectedSpeed: any;
  map: any = {};
  wordCountType = '';
  playing: boolean;
  selectedTagType: string;
  wordTags: string[];
  instructions: string;
  searchClick = false;
  savingWords: boolean;
  isPlaying: boolean;
  audioFileSet = false;
  dateFilterTranscript: Subscription;
  uploadedDateFilterTranscript: Subscription;
  selectedTranscriptionEditorStatusId: boolean;
  backToAgentPerformace: boolean;
  backToRedAlert: boolean;
  apiSource: any;
  viewtranscript: boolean = false;
  audioPath: string;
  timeSubscription: ISubscription;
  currentTime: any = 0.0;
  customerFilterOptions = {
    AgentNames: [],
    customerPhoneNumbers: [],
    customerAccountNumbers: [],
    IsAgentNameSelected: false,
    IsCustomerAccountSelected: false,
    IsCustomerPhoneSelected: false
  };
  audioActive = false;
  showTiles = true;
  agentValue = false;
  phonevalues = false;
  accountValues = false;
  redAlertTitle: boolean = false;
  agentTitle: boolean = false;
  allAgents = false;
  allAccountNos = false;
  allPhoneNos = false;
  selectedFilterOptions = {
    AgentName: [],
    CustomerPhoneNo: [],
    CustomerAccountNo: []
  };
  finalSelectedList = {
    AgentNames: null,
    CustomerPhoneNo: null,
    CustomerAccountNo: null
  }
  showRecommendations: boolean;
  fileDuration = 0.0;
  public fileInfoLength: any;
  uploadedTimeArray: string[] = [];
  guid: any;
  params: any;
  selectedPage = 1;
  loadmoreflag: boolean = false;
  // transcriptionListLoadmore: boolean = false;
  addfrequency: boolean = false;  
  selectedTranscriptedFile: any;
  selectedRedAlertTranscriptFile: any;
  navigatedFromCallRecordings: boolean = false;
  splittedAudioRequest: any = { Frequency: 30 };11
  selectedFile: number;
  totalpagecount: any = [];
  recindx = 0;
  checkbox: boolean;
  callTrasncriptionList: boolean;
  isdatefilterapplied = false;
  private audio: any;
  //sorting
  key: string = 'CallDate';
  reverse: boolean = false;
  redAlerts: boolean;
  agentsScore: boolean;
  sortDate = false;
  printConversation: any = { AgentText: "", CustomerText: "", CurrentIndex: 0, loopIndex: 0 };
  agentPerformanceCalculation: any = { SpotedKeyWords: "", ScoreWeightage: "", QuestionCategory: [] };
  MatchedKeywordsTimings = [];
  colorPallet = ["#13ba8a", "#c1bf30", "#ef8b2c", "#ecaa38", "#a2b86c", "#5ca793", "#1395ba", "#117899", "#0f5b78", "#0d3c55", "#c02e1d", "#ebc844"];
  questionnaire: any;
  recommendationsList: any = [];
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
    private _ngZone: NgZone,
    public transcripService : TranscriptService,
    public _agent: AgentPerformanceService,
    public fileInfoService: FileInfoService, public toastr: ToastsManager, vRef: ViewContainerRef) {
    let decod = jwt_decode(this.authService.getToken());
    this.authService.UserProfiledetails.role.name = decod['userRole'];
    this.role = this.authService.UserProfiledetails.role.name;
    //toastr
    this.toastr.setRootViewContainerRef(vRef);
    this.checkbox = false;

  }
  

  getDetailedScores(Guid) {
    this.MatchedKeywordsTimings = [];
    this.agentPerformanceCalculation = { SpotedKeyWords: "", ScoreWeightage: "", QuestionCategory: [] };
    this._agent.getScoreDetails(Guid, 1).subscribe((response: any) => {
      this.questionnaire = JSON.parse(response);
      this.recommendationsList = [];
      this.questionnaire.forEach(element => {
        if (element.Question_Suggestion != null && element.Question_Suggestion != '') {
          let newObj = {
            "Question_Category": '',
            "Question_Suggestion": []
          }
          if (element.Score_Weightage === 0) {
            if (this.recommendationsList.length > 0) {
             // var exists = false;
              let newArr = [];

              newArr = _.where(this.recommendationsList, { Question_Category: (element.Question_Category).trim() });
              if (newArr.length > 0) {
                this.recommendationsList.forEach(match => {
                  if (match.Question_Category == newArr[0].Question_Category) {
                    match.Question_Suggestion.push(element.Question_Suggestion);
                  }
                });
              } else {
                newObj.Question_Category = (element.Question_Category).trim();
                newObj.Question_Suggestion.push(element.Question_Suggestion);
                this.recommendationsList.push(newObj);
              }
              //this.recommendationsList.forEach(element => {
              //  if (element.Question_Category)
              //});
            } else {
              newObj.Question_Category = (element.Question_Category).trim();
              newObj.Question_Suggestion.push(element.Question_Suggestion);
              this.recommendationsList.push(newObj);
            }

            //newObj.Question_Category = element.Question_Category;
            //newObj.Question_Suggestion = element.Question_Suggestion;
            //this.recommendationsList.push(newObj);
          }
        }
      });
     // console.log(this.recommendationsList);
      this.transcripService.questionnaireList = this.questionnaire;

     var category = _.uniq(this.questionnaire.map(element => element["Question_Category"].trim()));
      var spottedkeyscategorywise = [];
      for (var w = 0; w < category.length; w++) {
        var newCategory = {
          "Name": category[w],
          "Width": 0,
          "Color": this.colorPallet[w],
          "Questions": []
        }
        this.agentPerformanceCalculation['QuestionCategory'].push(newCategory);
        var matchedCategoryOBJ = {
          'Category': category[w],
          'Questions': [],
          "TotalQuestions": 0
        }
        this.MatchedKeywordsTimings.push(matchedCategoryOBJ);
      }
      for (var totalQtn = 0; totalQtn < this.questionnaire.length; totalQtn++) {
        for (var catCheck = 0; catCheck < this.MatchedKeywordsTimings.length; catCheck++) {
          if (this.questionnaire[totalQtn].Question_Category.trim() === this.MatchedKeywordsTimings[catCheck].Category) {
            this.MatchedKeywordsTimings[catCheck].TotalQuestions = ++this.MatchedKeywordsTimings[catCheck].TotalQuestions;
          }
        }
      }

      for (var cat = 0; cat < this.agentPerformanceCalculation['QuestionCategory'].length; cat++) {
        for (var qtn = 0; qtn < this.questionnaire.length; qtn++) {
          if (this.agentPerformanceCalculation['QuestionCategory'][cat]['Name'] === this.questionnaire[qtn]["Question_Category"].trim()) {
            var keysWordsListArr = [];
            if (this.questionnaire[qtn]["Keyword_list"] != "") {
              keysWordsListArr = this.questionnaire[qtn]["Keyword_list"].split(',');
            }
            for (var keySpace = 0; keySpace < keysWordsListArr.length;keySpace++) {
              keysWordsListArr[keySpace] = keysWordsListArr[keySpace].trim();
              keysWordsListArr[keySpace] = keysWordsListArr[keySpace] + ' ';
            }
            var innerOBJ = {
              "Qtn_CategoryName": this.questionnaire[qtn]["Question_Category"],
              "Qtn_Keywords": keysWordsListArr,
              "Qtn_Rule": this.questionnaire[qtn]["Conditon"],
              "Score_Weightage": this.questionnaire[qtn]["Score_Weightage"]
            }

            this.agentPerformanceCalculation['QuestionCategory'][cat]['Questions'].push(innerOBJ);
          }
        }
      }

      for (var qtn = 0; qtn < this.agentPerformanceCalculation['QuestionCategory'].length; qtn++) {
        var spottedkeys = {
          keywords: [], QuestionCategory: [], ScoreWeightage: 0, TotalkeywordsMatched: 0, keyWordsColor: '',
        };
        for (var c = 0; c < this.questionnaire.length; c++) {
          if (this.questionnaire[c].Question_Category.trim() === this.agentPerformanceCalculation['QuestionCategory'][qtn].Name) {
            var keysListArr = [];
            this.questionnaire[c].Spotted_Keyword = this.questionnaire[c].Spotted_Keyword.replace(/"/g, "");
            if (this.questionnaire[c].Spotted_Keyword != "") {
              keysListArr = this.questionnaire[c].Spotted_Keyword.split(',');
              if (keysListArr.length > 0) {
                for (var spl = 0; spl < keysListArr.length; spl++) {
                  spottedkeys.keywords.push(keysListArr[spl]);
                }
              }
            }
            spottedkeys.QuestionCategory = this.questionnaire[c].Question_Category.trim();
            spottedkeys.ScoreWeightage += this.questionnaire[c].Score_Weightage;
          }
        }
        spottedkeyscategorywise.push(spottedkeys);
      };

      this.agentPerformanceCalculation['SpotedKeyWords'] = spottedkeyscategorywise;

    });
  }
  redAlertDetailedScores(Guid) {
    this.agentPerformanceCalculation = { SpotedKeyWords: "", ScoreWeightage: "", QuestionCategory: [] };
    this._agent.getScoreDetails(Guid, 3).subscribe((response: any) => {
      this.questionnaire = JSON.parse(response);
      var category = _.uniq(this.questionnaire.map(element => element["Question_Category"].trim()));
      var spottedkeyscategorywise = [];
      for (var w = 0; w < category.length; w++) {
        var newCategory = {
          "Name": category[w],
          "Width": 0,
          "Color": this.colorPallet[w],
          "Questions": []
        }
        this.agentPerformanceCalculation['QuestionCategory'].push(newCategory);
        var matchedCategoryOBJ = {
          'Category': category[w],
          'Questions': [],
          "TotalQuestions": 0
        }
        this.MatchedKeywordsTimings.push(matchedCategoryOBJ);
      }
      for (var totalQtn = 0; totalQtn < this.questionnaire.length; totalQtn++) {
        for (var catCheck = 0; catCheck < this.MatchedKeywordsTimings.length; catCheck++) {
          if (this.questionnaire[totalQtn].Question_Category.trim() === this.MatchedKeywordsTimings[catCheck].Category) {
            this.MatchedKeywordsTimings[catCheck].TotalQuestions = ++this.MatchedKeywordsTimings[catCheck].TotalQuestions;
          }
        }
      }

      for (var cat = 0; cat < this.agentPerformanceCalculation['QuestionCategory'].length; cat++) {
        for (var qtn = 0; qtn < this.questionnaire.length; qtn++) {
          if (this.agentPerformanceCalculation['QuestionCategory'][cat]['Name'] === this.questionnaire[qtn]["Question_Category"].trim()) {
            var keysWordsListArr = [];
            if (this.questionnaire[qtn]["Keyword_list"] != "") {
              keysWordsListArr = this.questionnaire[qtn]["Keyword_list"].split(',');
            }
            for (var keySpace = 0; keySpace < keysWordsListArr.length; keySpace++) {
              keysWordsListArr[keySpace] = keysWordsListArr[keySpace].trim();
              keysWordsListArr[keySpace] = keysWordsListArr[keySpace] + ' ';
            }
            var innerOBJ = {
              "Qtn_CategoryName": this.questionnaire[qtn]["Question_Category"],
              "Qtn_Keywords": keysWordsListArr,
              "Qtn_Rule": this.questionnaire[qtn]["Conditon"]
            }

            this.agentPerformanceCalculation['QuestionCategory'][cat]['Questions'].push(innerOBJ);
          }
        }
      }

      for (var qtn = 0; qtn < this.agentPerformanceCalculation['QuestionCategory'].length; qtn++) {
        var spottedkeys = {
          keywords: [], QuestionCategory: [], ScoreWeightage: 0, TotalkeywordsMatched: 0
        };
        for (var c = 0; c < this.questionnaire.length; c++) {
          if (this.questionnaire[c].Question_Category.trim() === this.agentPerformanceCalculation['QuestionCategory'][qtn].Name) {
            var keysListArr = [];
            this.questionnaire[c].Spotted_Keyword = this.questionnaire[c].Spotted_Keyword.replace(/"/g, "");
            if (this.questionnaire[c].Spotted_Keyword != "") {
              keysListArr = this.questionnaire[c].Spotted_Keyword.split(',');
              if (keysListArr.length > 0) {
                for (var spl = 0; spl < keysListArr.length; spl++) {
                  spottedkeys.keywords.push(keysListArr[spl]);
                }
              }
            }
            spottedkeys.QuestionCategory = this.questionnaire[c].Question_Category.trim();
            spottedkeys.ScoreWeightage += this.questionnaire[c].Score_Weightage;
          }
        }
        spottedkeyscategorywise.push(spottedkeys);
      };

      this.agentPerformanceCalculation['SpotedKeyWords'] = spottedkeyscategorywise;
   
    });
  }
  showAvgScore() {
    this.agentPerformanceCalculation['ScoreWeightage'] = this.questionnaire.map(element => element["Score_Weightage"]).reduce((sum, item) => sum + item, 0);
  
  }
  audioFileUrlSet() {
    this.audioFileSet = false;
    setTimeout(() => {
      this.track.nativeElement.addEventListener('play', () => { // adding play event on audio
        this.playing = true;
        this.myInterval = setInterval(() => {
          // sending current time on the audio for every 100 milliseconds as an observable
          this._timeTrackerService.sendCurrentTime(this.track.nativeElement.currentTime);
          // this.printaudiotext(this.track.nativeElement.currentTime);
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
        this.dataService.countStart = true;
        this.dataService.count = 0;
        this.dataService.customerEndPoints = [];
        this.agentPerformanceCalculation.ScoreWeightage = 0;
        this.audioFileSet = true;
        this.getTranscriptdata(this.guid);
      }
      this.track.nativeElement.playbackRate = 1.0; // setting initial playback rate and speed of the audio.
    }, 5000);
  }

  ngOnInit() {
    this.recommendationsList = [];
    this.showRecommendations = false;
    this.wordCountType = 'All';
    this.audioActive = false;
    this.audioVisible = false;
    this.dataService.countStart = false;
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
      if (this.params.navigatedFrom === 'agentperformance') {
        this.backToAgentPerformace = true;
        this.getDetailedScores(this.params.guid);
        this.agentsScore = true;
      }
      if (this.params.navigatedFrom === 'redAlerts') {
        this.backToRedAlert = true;
        this.redAlertDetailedScores(this.params.guid);
        this.redAlerts = true;
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
    this.timeSubscription = this._timeTrackerService.trackTime$.subscribe(curTime => {
      this.currentTime = curTime;
      for (var check = 0; check < this.MatchedKeywordsTimings.length; check++) {
        for (var matchQtns = 0; matchQtns < this.MatchedKeywordsTimings[check].Questions.length; matchQtns++){
          if (this.currentTime >= this.MatchedKeywordsTimings[check].Questions[matchQtns].Time) {
            for (var catg = 0; catg < this.agentPerformanceCalculation['QuestionCategory'].length; catg++) {
              if (this.MatchedKeywordsTimings[check]['Category'] === this.agentPerformanceCalculation['QuestionCategory'][catg].Name && !this.MatchedKeywordsTimings[check].Questions[matchQtns].Matched) {
                // this.agentPerformanceCalculation['QuestionCategory'][catg].Width = Math.ceil((this.MatchedKeywordsTimings[check].counter / this.agentPerformanceCalculation['SpotedKeyWords'][catg].spotedKeywordsCount) * 100);
                this.MatchedKeywordsTimings[check].Questions[matchQtns].Matched = true;
                var matchedQtn = 'QuestionNo' + this.MatchedKeywordsTimings[check].Questions[matchQtns].QuestionNo;
                this.MatchedKeywordsTimings[check][matchedQtn] = ++this.MatchedKeywordsTimings[check][matchedQtn];
                if (this.MatchedKeywordsTimings[check][matchedQtn] === this.MatchedKeywordsTimings[check].Questions[matchQtns]['WordsToMatch']) {
                  this.MatchedKeywordsTimings[check].TotalConditionsFullfilled = ++this.MatchedKeywordsTimings[check].TotalConditionsFullfilled;
                  //this.agentPerformanceCalculation.ScoreWeightage +=
                }
                this.agentPerformanceCalculation['QuestionCategory'][catg].Width = Math.ceil((100 / this.MatchedKeywordsTimings[check]['TotalQuestions']) * this.MatchedKeywordsTimings[check]['TotalConditionsFullfilled']);
                
                var totalscore = 0;
                this.MatchedKeywordsTimings.forEach(element => {
                  if (element.Questions.length > 0) {
                    element.Questions.forEach(question => {
                      if (question.Matched === true) {
                        totalscore += question.Score_Weightage;
                      }
                    });
                  }
                //  element.
                });
               // this.agentPerformanceCalculation.ScoreWeightage = totalscore;
              }
            }
          } else if (this.currentTime < this.MatchedKeywordsTimings[check].Questions[matchQtns].Time){
            for (var catg = 0; catg < this.agentPerformanceCalculation['QuestionCategory'].length; catg++) {
              if (this.MatchedKeywordsTimings[check]['Category'] === this.agentPerformanceCalculation['QuestionCategory'][catg].Name && this.MatchedKeywordsTimings[check].Questions[matchQtns].Matched) {
                // this.agentPerformanceCalculation['QuestionCategory'][catg].Width = Math.ceil((this.MatchedKeywordsTimings[check].counter / this.agentPerformanceCalculation['SpotedKeyWords'][catg].spotedKeywordsCount) * 100);
                this.MatchedKeywordsTimings[check].Questions[matchQtns].Matched = false;
                var matchedQtn = 'QuestionNo' + this.MatchedKeywordsTimings[check].Questions[matchQtns].QuestionNo;
                this.MatchedKeywordsTimings[check][matchedQtn] = 0;
                this.MatchedKeywordsTimings[check].TotalConditionsFullfilled = 0;
                this.agentPerformanceCalculation['QuestionCategory'][catg].Width = Math.ceil((100 / this.MatchedKeywordsTimings[check]['TotalQuestions']) * this.MatchedKeywordsTimings[check]['TotalConditionsFullfilled']);
               // this.agentPerformanceCalculation.ScoreWeightage += Math.ceil((100 / this.agentPerformanceCalculation['QuestionCategory'].length) / this.MatchedKeywordsTimings[check]['TotalQuestions']);
               }
            }
          }
        }
      }
      if (this.currentTime >= this.fileDuration && this.recommendationsList.length > 0) {
        this.showRecommendations = true;
      } else {
        this.showRecommendations = false;
      }
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
   // this.audioFileUrlSet(); // for playing audio from particular time, when it is paused
    this.selectedSpeed = 1.0;
    this.savingWords = false;

   
  }



 
  selectedPageIndex(pageNum) {
    this.authService.UserSettings.pagination.selectedPageindex = pageNum - 1;
    this.fileInfoService.filesInfo = [];
    this.selectedPage = pageNum;
    //this.recindx = (this.PageSize * this.authService.UserSettings.selectedPageindex) + 1;
    this.getFileInfo();
  }

  navigateToAgentperformance(menu) {
   // this.track.nativeElement.currentTime = 0.0;
    this.showTiles = true;
    this.authService.navigationBackFromAgentPage = true;
    this.authService.currentMenu = menu;
    this._router.navigate(['dashboard/agentPerformance']);
  }
  navigateToRedAlert(menu) {
    this.showTiles = true;
    this.authService.navigationBackFromRedAlertScorePage = true;
    this.authService.currentMenu = menu;
    this._router.navigate(['dashboard/redAlerts']);
  }
  backtoRedAlertScore(menu) {
    this.authService.navigationBackFromRedAlertPage = true;
    this.showTiles = true;
    this.authService.currentMenu = menu;
    this._router.navigate(['dashboard/redAlerts']);
  }
  navigateToCustomerSatisfaction(menu) {
    this.showTiles = true;
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
    this.showTiles = true;
    this.authService.navigationBackFromAgentScore = true;
    this.authService.currentMenu = menu;
    this._router.navigate(['dashboard/agentPerformance']);
  }

  backtoCustomerSatisfaction(menu) {
    this.showTiles = true;
    this.authService.navigationBackFromCustomerSatisfactionPage = true;
    this.authService.currentMenu = menu;
    this._router.navigate(['dashboard/customerSatisfaction']);
  }
  selectedRowToViewDetailedScore(item, index) {
    this.authService.navigationBackFromcalltranscrtiptionPage = true;
    this.authService.selectedFileToViewScore = item;
    this.authService.selectedFileindex = index;
  }
  backToCallRecordings(menu) {
    this.showTiles = true;
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
      if (this.selectedFilterOptions.AgentName.length == 0) {
        this.selectedFilterOptions.AgentName.push(selectedOption);
      } else {
        var dulipcate = false;
        for (let i = 0; i < this.selectedFilterOptions.AgentName.length; i++) {
          if (this.selectedFilterOptions.AgentName[i] == selectedOption) {
            this.selectedFilterOptions.AgentName.splice(i, 1);
            dulipcate = true;
          }
        }
        if (dulipcate == false) {
          this.selectedFilterOptions.AgentName.push(selectedOption);
        }
      }
      this.convertArrayIntoString('AgentName');
    }
    else if (category == 'PhoneNumber') {
      if (this.selectedFilterOptions.CustomerPhoneNo.length == 0) {
        this.selectedFilterOptions.CustomerPhoneNo.push(selectedOption);
      } else {
        var dulipcate = false;
        for (let i = 0; i < this.selectedFilterOptions.CustomerPhoneNo.length; i++) {
          if (this.selectedFilterOptions.CustomerPhoneNo[i] == selectedOption) {
            this.selectedFilterOptions.CustomerPhoneNo.splice(i, 1);
            dulipcate = true;
          }
        }
        if (dulipcate == false) {
          this.selectedFilterOptions.CustomerPhoneNo.push(selectedOption);
        }
      }
      this.convertArrayIntoString('CustomerPhoneNo');
    } else if (category == 'AccountNumber') {
      if (this.selectedFilterOptions.CustomerAccountNo.length == 0) {
        this.selectedFilterOptions.CustomerAccountNo.push(selectedOption);
      } else {
        var dulipcate = false;
        for (let i = 0; i < this.selectedFilterOptions.CustomerAccountNo.length; i++) {
          if (this.selectedFilterOptions.CustomerAccountNo[i] == selectedOption) {
            this.selectedFilterOptions.CustomerAccountNo.splice(i, 1);
            dulipcate = true;
          }
        }
        if (dulipcate == false) {
          this.selectedFilterOptions.CustomerAccountNo.push(selectedOption);
        }
      }
      this.convertArrayIntoString('CustomerAccountNo');
    }
    if (this.selectedFilterOptions.AgentName.length > 0 || this.selectedFilterOptions.CustomerPhoneNo.length > 0 || this.selectedFilterOptions.CustomerAccountNo.length > 0)
      this.isLeftSideFilterApplied = true;
  }

  selectAndDeselectAll(type) {
    this.selectedPage = 1; this.isdatefilterapplied = false;
    this.fileInfoService.finalSelectedList.FileGuid = this.fileInfoService.finalSelectedList.CallFromDate = this.fileInfoService.finalSelectedList.CallToDate = this.fileInfoService.finalSelectedList.UploadedToDate = this.fileInfoService.finalSelectedList.UploadedFromDate = null;
    this.authService.UserSettings.pagination.selectedPageindex = 0; this.recindx = 0;
    if (type == 1) {
      this.selectedFilterOptions.AgentName = [];

      if (this.allAgents) {
        this.selectedFilterOptions.AgentName = [];
        this.agentValue = false;
      } else {
        this.agentValue = true;
        for (let i = 0; i < this.customerFilterOptions.AgentNames.length; i++) {
          this.selectedFilterOptions.AgentName.push(this.customerFilterOptions.AgentNames[i].name);
          this.customerFilterOptions.AgentNames[i].selected = true;
        }
      }
      this.convertArrayIntoString('AgentName');
    }
    if (type == 2) {
      this.selectedFilterOptions.CustomerAccountNo = [];
      if (this.allAccountNos) {
        this.selectedFilterOptions.CustomerAccountNo = [];
        this.accountValues = false;
      } else {
        this.accountValues = true;
        for (let i = 0; i < this.customerFilterOptions.customerAccountNumbers.length; i++) {
          this.selectedFilterOptions.CustomerAccountNo.push(this.customerFilterOptions.customerAccountNumbers[i].name);
          this.customerFilterOptions.customerAccountNumbers[i].selected = true;
        }
      }
      this.convertArrayIntoString('CustomerAccountNo');
    }
    if (type == 3) {
      this.selectedFilterOptions.CustomerPhoneNo = [];
      if (this.allPhoneNos) {
        this.selectedFilterOptions.CustomerPhoneNo = [];
        this.phonevalues = false;
      } else {
        this.phonevalues = true;
        for (let i = 0; i < this.customerFilterOptions.customerPhoneNumbers.length; i++) {
          this.selectedFilterOptions.CustomerPhoneNo.push(this.customerFilterOptions.customerPhoneNumbers[i].name);
          this.customerFilterOptions.customerPhoneNumbers[i].selected = true;
        }
      }
      this.convertArrayIntoString('CustomerPhoneNo');
    }
    if (this.selectedFilterOptions.AgentName.length > 0 || this.selectedFilterOptions.CustomerPhoneNo.length > 0 || this.selectedFilterOptions.CustomerAccountNo.length > 0)
      this.isLeftSideFilterApplied = true;
  }

  convertArrayIntoString(type) {
    if (this.selectedFilterOptions[type].length == 0) {
      this.fileInfoService.finalSelectedList[type] = '';
    }
    else {
      for (let i = 0; i < this.selectedFilterOptions[type].length; i++) {
        if (i == 0) {
          this.fileInfoService.finalSelectedList[type] = '';
          this.fileInfoService.finalSelectedList[type] = this.fileInfoService.finalSelectedList[type] + this.selectedFilterOptions[type][i];
        } else {
          this.fileInfoService.finalSelectedList[type] = this.fileInfoService.finalSelectedList[type] + ',' + this.selectedFilterOptions[type][i];
        }
      }
    }
    this.customerFilterOptions.IsAgentNameSelected = this.selectedFilterOptions.AgentName.length > 0 ? true : false;
    this.customerFilterOptions.IsCustomerAccountSelected = this.selectedFilterOptions.CustomerAccountNo.length > 0 ? true : false;
    this.customerFilterOptions.IsCustomerPhoneSelected = this.selectedFilterOptions.CustomerPhoneNo.length > 0 ? true : false;
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

    if (this.customerFilterOptions.IsAgentNameSelected && this.customerFilterOptions.IsCustomerAccountSelected) {
      this.customerFilterOptions.customerPhoneNumbers = customerPhoneNumbersfromdb;
    }
    else if (this.customerFilterOptions.IsAgentNameSelected && this.customerFilterOptions.IsCustomerPhoneSelected) {
      this.customerFilterOptions.customerAccountNumbers = customerAccountNumbersfromdb;
    }
    else if (this.customerFilterOptions.IsCustomerAccountSelected && this.customerFilterOptions.IsCustomerPhoneSelected) {
      this.customerFilterOptions.AgentNames = AgentNamesfromdb;
    }
    else if (this.customerFilterOptions.IsAgentNameSelected) {
      this.customerFilterOptions.customerAccountNumbers = customerAccountNumbersfromdb;
      this.customerFilterOptions.customerPhoneNumbers = customerPhoneNumbersfromdb;
    }
    else if (this.customerFilterOptions.IsCustomerAccountSelected) {
      this.customerFilterOptions.AgentNames = AgentNamesfromdb;
      this.customerFilterOptions.customerPhoneNumbers = customerPhoneNumbersfromdb;
    }
    else if (this.customerFilterOptions.IsCustomerPhoneSelected) {
      this.customerFilterOptions.AgentNames = AgentNamesfromdb;
      this.customerFilterOptions.customerPhoneNumbers = customerPhoneNumbersfromdb;
    }
    else {
      this.customerFilterOptions.customerPhoneNumbers = customerPhoneNumbersfromdb;
      this.customerFilterOptions.AgentNames = AgentNamesfromdb;
      this.customerFilterOptions.customerAccountNumbers = customerAccountNumbersfromdb;
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

  sortDates(a, b) {
    return a.getTime() - b.getTime();
  }

  refresh() {
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
    this.customerFilterOptions.IsCustomerPhoneSelected = this.customerFilterOptions.IsCustomerAccountSelected = this.customerFilterOptions.IsAgentNameSelected = false;
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
      });
      // this.fileInfoService.filesInfo = this.fileInfoService.filesInfo.sort((a, b) => new Date(b.CallDate).getTime() - new Date(a.CallDate).getTime()); //sorting date
      this.fileInfoLength = this.fileInfoService.filesInfo.length;
      this.fileInfoService.overallHeaderCount.Jsondata = JSON.parse(data["Jsondata"]);

      this.initCount();

      //var calldates = this.fileInfoService.filesInfo.filter(f => f.CallDate.length > 0).map(g => moment(g.CallDate).format("YYYYMMDD"));
      // var sortedcalldates = _.sortBy(calldates);  //passing from api check initCount method


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
          this.apiSource = this.params.apiSource;
          this.editFile(this.params.guid, this.params.fileName, this.params.status, this.params.fileIndex);
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
        this.toastr.error(error.message);
        this.loading = false;
        this.smallLoader = false;
      },
      () => {
        this.loading = false; this.smallLoader = false;
        this.audioVisible = true;
      });
  }


  addFrequencyDownloadChunck() {
    this.addfrequency = true;
  }
  closePopup() {
    this.addfrequency = false;
  }
  transcriptList() {
    this.dataService.countStart = false;
    this.showTiles = true;
    this.dataService.customerEndPoints = [];
    this.dataService.count = 0;
    this.fileInfoService.finalSelectedList.FileGuid = '';
    this.viewtranscript = false;
    this.isLeftSideFilterApplied = this.selectedFilterOptions.AgentName.length > 0 || this.selectedFilterOptions.CustomerPhoneNo.length > 0 || this.selectedFilterOptions.CustomerAccountNo.length > 0;
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
         },
          () => {
            this.getsplittedaudiofiles(filepathurl);
          });
    }
  }

  changeWordCount(type) {
    this.wordCountType = type;
    if (type == 'All') {
      this.totalWordCount = this.fileInfoService.overallHeaderCount.Jsondata['Call_Transcripts_All_WordCount'];
    } else if (type == 'Agent') {
      this.totalWordCount = this.fileInfoService.overallHeaderCount.Jsondata['Call_Transcripts_Agent_WordCount'];
    } else if (type == 'Customer') {
      this.totalWordCount = this.fileInfoService.overallHeaderCount.Jsondata['Call_Transcripts_Customer_WordCount'];
    }
    //console.log(this.wordCountType);
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
    this.showTiles = false;
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

  editFile(Guid, FileName, Status, FileIndex) {
    if (this._router.url.lastIndexOf("redAlerts") > 0) {
      this.redAlertTitle = true;
    } else {
      this.agentTitle = true;
    }
    this.selectedTranscriptedFile = FileName;
    this.loading = true;
    if (Status === 'Completed') {
      this.fileInfoService.filesInfo.map((item, index) => {
        if (item.Guid === Guid) {
          //if (FileIndex == index) {
          item.isActive = true;
          this.dataService.selectedFile = item;
          this.fileDuration = item.Duration; 

        } else {
          item.isActive = false;
        }
        //}
      });
      this.audioFileUrlSet();
      this.guid = Guid;
     // this.getTranscriptdata(this.guid);
    }

  }
  ngOnDestroy() { // clearing the interval of the audio and unsubscribing from the subscriptions.
    if (this.timeSubscription != undefined) {
      this.timeSubscription.unsubscribe();
    }
    this.agentsScore = false;
    this.redAlerts = false;
    this.authService.navigationFromAgentPage = false;
    this.authService.navigationFromAgentScorePage = false;
    this.authService.navigationFromRedAlertPage = false;
    this.authService.navigationFromRedAlertScorePage = false;
    this.dataService.countStart = false;
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
        this.cleanUp();
        this.audioSource = '';
        this.transcriptData = data;
        if (this.audioFileSet) {
          this.audioActive = true;
          this.audioSource = this.transcriptData.FileUrl;
        }
        //if (!this.audioSource) { // because we do not want to load audio again if it is already set.
        //  this.audioSource = this.transcriptData.FileUrl;
        //}
        this.instructions = this.transcriptData.Instruction;
        this.transcription = JSON.parse(this.transcriptData.Body);
        //this.transcription.forEach(speakerCheck => {
        //  if (this.transcription[0].SpeakerTranscript.Speaker != "Speaker 1" && this.transcription[0].SpeakerTranscript.Speaker != "Speaker 0") {
        //    this.transcription.splice(speakerCheck);
        //  }
        //});
        if (this.transcription[0].SpeakerTranscript.Speaker === "Speaker 1") {
         var obj = {
            "Index" : 0,
            "SpeakerTranscript": {
              "Content": [{
                  "Begin": 0.0,
                  "Confidence": 1,
                  "Duration": 0.0,
                  "IsEdited": false,
                  "Speaker": "Speaker 0",
                  "Tag": null,
                  "Word": ""
              }],
              "Speaker": "Speaker 0"
            }
          }
         var transcriptObj = [];
         transcriptObj.push(obj);
         this.transcription.forEach(e => ++e.Index);
         this.transcription.forEach(e => transcriptObj.push(e));
         this.transcription = transcriptObj;
        } 


        if (this.dataService.countStart) {
          for (var i = 0; i < this.transcription.length; i++) {
            if (this.transcription[i].SpeakerTranscript.Speaker == "Speaker 1") {
              for (var j = 0; j < this.transcription[i].SpeakerTranscript.Content.length; j++) {
                if (j == this.transcription[i].SpeakerTranscript.Content.length - 1) {
                  // this.dataService.customerEndPoints.push(this.transcription[i].SpeakerTranscript.Content[this.transcription[i].SpeakerTranscript.Content.length - 1].Begin + this.transcription[i].SpeakerTranscript.Content[this.transcription[i].SpeakerTranscript.Content.length - 1].Duration)
                  this.dataService.customerEndPoints.push(this.transcription[i].SpeakerTranscript.Content[this.transcription[i].SpeakerTranscript.Content.length - 1].Begin + this.transcription[i].SpeakerTranscript.Content[this.transcription[i].SpeakerTranscript.Content.length - 1].Duration)
                }
              }
            }
          }
        }
       // console.log(this.dataService.customerEndPoints[this.dataService.customerEndPoints.length - 1]);
        if (this.dataService.countStart) {
          for (var category = 0; category < this.agentPerformanceCalculation.QuestionCategory.length; category++) { //gets questions category
            for (var qtns = 0; qtns < this.agentPerformanceCalculation.QuestionCategory[category].Questions.length; qtns++){ // gets questions with same category
              for (var keyword = 0; keyword < this.agentPerformanceCalculation.QuestionCategory[category].Questions[qtns].Qtn_Keywords.length; keyword++) {
               
                for (var statement = 0; statement < this.transcription.length; statement++) {
                  var source = '';
                  if (this.agentsScore) {
                    source = "this.transcription[statement].SpeakerTranscript.Speaker === 'Speaker 0'";
                  } else if (this.redAlerts) {
                    source = "this.transcription";
                  }
                  if (source) {// checking the text of agent only // neet to get conformation for redalerts
                    var keywordsTimings = { Time: 0, Category: "", counter: 0, Word: '' };
                    var joinedTranscript = "";
                  this.transcription[statement].SpeakerTranscript.Content.forEach(w => joinedTranscript += w.Word.toLowerCase() + " ");
                  if (this.agentPerformanceCalculation.QuestionCategory[category].Questions[qtns].Qtn_Keywords[keyword] != '') {
                    this.agentPerformanceCalculation.QuestionCategory[category].Questions[qtns].Qtn_Keywords[keyword] = this.agentPerformanceCalculation.QuestionCategory[category].Questions[qtns].Qtn_Keywords[keyword].toLowerCase();
                    }
                    var keyWordMatchCheck = this.agentPerformanceCalculation.QuestionCategory[category].Questions[qtns].Qtn_Keywords[keyword].trim();
                    //comparing keyword with all punctions also.
                    if (joinedTranscript.indexOf(keyWordMatchCheck + ' ') >= 0 || joinedTranscript.indexOf(keyWordMatchCheck + '.') >= 0 || joinedTranscript.indexOf(keyWordMatchCheck + ',') >= 0) {
                    //assigning timings for spotted keywords to increase the progressbar.
                    keywordsTimings.Time = this.transcription[statement].SpeakerTranscript.Content[this.transcription[statement].SpeakerTranscript.Content.length - 1].Begin + this.transcription[statement].SpeakerTranscript.Content[this.transcription[statement].SpeakerTranscript.Content.length - 1].Duration;
                    keywordsTimings.Category = this.agentPerformanceCalculation.QuestionCategory[category].Questions[qtns].Qtn_CategoryName;
                    keywordsTimings['QuestionNo'] = qtns + 1;
                    keywordsTimings.Word = this.agentPerformanceCalculation.QuestionCategory[category].Questions[qtns].Qtn_Keywords[keyword];
                    keywordsTimings['Rule'] = this.agentPerformanceCalculation.QuestionCategory[category].Questions[qtns].Qtn_Rule;
                    keywordsTimings['TotalKeywords'] = this.agentPerformanceCalculation.QuestionCategory[category].Questions[qtns].Qtn_Keywords.length;
                    keywordsTimings['Matched'] = false;
                    keywordsTimings['Score_Weightage'] = this.agentPerformanceCalculation.QuestionCategory[category].Questions[qtns]["Score_Weightage"];
                    for (var matchTiming = 0; matchTiming < this.MatchedKeywordsTimings.length; matchTiming++) {
                      if (keywordsTimings.Category.trim() === this.MatchedKeywordsTimings[matchTiming].Category.trim()){
                        this.MatchedKeywordsTimings[matchTiming]['TotalConditionsFullfilled'] = 0;
                        for (var qtnNoMap = 0; qtnNoMap < qtns + 1; qtnNoMap++) {
                          var qtnSet = 'QuestionNo' + (qtnNoMap + 1);
                          this.MatchedKeywordsTimings[matchTiming][qtnSet] = 0;
                        }
                        // check for conditios to get the count for required  keywords to be matched.
                        var matchCount = 0;
                        if (keywordsTimings['Rule'] == 'All') {
                          matchCount = keywordsTimings['TotalKeywords'];
                          keywordsTimings['WordsToMatch'] = matchCount;
                        } else if (keywordsTimings['Rule'] == 'Any') {
                          matchCount = 1;
                          keywordsTimings['WordsToMatch'] = matchCount;
                        } else {
                          var count = keywordsTimings['Rule'];
                          matchCount = count.split("-");
                          keywordsTimings['WordsToMatch'] = parseInt(matchCount[1]);
                        }
                        this.MatchedKeywordsTimings[matchTiming]['Questions'].push(keywordsTimings);
                      }
                    }
                  }
                }
                }
              }
            }
          }
          this.agentPerformanceCalculation.SpotedKeyWords.forEach((category, index) => {
            category.keyWordsColor = this.colorPallet[index];
          });
          this.transcripService.questionnaireList = this.agentPerformanceCalculation.SpotedKeyWords;
        }
     
     
        this.loading = false;
        this.newTranscription = this.transcription;
        this.transcriptionLength = this.transcription.length;
        this.createWordStats();
      //  this.audioFileSet = false;

      },
        (err) => {
          console.log(err);
        },
        () => {
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
