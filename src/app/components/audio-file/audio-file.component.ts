import { Component, OnInit } from '@angular/core';
import { AudioFileService } from '../audio-file/shared/audio-file.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-audio-file',
  templateUrl: './audio-file.component.html',
  styleUrls: ['./audio-file.component.css']
})
export class AudioFileComponent implements OnInit {
  loading: boolean = false;
  guid: '';
  constructor(public audioFileService: AudioFileService, ) {
  }

  ngOnInit() {
    this.audioFileService.audioFileSelected.audioPath = '';
    this.audioFileService.getAudioFilePath.subscribe((response: any) => {
      this.audioPlay(response.fileGuid, response.index)
    });
  }


  audioPlay(item, index) {
    this.audioFileService.getAudioPlay(item).subscribe((response: any) => {
      this.audioFileService.audioFileSelected.audioPath = response.url;
      //this._audioFileService.audioPlay_Transcript.next({
      //});
    })
  }
}
