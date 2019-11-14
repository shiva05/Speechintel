import { Component, OnInit, Output, Input, EventEmitter, OnDestroy } from '@angular/core';
import { AuthorizationService } from '../../shared/authorization.service';
import { ProfileService } from '../profile/shared/profile.service';
import * as jwt_decode from 'jwt-decode';
import { Pipe, PipeTransform } from '@angular/core';
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';
import { SideNavService } from './side-nav.service';

@Component({
  selector: 'app-side-nav',
  templateUrl: './side-nav.component.html',
  styleUrls: ['./side-nav.component.css']
})
export class SideNavComponent implements OnInit {
  @Output() onSubMenuClicked: EventEmitter<string> = new EventEmitter();
  activatedSubmenu: any = '';
  details: any;
  role: any;
  config: any;
  subMenuListToggle: boolean;
  restrictedUser: boolean;
  childMenuListToggle: boolean;
  menuChild = false;
  menuSubChild = false;
  menuGrandChild = false;
  landingPage = 0;
  menuList = [];
  constructor(private _authService: AuthorizationService, private _ProfileService: ProfileService, private _router: Router, public _sidenav: SideNavService ) {
   
  }
  public parentIndex: any;
  public currentMenu: any;
  menus: Object[] = [
    {
      'name': 'Dashboard',
      'subMenu': false,
      'link': 'DashboardMain',
      'isActive': true,
      'icon': '../../../assets/images/home.png',
      'collapse': false,
    },
    {
      'name': 'Call Upload',
      'subMenu': false,
      'link': 'callUpload',
      'isActive': true,
      'icon': '../../../assets/images/merge-call.png',
      'collapse': false,
    },
    {
      'name': 'Call Recordings',
      'subMenu': false,
      'link': 'callRecordings',
      'isActive': true,
      'icon': '../../../assets/images/call.png',
      'collapse': false,
    },
    {
      'name': 'Call Transcripts',
      'subMenu': false,
      'link': 'callTranscripts',
      'isActive': true,
      'icon': '../../../assets/images/new-file.png',
      'collapse': true,
    },
    {
      'name': 'Live Assistance',
      'subMenu': false,
      'link': 'liveassistance',
      'isActive': true,
      'icon': '../../../assets/images/call.png',
      'collapse': false,
    },
    {
      'name': 'Call Analytics',
      'subMenu': true,
      'collapse': false,
      'icon': '../../../assets/images/increasing-stocks-graphic.png',
      'subMenuItems': [
        {
          'name': 'Customer Satisfaction',
          'isActive': true,
          'link': 'customerSatisfaction',
          'icon': '../../../assets/images/review.png',
          'subMenuTree': false,
          'collapse': false
          //'menuListItems': [
          //  {
          //    'name': 'Customer Satisfaction Score',
          //    'icon': '../../../assets/images/increasing-stocks-graphic.png',
          //    'link': 'agentPerformance',
          //    'isActive': true,
          //  },
          //  {
          //    'name': 'Customer Satisfaction Report',
          //    'icon': '../../../assets/images/increasing-stocks-graphic.png',
          //    'link': 'agentPerformanceReport',
          //    'isActive': true,
          //  }
          //]

        },
        {
          'name': 'Red Alerts',
          'isActive': true,
          'link': 'redAlerts',
          'subMenuTree': false,
          'collapse': false
          //'menuListItems': [
          //  {
          //    'name': 'Red Alerts Score',
          //    'icon': '../../../assets/images/increasing-stocks-graphic.png',
          //    'link': 'agentPerformance',
          //    'isActive': true,
          //  },
          //  {
          //    'name': 'Red Alerts Report',
          //    'icon': '../../../assets/images/increasing-stocks-graphic.png',
          //    'link': 'agentPerformanceReport',
          //    'isActive': true,
          //  }
          //]
        },
        {
          'name': 'Agent Performance',
          'icon': '../../../assets/images/increasing-stocks-graphic.png',
          //'link': 'agentPerformance',
          'subMenuTree': true,
          'pageAccess' : true,
          'collapse': false,
          'menuListItems': [
            {
              'name': 'Scores',
              'icon': '../../../assets/images/increasing-stocks-graphic.png',
              'link': 'agentPerformance',
              'pageAccess': true,
              'isActive': true,
            },
            {
              'name': 'Disputed Calls',
              'icon': '../../../assets/images/increasing-stocks-graphic.png',
              'link': 'disputedCalls',
              'pageAccess': true,
              'isActive': true,
            },
            {
              'name': 'Reports',
              'icon': '../../../assets/images/increasing-stocks-graphic.png',
              // 'link': 'agentPerformanceReport',
              'childSubchild': true,
              'collapse': false,
              'reportsList': [
                {
                  'name': 'Avg Score by Agent',
                  'icon': '../../../assets/images/increasing-stocks-graphic.png',
                  'link': 'AvgScorebyAgent',
                  'isActive': true,
                },
                {
                  'name': 'Avg score by Target',
                  'icon': '../../../assets/images/increasing-stocks-graphic.png',
                  'link': 'AvgScorebyTarget',
                  'isActive': true,
                },
                {
                  'name': 'Avg Score by Questions',
                  'icon': '../../../assets/images/increasing-stocks-graphic.png',
                  'link': 'AvgScorebyQuestions',
                  'isActive': true,
                },
                {
                  'name': 'Avg Score by Category',
                  'icon': '../../../assets/images/increasing-stocks-graphic.png',
                  'link': 'AvgScorebyCategory',
                  'isActive': true,
                },
                {
                  'name': 'Tone Emotions by Calls',
                  'icon': '../../../assets/images/increasing-stocks-graphic.png',
                  'link': 'ToneEmotionsbyCall',
                  'isActive': true,
                }
              ]
            }
          ]
        }
      ]
    },
    {
      'name': 'Settings',
      'settingMenu': true,
      'collapse': false,
      'icon': '../../../assets/images/settings.png',
      'subMenuItems': [
        {
          'name': 'Profile',
          'isActive': true,
          'link': 'profile',
          'icon': '../../../assets/images/avatar.png',
        },
        {
          'name': 'Scoring Engine',
          'isActive': true,
          'link': 'scoringEngine',
          'icon': '../../../assets/images/questions.png',
        }
      ]
    }
];

