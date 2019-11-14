import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthorizationService } from '../../shared/authorization.service';
import { DataService } from '../../shared/data.service';
import * as jwt_decode from 'jwt-decode';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  role: any;
  constructor(private router: Router, public auth: AuthorizationService, private _dataService: DataService) {
    let decod = jwt_decode(this.auth.getToken());
    this.auth.UserProfiledetails.role.name = decod['userRole'];
    this.role = this.auth.UserProfiledetails.role.name;
  }
    
  ngOnInit() {
   //console.log(this.autherisedPages);
    if (this.role === 'Customer' || this.role === 'Customer_Management' || this.role === 'Customer_Agent') {
      this.auth.restrictedUser = true;
    } else {
      this.auth.restrictedUser = false;
    }   
  }

 
  doLogout() {
    this._dataService.loginCheck = false;
    this.auth.logOut();
    this.router.navigateByUrl('/');
  }

  home() {
    this.router.navigate(['/']);
  }
  SideNavSelected(menu) {
    this.auth.currentMenu = menu;
  }
}
