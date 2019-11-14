import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DataService } from '../../../shared/data.service';


@Injectable()
export class TranscriptService {

  questionnaireList: any = [];

  constructor(private _dataService: DataService) { }
  getTranscription() {
    return this._dataService.dataServiceGet('./assets/api/transcription.json');
  }
  getTranscript() {
    return this._dataService.dataServiceGet('./assets/api/words.json');
  }
}
