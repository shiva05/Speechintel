import {Component, OnInit, Input, ViewChild, OnDestroy, ElementRef, OnChanges, AfterViewInit} from '@angular/core';
import {TranscriptionTimetrackerService} from '../../../shared/transcription-timetracker-service';
import {HttpClient} from '@angular/common/http';
import {DataService} from '../../../shared/data.service';
import { Router, ActivatedRoute} from '@angular/router';
import {ISubscription} from 'rxjs/Subscription';
import {FormGroup, FormBuilder, Validators} from '@angular/forms';
import {NgbModal, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import { environment } from '../../../../environments/environment'; 
import { AuthorizationService } from '../../../shared/authorization.service';

@Component({
  selector: 'si-transcription',
  templateUrl: './transcription.component.html',
  styleUrls: ['./transcription.component.css']
})
export class TranscriptionComponent implements OnInit, OnDestroy, OnChanges, AfterViewInit {

  @Input() transcript: any;
  @Input() transcriptIndex: number;
  @Input() selectedTagType: any;
  @Input() originalData: any;
  _transcriptFilter: string;
  loading: boolean = false;
  guid: any;
  @Input() set transcriptFilter(text) {
    this._transcriptFilter = text;
    this.wordCountTracker = 0;
    this.clearHighlight(); // clearing highlighted words on each edit.
  }

  get transcriptFilter(): string {
    return this._transcriptFilter;
  }
  role: any;
  newLabels: any;
  wordLength: any;
  isTranscriptData:boolean = false;
  currentTime: any;
  transcriptWordLength: number;
  wordList: any;
  obj: any;
  originalWordArrayLength: number;
  originalWordMap: any;
  editedWordMap: any;
  timeSubscription: ISubscription;
  rightclickedWord: string;
  selectedrightclickword: any;
  cuthandler: boolean = false;
  selectedLineBreakText: any;
  rightPanelStyle: any;
  searchEditedWordMap: any;
  tagForWord: string;
  wordTags: string;
  tagForm: FormGroup;
  modalRef: NgbModalRef;
  curWordtags: string[] = [];
  newWordTags: string[] = [];
  tagObj: any;
  curWordIndex: number;
  replaceSubscription: ISubscription;
  previousWordSubscription: ISubscription;
  nextWordSubscription: ISubscription;
  wordCountTracker: number;
  @Input() replaceText: string;

  @ViewChild('tr') private tr: ElementRef;

  constructor(private _timeTrackerService: TranscriptionTimetrackerService,
              private modalService: NgbModal,
              private _http: HttpClient,
    private _dataService: DataService,
    public authService: AuthorizationService,
              private _router: Router,
              private _fb: FormBuilder,
    private _route: ActivatedRoute) {

  }

  ngOnInit() {
    this.role = this.authService.UserProfiledetails.role.name;
    this.tagForm = this._fb.group({
      addTag: ['', [Validators.required, Validators.maxLength(20)]]
    });
    this.timeSubscription = this._timeTrackerService.trackTime$.subscribe(curTime => {
      this.currentTime = curTime;
    });
    
    this.originalWordArrayLength = this.transcript.length;
    this.originalWordMap = new Map();
    for (let i = 0; i < this.originalWordArrayLength; i++) {
     // if (this.transcript[i].Word) { failing for cut and unable to compare the key
        this.originalWordMap.set(this.transcript[i].Begin, {index: i, Word: this.transcript[i].Word});
     // }
    }
    this.editedWordMap = new Map();
    this.searchEditedWordMap = new Map();
    this.replaceSubscription = this._dataService.replaceText$.subscribe(data => {
      if (data === 'replaceAll') {
        this.replaceAll();
      } else if (data === 'replace') {
        this.replace();
      }
    });
    this.previousWordSubscription = this._dataService.previousWord$.subscribe(data => {
      if (data === 'previous word') {
        this.highlightPreviousWord();
      }
    });
    this.nextWordSubscription = this._dataService.nextWord$.subscribe(data => {
      if (data === 'next word') {
        this.highlightNextWord();
      }
    });
    this.wordCountTracker = 0;
  }

  ngAfterViewInit() {
    this.createSearchEditedWordMap();
  }

  createSearchEditedWordMap() {
    this.wordList = this.tr.nativeElement.children;
    this.transcriptWordLength = this.wordList.length;
    for (let i = 0; i < this.transcriptWordLength; i++) {
      this.searchEditedWordMap.set(parseFloat(this.tr.nativeElement.children[i].id), {
        index: i,
        Word: this.tr.nativeElement.children[i].innerText,
        Begin: this.tr.nativeElement.children[i].id
      });
    }
  }

  ngOnChanges() {
    if ((typeof (this.transcriptFilter) !== 'undefined')) {
      this.createSearchEditedWordMap();
      this.searchAndHighlight();
      // this.wordCountTracker = 0;
    }
  }

  searchAndHighlight() {
    if (this.transcriptWordLength > 0) {
      this.searchEditedWordMap.forEach(word => {
        if (word.Word.includes(this.transcriptFilter)) {
          this.tr.nativeElement.children[word.index].classList.add('searchHighlight');
          this._dataService.highlightWords.push({
            begin: this.tr.nativeElement.children[word.index].id,
            index: word.index,
            word: word.Word,
            transcriptIndex: this.transcriptIndex
          });
        } else {
          this.tr.nativeElement.children[word.index].classList.remove('searchHighlight');
        }
        if (!this.transcriptFilter) {
          this.tr.nativeElement.children[word.index].classList.remove('searchHighlight');
        }
      });
    }
  }

  checkTagType(tag) {
    if (tag && this.selectedTagType && (tag.split(',').indexOf(this.selectedTagType)) !== -1) {
      return true;
    } else {
      return false;
    }
  }

  highlightPreviousWord() {
    if (this.wordCountTracker > 1) {
      this.wordCountTracker--;
    }
    const word = this._dataService.highlightWords[this.wordCountTracker - 1];
    this.searchEditedWordMap.forEach(transcriptWord => {
      if (word.begin === transcriptWord.Begin) {
        this._dataService.curReplaceWord = word;
        this._dataService.wordToReplaceIndex = transcriptWord.index;
        this.tr.nativeElement.children[transcriptWord.index].classList.add('highlightSpecificWord');
      } else {
        if (this.tr.nativeElement.children[transcriptWord.index]) {
          this.tr.nativeElement.children[transcriptWord.index].classList.remove('highlightSpecificWord');
        }
      }
    });
  }

  clearHighlight() {
    

    if (this.tr != undefined && this.tr.nativeElement.children[this._dataService.wordToReplaceIndex]) {
      this.tr.nativeElement.children[this._dataService.wordToReplaceIndex].classList.remove('highlightSpecificWord');
    }
  }

  highlightNextWord() {
    if (this.wordCountTracker < this._dataService.highlightWords.length) {
      this.wordCountTracker++;
    }
    const word = this._dataService.highlightWords[this.wordCountTracker - 1];
    this.searchEditedWordMap.forEach(transcriptWord => {
      if (word.begin === transcriptWord.Begin) {
        this._dataService.curReplaceWord = word;
        this._dataService.wordToReplaceIndex = transcriptWord.index;
        this.tr.nativeElement.children[transcriptWord.index].classList.add('highlightSpecificWord');
      } else {
        if (this.tr.nativeElement.children[transcriptWord.index]) {
          this.tr.nativeElement.children[transcriptWord.index].classList.remove('highlightSpecificWord');
        }
      }
    });
  }

  replace() {
    if (this.wordCountTracker) {
      this.searchEditedWordMap.forEach(transcriptWord => {
        if (this._dataService.curReplaceWord.begin === transcriptWord.Begin) {
          const nativeElement = this.tr.nativeElement;
          nativeElement.children[this._dataService.curReplaceWord.index].innerText =
            nativeElement.children[this._dataService.curReplaceWord.index].innerText.replace(this.transcriptFilter, this.replaceText);
        }
      });
      this.createSearchEditedWordMap();
      this.searchAndHighlight();
      this.onContentChange();
      this.clearHighlight();
    }
  }

  replaceAll() {
    if (this.transcriptWordLength > 0) {
      this.searchEditedWordMap.forEach(word => {
        if (word.Word.includes(this.transcriptFilter)) {
          const nativeElement = this.tr.nativeElement;
          if (nativeElement.children[word.index].innerText) {
            nativeElement.children[word.index].innerText =
              nativeElement.children[word.index].innerText.replace(this.transcriptFilter, this.replaceText);
          }
        }
      });
    }
    this.createSearchEditedWordMap();
    this.searchAndHighlight();
    this.onContentChange();
    this.clearHighlight();
  }

  ngOnDestroy(): void {
    if (this.timeSubscription != undefined) {
      this.timeSubscription.unsubscribe();
    }
    this.transcript = [];
    if (this.replaceSubscription != undefined) {
      this.replaceSubscription.unsubscribe();
    }
    if (this.previousWordSubscription != undefined) {
      this.previousWordSubscription.unsubscribe();
    }
    if (this.nextWordSubscription != undefined) {
      this.nextWordSubscription.unsubscribe();
    }    
  }

  wordClicked(Word) {
    this._timeTrackerService.wordClickTime((Word.Begin));
  }

  
  onRightClick($event, Word) {
    this.selectedrightclickword = Word;
    if ($event.which === 3 && $event.altKey) {
      this.rightclickedWord = Word.Begin;
      this.rightPanelStyle = { 'display': 'block', 'position': 'absolute' };

      return false;
    }
  }

  closeContextMenu() {
    this.rightPanelStyle = {'display': 'none'};
  }

  ignore(Word, index, from, wordContent) {
    Word.classList.remove('markRed');
    Word.style.borderBottom = '2px solid green';
    this.createObject(this.transcriptIndex, index, wordContent, from, wordContent);
    this._dataService.newWords.push(this.obj);
    this.closeContextMenu();
  }

  ignoreAll() {
   this.createEditedWordMap();
    this.editedWordMap.forEach((value: any, key: any) => {
      if (this.tr.nativeElement.children[this.editedWordMap.get(key).index].className.includes('markRed')) {
        const nativeElement = this.tr.nativeElement;
        nativeElement.children[this.editedWordMap.get(key).index].classList.remove('markRed');
        nativeElement.children[this.editedWordMap.get(key).index].style.borderBottom = '2px solid green';
        this.createObject(
          this.transcriptIndex,
          this.originalWordMap.get(key).index,
          nativeElement.children[this.editedWordMap.get(key).index].firstChild.textContent.trim(), key, this.originalWordMap.get(key).Word);
        if (this.obj.OldWord != this.obj.NewWord.substring(0, this.obj.NewWord.lastIndexOf(" Ignore Ignore All Tag LineBreak")))  
        this._dataService.newWords.push(this.obj);
      }
    });
    this.closeContextMenu();
  }

  addTag(word, index, wordTr, modal) { // wordTr is the template reference of the word.
    this.tagForWord = word.Word;
    this.wordTags = word.Tag;
    this.curWordIndex = index;
    this.modalRef = this.modalService.open(modal);
  }

  removeTag(word, index, wordTr, modal) {
    this.tagForWord = word.Word;
    if (word.Tag) {
      this.curWordtags = word.Tag.split(',');
    }
    this.curWordIndex = index;
    this.modalRef = this.modalService.open(modal);
  }

  saveAfterDeleting() {
    this.createTagObjAndSaveTag(this.curWordtags);
    this.modalRef.close();
  }
  onHandleCut(e, Word) {


    this.editedWordMap.clear();
    this.wordList = this.tr.nativeElement.children;
    this.transcriptWordLength = this.wordList.length;
    for (let i = 0; i < this.transcriptWordLength; i++) {
      this.editedWordMap.set(parseFloat(this.tr.nativeElement.children[i].id), {
        index: i,
        Word: ""
      });
    }
    this.cuthandler = true; this.onContentChange();
  }
  onHandlePaste(e, Word) {
    if (this.selectedrightclickword != undefined)  //works for mouse paste or ctrl+v
      Word = this.selectedrightclickword;

    if (Word == undefined) e.stopPropagation();
    e.preventDefault();
    var elem = document.getElementById(Word.Begin);
    var data = '';
    // check if duplicate keys otherwise will paste in another index
    if (this.originalData.filter(t => t.SpeakerTranscript.Content.some(c => c.Begin == Word.Begin)).length > 1) {
      alert("Duplicate keys found unable to paste the contents at specified position.");
      this.cuthandler = false;
      return;
    }
    if (e && e.clipboardData && e.clipboardData.getData) {// Webkit - get data from clipboard, put into editdiv, cleanup, then cancel event
      if (/text\/html/.test(e.clipboardData.types)) {
        data = e.clipboardData.getData('text/html');
      }
      else if (/text\/plain/.test(e.clipboardData.types)) {
        data = e.clipboardData.getData('text/plain');
      }

      data = data.replace(/<[^/].*?>/g, i => i.split(/[ >]/g)[0] + '>').trim();
      elem.innerText = Word.Word + ' ' + this.replacespantag(data);
      this.onContentChange();

    }
  }
  replacespantag(elem) {

    var newel = document.createElement("span"); var pastedtext = '';
    newel.innerHTML = elem;
    var spans = newel.getElementsByTagName("span");
    for (var i = 0; i < spans.length; i++) {
      pastedtext = pastedtext + (spans[i].textContent || spans[i].innerText).trim() + ' ';

    }
    return pastedtext;


  }

  saveTag() {
    if (this.wordTags) {
      this.newWordTags = this.wordTags.split(',');
    }
    if (this.tagForm.controls['addTag'].value) {
      this.newWordTags.push(this.tagForm.controls['addTag'].value);
    }
    this.createTagObjAndSaveTag(this.newWordTags);
    this.modalRef.close();
  }

  createTagObjAndSaveTag(curWordTags) {
    this.tagObj = {
      Index: this.transcriptIndex,
      WordIndex: this.curWordIndex,
      Tag: curWordTags.join()
    };
    this._dataService.wordTags.push(this.tagObj);
    this._dataService.saveEditedTranscript('saveTag');
  }

  close() {
    this.modalRef.close();
  }

  deleteTag(i) {
    this.curWordtags.splice(i, 1);
  }

  createEditedWordMap() {
    this.editedWordMap.clear();
    this.wordList = this.tr.nativeElement.children;
    this.transcriptWordLength = this.wordList.length;
    for (let i = 0; i < this.transcriptWordLength; i++) {
      this.editedWordMap.set(parseFloat(this.tr.nativeElement.children[i].id), {
        index: i,
        Word: this.tr.nativeElement.children[i].innerText
      });
    }
  }

  addWordIfEmpty(i, key, editedIndex, oldWord) {
    if (this.tr.nativeElement.children[editedIndex].innerText === '') { // check if Word is empty
      this.createObject(this.transcriptIndex, i, '', key, oldWord);
      this._dataService.newWords.push(this.obj); // add Word
    }
  }

  addWordUnderlineGreen(i, key, editedIndex, oldWord) {
    // check if the 'from' in 'id' is equal to key which also contains 'from'
    if (parseFloat(this.tr.nativeElement.children[editedIndex].getAttribute('id')) === key) {
      this.tr.nativeElement.children[editedIndex].classList.remove('markRed');
      this.tr.nativeElement.children[editedIndex].style.borderBottom = '2px solid green'; // underline green
      this.createObject(this.transcriptIndex, i, this.tr.nativeElement.children[editedIndex].innerText, key, oldWord);
      if (this.obj.OldWord != this.obj.NewWord.substring(0, this.obj.NewWord.lastIndexOf(" Ignore Ignore All Tag LineBreak")))  
        this._dataService.newWords.push(this.obj); // add object
    }
  }

  createObject(speakerIndex, wordIndex, word, from, oldWord) {
    if (word) {
      word = word.trim();
    }
    if (oldWord) {
      oldWord = oldWord.trim();
    }
    this.obj = { // create Word object
      Index: speakerIndex,
      WordIndex: wordIndex,
      NewWord: word.replace(/\s+/g, ' '),
      OldWord: oldWord.replace(/\s+/g, ' '),
      from: from
    };
  }

  objectPropInArray(array, prop, val) {
    if (array.length > 0) {
      for (const i in array) {
        if (array[i][prop] === val) {
          return true;
        }
      }
    }
    return false;
  }
    speakerChange(index, oldSpeaker, newSpeaker) {
    const obj = {
      Index: index,
      oldSpeaker: oldSpeaker,
      newSpeaker: newSpeaker.innerText
    };
    this.newLabels = this._dataService.speakerLabels;
    this.wordLength = this.newLabels.length;
    for (let i = 0; i < this.wordLength; i++) {
      if (this.newLabels[i].oldSpeaker === oldSpeaker) {
        this.newLabels.splice(i, 1);
      }
    }
    this._dataService.speakerLabels.push(obj);
  }
    onContentChange() {

      if (!this.cuthandler )
        this.createEditedWordMap();
      if (this.selectedrightclickword != undefined) return;
      this.originalWordMap.forEach((value: any, key: any) => { // looping through edited Word map
        let editedVal;
        if (this.editedWordMap.get(key)) {
          editedVal = this.editedWordMap.get(key).Word; // comparing the values in both the maps using edited Word map key
          //if ((editedVal && editedVal.length > 0) || this.cuthandler) {
          if ((editedVal && editedVal.length > 0)) {
            if (editedVal !== value.Word) { // if the Word is changed
              this.addWordIfEmpty(value.index, key, this.editedWordMap.get(key).index, this.originalWordMap.get(key).Word);
              this.addWordUnderlineGreen(value.index, key, this.editedWordMap.get(key).index, this.originalWordMap.get(key).Word);
            } else {
              // if the Word is put back to match the original Word, we will remove all the changes of that respective Word from the array.
              if (this.objectPropInArray(this._dataService.newWords, 'from', key)) {
                this._dataService.newWords = this._dataService.newWords.filter(obj => {
                  if (obj.from === key) {
                    this.tr.nativeElement.children[this.editedWordMap.get(key).index].style.borderBottom = 'none';
                  }
                  return !(obj.from === key);
                });
              }
            }
          } else { // if the key in the originalWord map is not present in the editedWord map then we have to remove that Word.
            // create Word object
            this.createObject(this.transcriptIndex, this.originalWordMap.get(key).index, '', key, this.originalWordMap.get(key).Word);
            this._dataService.newWords.push(this.obj); // add object
          }
        } else { // if the key in the originalWord map is not present in the editedWord map then we have to remove that Word.
          // create Word object
          this.createObject(this.transcriptIndex, this.originalWordMap.get(key).index, '', key, this.originalWordMap.get(key).Word);
          this._dataService.newWords.push(this.obj); // add object
        }
      });
      this.cuthandler = false;
    }
    splittedWord(Word) {
      var obj = Word.split(" ");
      var k = []; var m = 0;
      obj.forEach(w => {
        k.push({ text: w, textindx: m++ })
      });
      return k;
    }
    getLineBreakPostion(selectedText) {

      this.selectedLineBreakText = selectedText;
    }
    lineBreak(word, index, originalData, transcriptObject) {
      this.guid = this._dataService.getGuid();
      var selIndx = this.transcriptIndex + 1; //this.closeContextMenu();
      if (index > 0)
        var newRecord = transcriptObject.splice(index);
      else {
        alert("Line break cannot be done here please check duration of word.");
        return;
        //var singeword = word.Word.substring(word.Word.indexOf(this.selectedLineBreakText.text));

      }
     


      var newtranscript = {
        Index: this.transcriptIndex + 1,
        SpeakerTranscript: {
          Content: newRecord,
          Speaker: 'newSpeaker'
        }
      };
      this.originalData.splice((this.transcriptIndex + 1), 0, newtranscript);
      
      var request = {
        "CurrentTranscript": this.originalData[this.transcriptIndex],
        "NewTranscript": newtranscript,
      };
      request.CurrentTranscript.Index = this.transcriptIndex;
      request.NewTranscript.Index = this.transcriptIndex + 1;
      var url = `${environment.transcription_Api}/api/watson/updatelinebreaktranscriptdata/`;
      //var url = `http://localhost:4840/api/watson/updatelinebreaktranscriptdata/`;
      this.loading = true;
      this._dataService.dataServicePost(url + this.guid, request)
        .subscribe(data => {
          // this._dataService.updatedTranscript.next();
          this.loading = false;

        }, error => {
          console.log(error);
          this.loading = false;
        })

    }
}
