import { Component, OnInit, ViewChild, ElementRef, ViewContainerRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { QuestionnairService } from '../shared/questionnair.service';
import { NgForm } from '@angular/forms';
import * as moment from 'moment';
import * as cloneDeep from 'lodash/cloneDeep';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';
import { NgbModalRef, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthorizationService } from '../../../shared/authorization.service';
@Component({
  selector: 'app-questionary',
  templateUrl: './questionary.component.html',
  styleUrls: ['./questionary.component.css']
})
export class QuestionaryComponent implements OnInit {
  config: any;
  role: any;
  modalRef: NgbModalRef;
  editQuestioner: boolean = false;
  deleteQuery: boolean = false;
  questionsList: any;
  categories: any = [];
  programName: any;
  deleteQuestion: any = [];
  newQuestionNumber = 0;
  edit: boolean = false;
  actionType: string;
  addIcon: boolean = true;
  clonedObject: any;
  questionNumber: any;
  programStaticData: any;
  inputFocusCategory: boolean;
  inputFocusProgram: boolean;
  inputFocusDescription: boolean;
  inputFocusKeywords: boolean;
  inputFocusRules: boolean;
  inputFocusScore: boolean;
  addnewRule: boolean;
  selectedRow: any;
  publish: boolean;
  rules: any;
  loading: boolean;
  publishedDate: Date;
  selectedVersionType = 'Draft';
  jsondata: {};
  Question_Program_Name ='CS';
  question: any = {
    Program_Name: "",
    Question_Category: "",
    Question_Threshold: 0,
    Question_Description: "",
    Question_Suggestion : "",
    Question_Rules: {
      Conditon: "",
      Keyword_list: [],
      Question_RuleID: 0,
      Question_TemplateID: 0,
    },
    Score_Weightage: 0.0,
    Question_No: "",
    SuggestionURL: "",
  };
  addRules: boolean;
  selectedQuestion: any;
  Question_Template_TypeID = 1;// change the valu  in getQuestions() also;
  public Question_Template_Type =
    [
      { Question_Template_Type_ID: 1, Question_Template_Type_Name: "Agent Performance" },
      { Question_Template_Type_ID: 2, Question_Template_Type_Name: "Customer Satisfaction" },
      { Question_Template_Type_ID: 3, Question_Template_Type_Name: "Red Alert" },
      { Question_Template_Type_ID: 4, Question_Template_Type_Name: "Suggestion"}
    ];

  createRulesObj: any =[];


  
  constructor(public _authService: AuthorizationService,public _questionnairService: QuestionnairService, public toastr: ToastsManager, vRef: ViewContainerRef, private modalService: NgbModal) {
    this.toastr.setRootViewContainerRef(vRef);
  }

  ngOnInit() {
    this.getQuestions();
    this.role = this._authService.UserProfiledetails.role.name;
    let ruleObj = {
      "IsDelete": false,
      "Category": '',
      "Rule": '',
      "Condition": ''
    }
    this.createRulesObj.push(ruleObj);
  }
  changeVersion() {
    this.getQuestions();
  }
  getQuestions() {
    //this.loading = true;
    this.questionsList = [];
    this.programName = [];
    this.clearObject();
    let versionid = '0';  //draft version
    if (this.selectedVersionType!="Draft")
      versionid = '-1';     //should go selected version if enalbed in future for now keep any value to identify latest version(-1)
    this._questionnairService.getQuestionnair(this.Question_Template_TypeID, versionid, this.Question_Program_Name).subscribe(data => {
      if (data == undefined || data['Question_Template'].length == 0) {
        this.toastr.error('No records found');
      }
      this.questionsList = data['Question_Template'];
      this.questionsList.forEach(f => {
        f.Question_Rules.Keyword_list = f.Question_Rules.Keyword_list.split(',');
      });
      this.programName = data['ProgramStaticData'];
     // this.Question_Program_Name = this.programName[0].Name;
      for (var qtn = 0; qtn < this.questionsList.length; qtn++) {
        for (var programDes = 0; programDes < this.programName.length; programDes++) {
          if (this.questionsList[qtn].Program_Name === this.programName[programDes].Name) {
            this.questionsList[qtn].Program_Name = this.programName[programDes].ProgramDescription;
          }
        }
      }
      this.programStaticData = data['ProgramStaticData'].map(function (a) { a["Name"] = a["Name"].trim(); return a["Name"]; });
      this.rules = data['RuleStaticData'].map(function (a) { a["Name"] = a["Name"].trim(); return a["Name"]; });
      this.jsondata = JSON.parse(data['jsondata']);
      this.jsondata["LastUpdatedDate"] = moment.utc(this.jsondata["LastUpdatedDate"]).local() ;
      this.newQuestionNumber = this.questionNumber.reduce(function (a, b) {
        return Math.max(a, b);
      });
      this.loading = false;
    });
  }
  

  addNewQuestion() {
    this.addnewRule = true;   
    if (this.Question_Program_Name) {
      for (var check = 0; check < this.programName.length; check++) {
        if (this.programName[check].Name === this.Question_Program_Name) {
          this.question.Program_Name = this.programName[check].ProgramDescription;
        }
      }
    }
    setTimeout(
      function () {
        document.getElementById('category').focus();
      }, 500);
  }
  downloadQuestionarySheet() {
    const headers = new Headers({
      'Content-Type': 'text/csv',
    });
    const options = {
      responseType: "arraybuffer",
      headers: headers
    };
    let versionid = '0';  //draft version
    if (this.selectedVersionType != "Draft")
      versionid = '-1';     //should go selected version if enalbed in future for now keep any value to identify latest version(-1)
    this._questionnairService.questionaryDownloadSheet(this.Question_Template_TypeID, versionid, this.Question_Program_Name, options).subscribe(blob => {
      let saveAs = require('file-saver');
      let b: any = new Blob([blob], { type: 'text/csv' });
      saveAs.saveAs(b, `Questionnaire.csv`);

    }, (err) => {
      this.toastr.error(err.message);
    },
      () => {
        //this.loading = false;
      }

    );
  }
  inputFocusClass(type) {
    switch (type) {
      case 'category':
        this.inputFocusCategory = true;
        break;
      case 'program':
        this.inputFocusProgram = true;
        break;
      case 'description':
        this.inputFocusDescription = true;
        break;
      case 'keywords':
        this.inputFocusKeywords = true;
        break;
      case 'rules':
        this.inputFocusRules = true;
        break;
      case 'score':
        this.inputFocusScore = true;
        break;
      default:

    }
  }

  addquestioner() {
    if (this.edit) {
      this.actionType = 'UPDATE';
      this.question.Question_Rules.Keyword_list = this.question.Question_Rules.Keyword_list.toString();
    } else {
      this.actionType = 'INSERT';
    }
    if (this.publish) {
      this.actionType = 'PUBLISH';
    }
    this.question.Question_Template_TypeID = this.Question_Template_TypeID;
    if (this.question.Program_Name) {
      for (var check = 0; check < this.programName.length; check++) {
        if (this.programName[check].ProgramDescription === this.question.Program_Name) {
          this.question.Program_Name = this.programName[check].Name;
        }
      }
    }

    this._questionnairService.updateQuestionnaire(this.question, this.actionType).subscribe(data => {
      if (this.question.IsPublished) this.toastr.success('Record published successfully');
      else {
        if (this.actionType == 'INSERT') {
          this.toastr.success('Record added successfully');
        } else
          this.toastr.success('Record updated successfully');
      }
      this.actionType = '';
      this.getQuestions();
     
    },
      err => {
        this.toastr.error('Something went wrong');
      });
    this.edit = false;
    this.addnewRule = false;
    this.selectedRow = '';
  }

  publishQuestion() {
    this.publish = true;
    this.question.IsPublished = true;
    this.addquestioner();
    this.selectedRow = '';
  }
  editquestioner(item, index) {
    this.addnewRule = true;
    this.selectedRow = index;
    // this.qNum.nativeElement.focus();
    this.addIcon = false;
    this.question = [];
    this.edit = true;
    this.clonedObject = cloneDeep(item);
    this.question = this.clonedObject;
    setTimeout(
      function () {
        document.getElementById('category').focus();
      }, 500);
  }
  clearObject() {
    this.question = {
      Program_Name: "",
      Question_Category: "",
      Question_Threshold: 0,
      Question_Description: "",
      Question_Suggestion: "",
      Question_Rules: {
        Conditon: "",
        Keyword_list: [],
        Question_RuleID: 0,
        Question_TemplateID: 0,
      },
      Score_Weightage: 0.0,
      Question_No: "",
      SuggestionURL: "",
    };
  }
  resetForm() {
    this.selectedVersionType = "Draft";
    this.addnewRule = false;
    this.selectedRow = '';
    this.clearObject();
  }

  typeChange() {
    this.addnewRule = false;
    this.getQuestions();
  }

  //onChange(event) { to get the changed categorty value
  //  this.question.Question_Category = event.target.value;
  //}
  deleteQuestioner(item, index) {
    this.deleteQuestion = item;
    this.deleteQuery = true;
  }
  closePopup() {
    this.deleteQuery = false;
    this.addRules = false;
  }
  deleteFile() {
    this.actionType = 'DELETE';
    this.deleteQuestion.Question_Template_TypeID = this.Question_Template_TypeID;
    this.deleteQuestion.Question_Rules.Keyword_list = this.deleteQuestion.Question_Rules.Keyword_list.toString();
    this._questionnairService.updateQuestionnaire(this.deleteQuestion, this.actionType).subscribe(data => {
      this.toastr.success('Record deleted successfully');
      this.actionType = '';
      this.getQuestions();
    },
      err => {
        this.toastr.error('Something went wrong');
      });
    this.deleteQuery = false;
  }
  addNewRulesModel(data) {
    this.selectedQuestion = data;
    this.addRules = true;
  }
  addNewRules() {
    console.log(this.createRulesObj);
     //send rules here
  }
  addNewRuleSet() {
    let ruleObj = {
      "IsDelete": false,
      "Category": '',
      "Rule": '',
      "Condition": ''
    }
    this.createRulesObj.push(ruleObj);
  }
}
