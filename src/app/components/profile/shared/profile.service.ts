import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {environment} from '../../../../environments/environment';
import {Subject} from 'rxjs/Subject';
import { AuthorizationService } from '../../../shared/authorization.service';
@Injectable()
export class ProfileService {
  //apiSource:any= 0;
  public userprofilerequest = {
    IsUserProfileUpdate: 0,
   
  }
  
  constructor(private http: HttpClient, private _authService: AuthorizationService, ) {
    
  }
  ngOnInit() {

   // this.apiSource = this._authService.UserProfiledetails.defaultAPI === 'AWS' ? 1 : 0;
  }
  updateprofileimageurl(key) {
    if (key == undefined || key.length == 0) {
      this._authService.UserProfiledetails.profilePhotoPath = "../assets/images/sample.PNG";
      return;
    }

    this._authService.updateimageurl(`${environment.transcription_Api}/api/watson/GetReadPreSignedUrl/${key}`)
      .subscribe((res: any) => {

        this._authService.UserProfiledetails.profilePhotoPath =
          res.url;
      });
  }
  updatecompanyimageurl(key) {
    if (key == undefined || key.length == 0) {
      this._authService.UserProfiledetails.customer.companyLogo = "../assets/images/sample.PNG";
      return;
    }
    this._authService.updateimageurl(`${environment.transcription_Api}/api/watson/GetReadPreSignedUrl/${key}`)
      .subscribe((res: any) => {

        this._authService.UserProfiledetails.customer.companyLogo =
          res.url;

      });
  }
  public getprofileuserdata() {
    this._authService.getUserData().subscribe((res: any) => {
      this._authService.UserProfiledetails = JSON.parse(res);
      this._authService.userMenuList.next(this._authService.UserProfiledetails);
      this._authService.UserSettings.rolebasedPageSettings = JSON.parse(res).rolebasedPageSettings;
      this.updateprofileimageurl(this._authService.UserProfiledetails.profilePhotoPath);
      this.updatecompanyimageurl(this._authService.UserProfiledetails.customer.companyLogo);
    });
  }
  
   

   
  public updateProfileInfo() {
    return this.http.post(`${environment.user_Api}/api/user/CreateOrUpdateuser`, this._authService.UserProfiledetails);
  }

  public updateProfilePicture(id,guid, formData, flag) {
    return this.http.post(`${environment.transcription_Api}/api/user/UploadPhoto/${id}/${guid}/${flag}`, formData);
  }
}
