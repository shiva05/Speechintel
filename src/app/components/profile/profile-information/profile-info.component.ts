import { Component, ViewContainerRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthorizationService } from '../../../shared/authorization.service';
import { ProfileService } from '../shared/profile.service';
import { environment } from '../../../../environments/environment';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';

@Component({
  selector: 'app-profile-info',
  templateUrl: './profile-info.component.html',
  styleUrls: ['./profile-info.component.css']
})
export class ProfileInfoComponent {
  title = 'Profile Details';
  message = '';


  loader = false;
  public profileInfo: FormGroup;
  public validation_messages = {
    'uname': [
      { type: 'required', message: 'Username is required' },
      { type: 'minlength', message: 'Username must be at least 6 characters long' },
      { type: 'maxlength', message: 'Username cannot be more than 40 characters long' },
    ],
    'fname': [
      { type: 'required', message: 'Firstname is required' },
      { type: 'minlength', message: 'Firstname must be at least 6 characters long' },
      { type: 'maxlength', message: 'Firstname cannot be more than 40 characters long' },
    ],
    'lname': [
      { type: 'required', message: 'Lastname is required' },
      { type: 'minlength', message: 'Lastname must be at least 6 characters long' },
      { type: 'maxlength', message: 'Lastname cannot be more than 40 characters long' },
    ],
    'email': [
      { type: 'required', message: 'Email is required' },
      { type: 'pattern', message: 'Enter a valid email' }
    ]
  };


  constructor(private fb: FormBuilder,
    public _authService: AuthorizationService,
    public _ProfileService: ProfileService, public toastr: ToastsManager, vRef: ViewContainerRef) {
    this.profileInfo = fb.group({
      uname: ['', Validators.compose([Validators.maxLength(40), Validators.minLength(5), Validators.required])],
      fname: ['', Validators.compose([Validators.maxLength(40), Validators.minLength(3), Validators.required])],
      lname: ['', Validators.compose([Validators.maxLength(40), Validators.minLength(1), Validators.required])],
      email: ['', Validators.compose([Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+.[a-z]{2,4}$'), Validators.required])]
    });
    this.toastr.setRootViewContainerRef(vRef);
    //this.getUserDataDetails(); don't call again
  }

  uploadProfileImage(event: any) {

    const formData = new FormData();
    if (event.target.files[0].size > (300 * 1024)) {
      //toster please select smaller file
      this.toastr.error('Image size should not exceed 200kb');
    } else {
      this.toastr.success('Image uploaded successfully');
      formData.append(event.target.files[0].name, event.target.files[0]);
      this.uploadPhoto(formData, false);
    }
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
  uploadPhoto(formData: any, flag) {
    this.loader = true;
    this._ProfileService.updateProfilePicture(this._authService.UserProfiledetails.id,
      this._authService.UserProfiledetails.customer.customerGuid, formData, flag).subscribe(res => {

        this.updateprofileimageurl(res['uploadedurl']);


        //taoaster here
      },
        err => {
          //toaster
          this.loader = false;

        }, () => { this.loader = false; });
  }

  public updateInfo() {
    //if (!this.profileInfo.valid) return; this.loader = true; need to check its not hitting service so commented 

    this._authService.UserProfiledetails.UserProfileUpdateFlags = "{IsUserProfileUpdate: 1 }";
    this._ProfileService.updateProfileInfo().subscribe(res => {
      this.toastr.success('Profile updated successfully');
    },
      err => {
        this.toastr.error('Something went wrong please contact system admin.');
      }, () => {
        this.loader = false;

      });
  }
  removeImage(formData: any, flag) {
    if (this._authService.UserProfiledetails.profilePhotoPath == "../assets/images/sample.PNG")
      return;
    this.loader = true;
    this._authService.UserProfiledetails.UserProfileUpdateFlags = "{IsUserProfileLogoDelete: 1 }";

    this._ProfileService.updateProfileInfo()
      .subscribe(res => {
        this.toastr.success('Removed uploaded image');
      },
        err => {
          this.loader = false;
          this.toastr.error('Image not removed');
          //add toaster message
        }
        , () => {
          this.loader = false;

          this.updateprofileimageurl("");
        });
  }
}
