import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Subject} from 'rxjs/Subject';
 

@Injectable()
export class DataService {

  fileGuid: string;
  newWords: any[] = [];
  speakerLabels: any[] = [];
  wordTags: any[] = [];
  downloadLinks = new Map();
  highlightWords: any[] = [];
  wordToReplaceIndex: number;
  curReplaceWord: any;
  guid: any;
  loginCheck: boolean = false;
  profileImagePath: any;
  selectedFile: any;
  customerEndPoints: any = [];
  count = 0;
  countStart: boolean;
  private replaceText = new Subject();
  replaceText$ = this.replaceText.asObservable();

  private previousWord = new Subject();
  previousWord$ = this.previousWord.asObservable();

  private nextWord = new Subject();
  nextWord$ = this.nextWord.asObservable();

  private saveTranscript = new Subject();
  saveTranscript$ = this.saveTranscript.asObservable();

  setGuid(guid) {
    this.guid = guid;
  }

  getGuid() {
    return this.guid;
  }

  saveEditedTranscript(saveInfo) {
    this.saveTranscript.next(saveInfo);
  }


  constructor(private _http: HttpClient) {
  }

  replaceEditedTranscript(replaceInfo): void {
    this.replaceText.next(replaceInfo);
  }

  highlightPreviousWord(previousWord) {
    this.previousWord.next(previousWord);
  }

  highlightNextWord(nextWord) {
    this.nextWord.next(nextWord);
  }
  updatedTranscript = new Subject<void>();
  removeCurrentTime() {
    localStorage.removeItem('CurrentTime');
  }

  dataServiceGet(url) {
    return this._http.get(url);
  }

  dataServicePut(url, data) {
    return this._http.put(url, data);
  }

  dataServicePost(url, data) {
    return this._http.post(url, data);
  }
  dataServiceGetWithOptions(url,  options) {
     
    return this._http.get(url, options);
   
  }
 dataServicePostWithOptions(url, data,options) {

   return this._http.post(url, data, options);

  }
  dataServiceDelete(url, data) {
    return this._http.delete(url, data);
  }

  dataServicePatch(url, data) {
    return this._http.patch(url, data);
  }

  getFileuploadUrl() {
    return this._http.get('https://1y514rxuc0.execute-api.us-west-2.amazonaws.com/Prod/api/recording/test/url/test/test');
  }

  formatTime(d) {
    d = Number(d);
    var h = Math.floor(d / 3600);
    var m = Math.floor(d % 3600 / 60);
    var s = Math.floor(d % 3600 % 60);

    //var hDisplay = h > 0 ? h + (h == 1 ? " , " : " , ") : "";
    //var mDisplay = m > 0 ? m + (m == 1 ? " , " : " , ") : "";
    //var sDisplay = s > 0 ? s + (s == 1 ? " " : " ") : "";
    var hrs = '';
    var min = '';
    var sec = '';
    if (h < 10) {
      hrs = '0' + h;
    } else {
      hrs = h + '';
    }
    if (m < 10) {
      min = '0' + m;
    } else {
      min = m + '';
    }
    if (s < 10) {
      sec = '0' + s;
    } else {
      sec = s + '';
    }

    var totalTime = '';
    if (hrs === '00'){
      totalTime =  min + ':' + sec;
    } else {
      totalTime = hrs + ':' + min + ':' + sec;
    }
    return totalTime; 
    //const date = new Date(null);
    //if (seconds) {
    //  date.setSeconds(seconds); // specify value for SECONDS here
    //  const result = date.toISOString().substr(11, 8);
    //  const hours = result.split(':')[0];
    //  if (hours === '00') {
    //    return (result.split(':')[1] + ':' + result.split(':')[2]);
    //  }
    //  return result;
    //} else {
    //  return '';
    //}
  }
}

