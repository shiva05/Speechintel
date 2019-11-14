import {Component, OnInit, Input} from '@angular/core';
import {DataService} from '../../../shared/data.service';
import { AuthorizationService } from '../../../shared/authorization.service';

@Component({
  selector: 'si-transcription-text',
  templateUrl: './transcription-text.component.html',
  styleUrls: ['./transcription-text.component.css']
})
export class TranscriptionTextComponent implements OnInit {
  config: any;
  transcript: any;
  @Input() transcription: any;
  @Input() selectedTagType: any;
  newLabels: any[];
  wordLength: number;
  role: any;
  speakerLabels: any[];
  replaceText: string;
  @Input() searchClick: any;
  private _transcriptFilter: string;

  constructor(public dataService: DataService, public authService: AuthorizationService,) {
  }

  ngOnInit() {
    this.role = this.authService.UserProfiledetails.role.name;
    this.authService.transcriptdataLoaded = true;
  }

  get transcriptFilter(): string {
    return this._transcriptFilter;
  }

  set transcriptFilter(text) {
    this.dataService.highlightWords = []; // clearing the hilightWords array before searching and highlighting the newWords.
    this._transcriptFilter = text;
  }

  replaceAll() {
    if (this.replaceText) {
      this.dataService.replaceEditedTranscript('replaceAll');
    }
  }

  replace() {
    if (this.replaceText) {
      this.dataService.replaceEditedTranscript('replace');
    }
  }

  previousWord() {
    this.dataService.highlightPreviousWord('previous word');
  }

  nextWord() {
    this.dataService.highlightNextWord('next word');
  }

  speakerChange(index, oldSpeaker, newSpeaker) {
    const obj = {
      Index: index,
      oldSpeaker: oldSpeaker,
      newSpeaker: newSpeaker.innerText
    };
    this.newLabels = this.dataService.speakerLabels;
    this.wordLength = this.newLabels.length;
    for (let i = 0; i < this.wordLength; i++) {
      if (this.newLabels[i].oldSpeaker === oldSpeaker) {
        this.newLabels.splice(i, 1);
      }
    }
    this.dataService.speakerLabels.push(obj);
  }

  onBlur() {
    if (this.dataService.speakerLabels.length > 0) {
      this.dataService.saveEditedTranscript('saveSpeakerLabels');
    }
  }
}