  toggleMenu: boolean;
  toggleSettingsMenu: boolean;
  toggleAgentMenu: boolean;
  getRole() {

    let decod = jwt_decode(this._authService.getToken());
    this._authService.UserProfiledetails.role.name = decod['userRole'];
    this.role = this._authService.UserProfiledetails.role.name;
  }
  ngOnInit() {
    this.getRole(); this._ProfileService.getprofileuserdata();
    this.toggleMenu = true;
    this.toggleSettingsMenu = true;
    this.toggleAgentMenu = true;
    this._authService.redirectUrl = this._authService.redirectUrl.split('?')[0].replace('#', '');
    
    if (this._authService.UserProfiledetails.role.name === "Customer_Agent") {
      this.restrictedUser = true;
      this._router.navigate(['dashboard/agentPerformance']);
      this._authService.currentMenu = "Scores";
      //this.switchMenu('dashboard/agentPerformance');
    } else {
      this.switchMenu(this._authService.redirectUrl);
    }

    this._authService.userMenuList.subscribe(res => {
      this.menuList = res['rolebasedPageSettings'];
      this.menuList.forEach(e => {
        if (e.link === "callUpload") {
          this.landingPage = e['pageId']; 
        }
      });
      this.getComponentPermissions(this.landingPage);
      //console.log(this.menuList);
    });

    //this._authService.currentMenu.subscribe(value => {
    //  this.switchMenu(value);
    //});
  }

  menuClicked(menu, name, index) {
    this.parentIndex = index;
    this._authService.currentMenu = name;
    this.activatedSubmenu = '';
    if (menu.subMenu) {
      this.toggleMenu = !this.toggleMenu;
    } else if (menu.settingMenu) {
      this.toggleSettingsMenu = !this.toggleSettingsMenu;
    }
  }

  submenu(list, event, index) {
    //change the condition when all the sum pages are active
    if (list.name !== 'Agent Performance') {
      this._authService.currentMenu = list.name;
    } else {
      this._authService.currentMenu = list.name;
      this.subMenuListToggle = !this.subMenuListToggle;
    }
    //this._authService.currentMenu = list.name;
    ////this.subMenuListToggle = !this.subMenuListToggle;
    //var selectedList = 'selectedSubList' + index;
    //var arrowsState = 'arrowtoggle' + index;
    //document.getElementById(selectedList).classList.toggle('hidden');
    //document.getElementById(arrowsState).classList.toggle('hidden');

  }

