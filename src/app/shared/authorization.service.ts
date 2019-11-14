import { Injectable} from '@angular/core';
import { AuthenticationDetails, CognitoUser, CognitoUserPool, CognitoUserAttribute } from 'amazon-cognito-identity-js';
import { Observable } from 'rxjs/Observable';
import { HttpClient } from '@angular/common/http';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Router, NavigationEnd, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Subject } from 'rxjs/Subject';
import * as jwt_decode from 'jwt-decode';
import { environment } from '../../environments/environment';

const poolData = {
  UserPoolId: 'us-west-2_3ESTFwePr',
  ClientId: '64ug90dmk6i893jah33fjhmss3'
};

const userPool = new CognitoUserPool(poolData);

@Injectable()
export class AuthorizationService {
  activemenu: any;
  cognitoUser: any;
  redirectUrl: any;
  currentUrl: any;
  userPassword: any = '';
  //currentMenu = new Subject<string>();
  currentMenu: any;
  userName = new Subject<string>();
  userMenuList = new Subject<string>();
  viewScoreDetails = new Subject<string>();
  transcriptdataLoaded = false;

  navigatedfromCallTranscriptionPage: boolean = false;
  navigationBackFromcalltranscrtiptionPage: boolean;
  navBackToCallRecordings: boolean;
  navfromCallRecordings: boolean;

  navigationFromAgentPage: boolean;
  navigationBackFromAgentScore: boolean;
  navigationBackFromAgentPage: boolean;
  navigationFromAgentScorePage: boolean;

  navigationFromRedAlertPage: boolean;
  navigationBackFromRedAlertPage: boolean;
  navigationFromRedAlertScorePage: boolean;
  navigationBackFromRedAlertScorePage: boolean;

  navigationFromCustomerSatisfactionPage: boolean;
  navigationBackFromCustomerSatisfactionPage: boolean;
  navigationFromCustomerSatisfactionScorePage: boolean;
  navigationBackFromCustomerSatisfactionScorePage: boolean;

  disputedCallSelectedCall : any;
  navigatedFromDisputeCalls: boolean;
  disputedCallDuration: any;
  selectedRadioButtonValue: string;
  restrictedUser: boolean;
  public UserProfiledetails: any = {
    firstName: "", lastName: "", userName: "", email: "", profilePhotoPath:""
    ,id: 0,  role: {
      name: "", Id: 0
    },
    defaultAPI : '',
    customer:{
      name: "", customerGuid: "", id: 0,  
      companyLogo: "",
      customerSatisfactionURL: '',
      redAlertURL: '',
      agentPerformanceURL: ''
    },
    password: "", oldPassword: "", confirmPassword: "", UserProfileUpdateFlags:""
  };
  public selectedFileToViewScore = [];
  public selectedFileindex = 0;
  public UserSettings: any = {
    pagination: { selectedPageindex: 0, pageSize: 0, },
    rolebasedPageSettings:[]
  };
  public navigationFromDisputedCalls: boolean;
  constructor(private _http: HttpClient, public jwtHelper: JwtHelperService, private router: Router) {
    this.currentUrl = this.router.routerState.snapshot.url;
  }

  register(email, password, mobileNumber, username) {
    const dataEmail = {
      Name: 'email',
      Value: email // your email here
    };
    const dataPhoneNumber = {
      Name: 'phone_number',
      Value: mobileNumber// your phone number here with +country code and no delimiters in front
    };
    const attributeList = [];
    const attributeEmail = new CognitoUserAttribute(dataEmail);
    const attributePhoneNumber = new CognitoUserAttribute(dataPhoneNumber);

    attributeList.push(attributeEmail);
    attributeList.push(attributePhoneNumber);
    return Observable.create(observer => {
      userPool.signUp(email, password, attributeList, null, (err, result) => {
        if (err) {
          console.log('signUp error', err);
          observer.error(err);
        } else {
          this.cognitoUser = result.user;
          console.log('signUp success', result);
          observer.next(result);
          observer.complete();
        }
      });
    });

  }

  confirmAuthCode(code) {
    const user = {
      Username: this.cognitoUser.username,
      Pool: userPool
    };
    return Observable.create(observer => {
      const cognitoUser = new CognitoUser(user);
      cognitoUser.confirmRegistration(code, true, function (err, result) {
        if (err) {
          console.log(err);
          observer.error(err);
        }
        console.log('confirmAuthCode() success', result);
        observer.next(result);
        observer.complete();
      });
    });
  }

  signIn(email, password) {

    const authenticationData = {
      Username: email,
      Password: password,
    };
    const authenticationDetails = new AuthenticationDetails(authenticationData);

    const userData = {
      Username: email,
      Pool: userPool
    };
    const cognitoUser = new CognitoUser(userData);

    return Observable.create(observer => {

      cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: function (result) {
          console.log(result);
          observer.next(result);
          observer.complete();
        },
        onFailure: function (err) {
          console.log(err);
          observer.error(err);
        },
      });
    });
  }

  isLoggedIn() {
    return userPool.getCurrentUser() != null;
  }

  getAuthenticatedUser() {
    // gets the current user from the local storage
    return userPool.getCurrentUser();
  }

  logOut() {
    /*  this.getAuthenticatedUser().signOut();
     this.cognitoUser = null; */
    // this.sessionService.logOut();
    this.redirectUrl = '/dashboard/callUpload';
    localStorage.clear();
    sessionStorage.clear();
    this.router.navigate(['/login']);
  }

  forgotPassword(userEmail) {
    const user = {
      Username: userEmail,
      Pool: userPool
    };
    return Observable.create(observer => {
      const cognitoUser = new CognitoUser(user);
      cognitoUser.forgotPassword({
        onSuccess: function (data) {

          // successfully initiated reset password request
          console.log('CodeDeliveryData from forgotPassword: ' + data);
        },
        onFailure: function (err) {
          console.log(err);
          observer.error(err);
        },
        // Optional automatic callback
        inputVerificationCode: function (data) {
          console.log('Code sent to: ' + data);
          const verificationCode = prompt('Please input verification code ', '');
          const newPassword = prompt('Enter new password ', '');
          cognitoUser.confirmPassword(verificationCode, newPassword, {
            onSuccess() {
              const data = true;
              observer.next(data);
              observer.complete();

              console.log('Password confirmed!');
            },
            onFailure(err) {
              console.log(err);
              console.log('Password not confirmed!');
            }
          });
        }
      });

    });


  }

  logIn(url, credentials): any {
    return this._http.post(url, credentials).map(res => {
      return res;
    });
  }

  contactUs(url, credentials): any {
    return this._http.post(url, credentials).map(res => {
      return res;
    });
  }

  setUserData(details) {
    localStorage.setItem('details', JSON.stringify(details));
  }

  getUserData() {
    const tokenDecoded = jwt_decode(localStorage.getItem('token'));



    var url = `${environment.user_Api}/api/User/getuserdetails/${tokenDecoded['email']}/${tokenDecoded['customerGuid']}`;
     

    return this._http.get(url);
    
  }
  updateimageurl(url) {
    return this._http.get(url);
      
   
  };
   

  getToken() {
    try {
    return localStorage.getItem('token');
    } catch (e) {

    }
   
  }

  setToken(token) {
    localStorage.setItem('token', token);
  }

  removeToken() {
    localStorage.removeItem('token');
  }



  public isAuthenticated(): boolean {

    const token = localStorage.getItem('token');

    // Check whether the token is expired and return
    // true or false
    return !this.jwtHelper.isTokenExpired(token);
  }




}
