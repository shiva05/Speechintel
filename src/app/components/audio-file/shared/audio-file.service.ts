import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { DataService } from '../../../shared/data.service';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class AudioFileService {
  public audioPlay_Transcript = new Subject<{fileGuid: '', index: ''}>();

  constructor(public dataService: DataService) { }
  audioFileSelected = {
    "FileGuid": '',
    "FileName": '',
    "audioPath": ''
  }

  getAudioFilePath = new Subject<{ fileGuid: '', index: '' }>();

  getAudioPlay(item) {
    return this.dataService.dataServiceGet(`${environment.transcription_Api}/api/watson/GetReadPreSignedUrl/${item.Guid}/${item.TranscriptAPISource}`).map(res => res);
  }
}