  reportsMenu(list, event, index) {
    //change the condition when all the sum pages are active
    if (list.name !== 'Reports') {
      this._authService.currentMenu = list.name;
    } else {
      this._authService.currentMenu = list.name;
      this.childMenuListToggle = !this.childMenuListToggle;
    }
    //this._authService.currentMenu = list.name;
    ////this.subMenuListToggle = !this.subMenuListToggle;
    //var selectedList = 'selectedSubList' + index;
    //var arrowsState = 'arrowtoggle' + index;
    //document.getElementById(selectedList).classList.toggle('hidden');
    //document.getElementById(arrowsState).classList.toggle('hidden');

  }

  childList(list, event) {
    this._authService.currentMenu = list.name;
  }
  subMenuClicked(subMenu, event) {
    if (subMenu.name === 'Customer Satisfaction' || subMenu.name === 'Red Alerts' || subMenu.name === 'Agent Performance') {
      this.toggleMenu = !this.toggleMenu;
      this._authService.currentMenu = subMenu.name;
      event.preventDefault();
      this.onSubMenuClicked.emit(subMenu);
    } else if (subMenu.name === 'Profile' || subMenu.name === 'Scoring Engine') {
      this.toggleSettingsMenu = !this.toggleSettingsMenu;
      this._authService.currentMenu = subMenu.name;
      event.preventDefault();
      this.onSubMenuClicked.emit(subMenu);
    }

    //this.toggleMenu = !this.toggleMenu;
    //this.toggleSettingsMenu = !this.toggleSettingsMenu;
    //this.currentMenu = subMenu.name;
    //event.preventDefault();
    //this.onSubMenuClicked.emit(subMenu);
  }

  collapseSubmenu(level){
    if (level == "menuChild") {
      this.menuChild = !this.menuChild;
    } else if (level == "menuSubChild"){
      this.menuSubChild = !this.menuSubChild;
    }
    else if (level == "menuGrandChild") {
      this.menuGrandChild = !this.menuGrandChild;
    }
  }

  public navigateToLink(menu) {
    this._authService.currentMenu = menu.name;
  }

  getComponentPermissions(pageId) {
    var email = this._authService.UserProfiledetails['email'];
    this._sidenav.getComponentPermissions(email, pageId).subscribe(res => {
      //console.log(res);
    });
  }

  public showSubmenu(menu) {
    if (menu.name == 'Call Analytics') {
      this.toggleMenu = !this.toggleMenu;
    } else if (menu.name == 'Settings') {
      this.toggleSettingsMenu = !this.toggleSettingsMenu;
    }
  }

  switchMenu(menuItem) {
    switch (menuItem) {
      case '/dashboard/callUpload':
        this._authService.currentMenu = 'Call Upload';
        break;
      case '/dashboard/callRecordings':
        this._authService.currentMenu = 'Call Recordings';
        break;
      case '/dashboard/callTranscripts':
        this._authService.currentMenu = 'Call Transcripts';
        break;
      case '/dashboard/disputedCalls':
        this._authService.currentMenu = 'Disputed Calls';
        break;
      case '/dashboard/customerSatisfaction':
        this._authService.currentMenu = 'Customer Satisfaction';
        break;
      case '/dashboard/liveassistance':
        this._authService.currentMenu = 'Live Assistance';
        break;
      case '/dashboard/redAlerts':
        this._authService.currentMenu = 'Red Alerts';
        break;
      case '/dashboard/agentPerformance':
        this._authService.currentMenu = 'Scores';
        break;
      case '/dashboard/AvgScorebyAgent':
        this._authService.currentMenu = 'Avg Score by Agent';
        break;
      case '/dashboard/AvgScorebyTarget':
        this._authService.currentMenu = 'Avg score by Target';
        break;
      case '/dashboard/AvgScorebyQuestions':
        this._authService.currentMenu = 'Avg Score by Questions';
        break;
      case '/dashboard/AvgScorebyCategory':
        this._authService.currentMenu = 'Avg Score by Category';
        break;
      case '/dashboard/ToneEmotionsbyCall':
        this._authService.currentMenu = 'Tone Emotions by Calls';
        break;
      case '/dashboard/DashboardMain':
        this._authService.currentMenu = 'Dashboard';
        break;
      case '/dashboard/profile':
        this._authService.currentMenu = 'Profile';
        break;
      case '/dashboard/scoringEngine':
        this._authService.currentMenu = 'Scoring Engine';
        break;
      default:
        this._authService.currentMenu = 'Call Upload';
        break;
    }
  }


}
