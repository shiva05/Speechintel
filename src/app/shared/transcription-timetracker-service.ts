import {Injectable} from '@angular/core';
import {Subject} from 'rxjs/Subject';

@Injectable()
export class TranscriptionTimetrackerService {

  private trackTime = new Subject();
  trackTime$ = this.trackTime.asObservable();

  private setCurrentTime = new Subject();
  setCurrentTime$ = this.setCurrentTime.asObservable();

  sendCurrentTime(curTime): void {
    this.trackTime.next(curTime);
  }

  wordClickTime(clickedTime) {
    this.setCurrentTime.next(clickedTime);
  }

  constructor() {
  }

}
