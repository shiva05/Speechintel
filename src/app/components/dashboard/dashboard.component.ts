import { Component, OnInit } from '@angular/core';
import { AuthorizationService } from '../../shared/authorization.service';
import * as jwt_decode from 'jwt-decode';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  showRedAlerts: boolean = false;
  dateTime: string;
  sideNavToggle = true;
  role: any;
  contentFullScreen:boolean= true;
//className: string = 'fa-angle-left';
  //@ViewChild('iRef') iRef: ElementRef;
  
  constructor(public authService: AuthorizationService) {
    let decod = jwt_decode(this.authService.getToken());
    this.authService.UserProfiledetails.role.name = decod['userRole'];
    this.role = this.authService.UserProfiledetails.role.name;  
  }

  ngOnInit() {
 this.dateTime = (new Date()).toString().split(' ').splice(0, 5).join(' ');
//this.renderer.addClass(this.iRef.nativeElement, this.className);

  }
  subMenuClicked(event){

     switch(event){
      case "Red Alerts":
      this.showRedAlerts = true;
      break; 
      case "Customer Satisfaction":
      this.showRedAlerts = false;
     }
  }
  toggleSideNav(){
this.sideNavToggle = !this.sideNavToggle;
//if(this.sideNavWidth) {
//this.renderer.removeClass(this.iRef.nativeElement, 'fa-angle-left');
//this.renderer.addClass(this.iRef.nativeElement, 'fa-angle-right');
//} else {
//this.renderer.removeClass(this.iRef.nativeElement, 'fa-angle-left');
//this.renderer.addClass(this.iRef.nativeElement, 'fa-angle-right');
//}
    
  }
}
