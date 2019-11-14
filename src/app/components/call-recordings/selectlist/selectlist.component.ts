import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { NgbDate } from '@ng-bootstrap/ng-bootstrap/datepicker/ngb-date';
import { NgbCalendar } from '@ng-bootstrap/ng-bootstrap/datepicker/ngb-calendar';
import { FileInfoService } from '../shared/file-info.service';
import { AuthorizationService } from '../../../shared/authorization.service';

@Component({
  selector: 'app-selectlist',
  templateUrl: './selectlist.component.html',
  styleUrls: ['./selectlist.component.css']
})
export class SelectlistComponent implements OnInit {
  

  @Output()
  countRadioButtonSelectionChanges: EventEmitter<string> = new EventEmitter<string>();

  //@Input()
  //all: number;

  //@Input()
  //processing: number;

  //@Input()
  //completed: number;

  
  constructor(public fileInfoService: FileInfoService, public authService: AuthorizationService,) {
  }

  ngOnInit() {
    this.authService.selectedRadioButtonValue = 'All';
  }

  onRadioButtonSelectionChange() {
    this.countRadioButtonSelectionChanges.emit(this.authService.selectedRadioButtonValue); // emitting value when clicked on a radio button
  }

}
