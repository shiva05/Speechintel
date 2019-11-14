import { Component, ViewContainerRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AppState } from '../../../app.state';
import { Store } from '@ngrx/store';
import { Router } from '@angular/router';
import { AuthorizationService } from '../../../shared/authorization.service';
import { ProfileService } from '../shared/profile.service';
import { environment } from '../../../../environments/environment';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';

@Component({
  selector: 'app-company-info',
  templateUrl: './company-info.component.html',
  styleUrls: ['../../profile/profile-information/profile-info.component.css', './company-info.component.css']
})
export class CompanyInfoComponent {

  public canEdit = false;
  public passwordForm: FormGroup;

  public isPasswordVerified = false;
  editFeature: boolean = false;
  loader = false;

  message = false;
  validationMsg = false;

  finalFlag = true;
  errorclass = true;
  statusMsg = '';

  public passwordRules = [
    'One uppercase character',
    'One lowercase character',
    'One special case character',
    'One number',
    'Minimum 8 Characters and Maximun 16 Characters'
  ];



  public onEdit() {
    this.canEdit = true;
  }

  public onSave() {
    this.canEdit = false;

  }
  ngOnInit() {
    if (this._authService.UserProfiledetails.role.name == 'Customer') {
      this.editFeature = true;
    }
    //this.getuserprofiledata();
  }
  constructor(private fb: FormBuilder,
    private store: Store<AppState>,
    public _authService: AuthorizationService,
    private router: Router,
    private _ProfileService: ProfileService, public toastr: ToastsManager, vRef: ViewContainerRef) {
    this.isPasswordVerified = false;

    this.passwordForm = fb.group({
      cpassword: ['', Validators.compose([Validators.required, Validators.maxLength(16), Validators.minLength(8)])],
      npassword: ['', Validators.compose([Validators.required, Validators.maxLength(16), Validators.minLength(8),
      Validators.pattern('^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$')])],
      cnfmpassword: ['', Validators.compose([Validators.required, Validators.maxLength(16), Validators.minLength(8)])]
    });
    this.toastr.setRootViewContainerRef(vRef);
  }



  passwordChange() {
    this.errorclass = true;
    let currentPassword = this._authService.UserProfiledetails.oldPassword;
    let newPassword = this._authService.UserProfiledetails.password;
    let confirmPassword = this._authService.UserProfiledetails.confirmPassword;
    this.statusMsg = '';
    if (currentPassword === '') {
      this.toastr.error('Please enter current password');
      this.statusMsg = 'Please enter current password';
    }
    else if (newPassword === '') {
      this.toastr.error('Please enter new password');
      this.statusMsg = 'Please enter new password';
    }
    else if (!this.passwordForm.controls["npassword"].valid) {
      this.toastr.error('Please provide valid new password');
      this.statusMsg = 'Please provide valid new password';
    }
    else if (newPassword === currentPassword) {
      this.toastr.error('Current password and new password should not be same');
      this.statusMsg = 'Current password and new password should not be same';
    }
    else if (confirmPassword === '') {
      this.toastr.error('Please enter confirm password');
      this.statusMsg = 'Please enter confirm password';
    }
    else if (!this.passwordForm.controls["cnfmpassword"].valid) {
      this.toastr.error('Please provide valid confrim password');
      this.statusMsg = 'Please provide valid confrim password';
    }
    else if (newPassword !== confirmPassword) {
      this.toastr.error('New password and confirm password are not equal');
      this.statusMsg = 'New password and confirm password are not equal';
    }
    else {
      this.statusMsg = '';
      return;
    }
    return;
  }

  updatePassword() {
    this.passwordChange();
    if (this.statusMsg != '') return;

    this.loader = true;

    this._authService.UserProfiledetails.UserProfileUpdateFlags = "{IsChangePassword: 1 }";
    this._ProfileService.updateProfileInfo().subscribe(res => {

      //toaster
      this.toastr.success('Password updated successfully');
      this.passwordForm.reset();
    }, err => {
      this.toastr.error('Current password is incorrect');
      this.loader = false;
    }
      , () => {
        this.loader = false;

      });

  };


  updateCompanyName() {

    this.canEdit = false;
    this.loader = true;
    this._authService.UserProfiledetails.UserProfileUpdateFlags = "{IsCompanyNameChanged: 1 }";

    this._ProfileService.updateProfileInfo()
      .subscribe(res => {

        //add toaster message

      },
        err => {
          this.loader = false;
          console.log("Error occured." + err)  //add toaster message
        }
        , () => {
          this.loader = false;

        });
  }
  uploadCompanyLogo(event: any) {
    const formData = new FormData();

    if (event.target.files[0].size > (300 * 1024)) {
      this.toastr.warning('Logo size should not exceed 200kb');
    } else {
      formData.append(event.target.files[0].name, event.target.files[0]);
      this.uploadPhoto(formData, true);

    }
  }

  uploadPhoto(formData: any, flag) {
    this.loader = true;
    this._ProfileService.updateProfilePicture(
      this._authService.UserProfiledetails.customer.id,
      this._authService.UserProfiledetails.customer.customerGuid,
      formData, flag).subscribe(res => {

        this._ProfileService.updatecompanyimageurl(res['uploadedurl']);
        this.toastr.success('Image uploaded successfully');
        //add toaster message
      },
        err => {
          this.loader = false;
          this.toastr.error('Error occured' + err);
          console.log("Error occured." + err)  //add toaster message
        }, () => { this.loader = false; });
  }

  removeImage(formData: any, flag) {
    if (this._authService.UserProfiledetails.customer.companyLogo == "../assets/images/sample.PNG") {
      this.toastr.error('No logo found');
      return;
    } else {
      this._authService.UserProfiledetails.customer.companyLogo = "../assets/images/sample.PNG";
    }
    //IsUserProfileLogoDelete  IsCompanyLogoDelete
    this.loader = true;
    this._authService.UserProfiledetails.UserProfileUpdateFlags = "{IsCompanyLogoDelete: 1 }";

    this._ProfileService.updateProfileInfo()
      .subscribe(res => {
        this.toastr.success('Removed uploaded image');
      },
        err => {
          this.loader = false;
          this.toastr.error('Error occured.' + err);
          //console.log("Error occured." + err)  //add toaster message
        }
        , () => {
          this.loader = false;
        });
  }


}
