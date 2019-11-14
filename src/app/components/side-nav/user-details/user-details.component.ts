import {Component, OnDestroy, OnInit} from '@angular/core';
import {AuthorizationService} from '../../../shared/authorization.service';
import {ProfileService} from '../../profile/shared/profile.service';
import {Subscription} from 'rxjs/Subscription';

@Component({
  selector: 'app-user-details',
  templateUrl: './user-details.component.html',
  styleUrls: ['./user-details.component.css']
})
export class UserDetailsComponent implements OnInit, OnDestroy {
  
   

  constructor(public _authService: AuthorizationService, private _ProfileService: ProfileService) {
  }

  ngOnInit() {
    
  }

  ngOnDestroy() {
    
  }
}
