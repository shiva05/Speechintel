import { Component, ElementRef, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ISubscription } from 'rxjs/Subscription';
import { UploadService } from '../../shared/upload.service';
import { FileSystemFileEntry } from 'ngx-file-drop';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';
import { AuthorizationService } from '../../shared/authorization.service';
import * as jwt_decode from 'jwt-decode';


@Component({
  selector: 'app-call-ingestion',
  templateUrl: './call-ingestion.component.html',
  styleUrls: ['./call-ingestion.component.css']
})
export class CallIngestionComponent implements OnInit {
  config: any;
  time: any;
  role: any;
  targetedBucket: any = [];
  customerLoggedIn: boolean = false;
  // minDate: any;
  // maxDate: any;
  @ViewChild('file') file: ElementRef;
  fileformatdata = { phoneNo: 0, customerAccountNo: '', agentname: '', calldate: '', program: '', title: '' };
  uploadForm: FormGroup;
  fileGuid: string;
  data: any;
  uploadedFilesList: any = [];
  idPattern = '^[a-zA-Z0-9._-]+$';
  fileStatusSubscription: ISubscription;

  constructor(public uploadService: UploadService, private _fb: FormBuilder,
    public toastr: ToastsManager, vRef: ViewContainerRef, public authService: AuthorizationService, ) {
    this.toastr.setRootViewContainerRef(vRef);
    let decod = jwt_decode(this.authService.getToken());
    this.authService.UserProfiledetails.role.name = decod['userRole'];
    this.role = this.authService.UserProfiledetails.role.name;

  }
  createForm() {
    this.uploadForm = this._fb.group({
      jobId: ['', [Validators.required, Validators.maxLength(60), Validators.pattern(this.idPattern)]],
      orderId: ['', [Validators.required, Validators.maxLength(60), Validators.pattern(this.idPattern)]],
      title: ['', [Validators.required, Validators.maxLength(60)]],
        deliveryDate: ['', [Validators.required]],
      customerId: ['', [Validators.required, Validators.maxLength(60), Validators.pattern(this.idPattern)]],
      instructions: ['', [Validators.maxLength(2000)]]
    });
  }
  ngOnInit() {
    // this.maxDate = new Date();
    this.createForm();
    let today: any = new Date();
    let dd: any = today.getDate();
    let mm: any = today.getMonth() + 1; //January is 0!
    let yyyy: any = today.getFullYear();
    if (dd < 10) {
      dd = '0' + dd
    }
    if (mm < 10) {
      mm = '0' + mm
    }
    this.targetedBucket = [];
    //this.minDate = new Date();

    if (this.role == 'Customer') {
      this.customerLoggedIn = true;
      let space = 'xx';
      this.uploadForm.controls['jobId'].setValue(space);
      this.uploadForm.controls['customerId'].setValue(space);
      this.uploadForm.controls['title'].setValue(space);
      this.uploadForm.controls['orderId'].setValue(space);
      this.uploadForm.controls['deliveryDate'].setValue(Date.now());
      this.uploadForm.controls['instructions'].setValue(space);
    }

    this.fileStatusSubscription = this.uploadService.trackFile$.subscribe(status => {
      if (status === true) {
         this.uploadForm.reset();
      }
      else {
       }
    },
      error => {
        this.toastr.error(error.message);
      });
    setTimeout(() => {
      if (this.authService.UserProfiledetails['defaultAPI'] === 'AWS') {
        this.targetedBucket.push('awsurl');
      } else {
        this.targetedBucket.push('url');
      }
    }, 3000);
    this.uploadedFilesList = [];
  }

  ngOnDestroy() {
    this.fileStatusSubscription.unsubscribe();
  }

  ondragstart() {
  }

  onDropHandler = function (object) {
    object.preventDefault();
  };

  slectedBucket(type) {
    if (this.targetedBucket.length == 0) {
      this.targetedBucket.push(type);
    } else {
      for (let i = 0; i < this.targetedBucket.length; i++) {
        if (type == this.targetedBucket[i]) {
          this.targetedBucket.splice(i, 1);
          return;
        }
      }
      this.targetedBucket.push(type);
    }
  
  }

  fileDetailsAssignmentfromFileUploaded() {
    let today: any = new Date();
    let dd: any = today.getDate();
    let mm: any = today.getMonth() + 1; //January is 0!
    let yyyy: any = today.getFullYear();
    if (dd < 10) {
      dd = '0' + dd
    }
    if (mm < 10) {
      mm = '0' + mm
    }
    today = mm + '-' + dd + '-' + yyyy;
    let customerId: any = this.authService.UserProfiledetails.customer.id + '';
    let guid = `${this.authService.UserProfiledetails.customer.id}_${this.authService.UserProfiledetails.id}_`;
    this.uploadForm.controls['jobId'].setValue(this.fileformatdata.title);
    this.uploadForm.controls['customerId'].setValue(customerId);
    this.uploadForm.controls['title'].setValue(this.fileformatdata.title);
       this.uploadForm.controls['orderId'].setValue(this.fileformatdata.title);
    this.uploadForm.controls['deliveryDate'].setValue(today);
    this.uploadForm.controls['instructions'].setValue(this.fileformatdata.title);

  }

  uploadFiles(event) {

    this.uploadedFilesList = [];
    if (event.target && event.target.files && event.target.files.length > 0) {
      if (event.target.files.length <= 15) {
        this.uploadService.totalFilesLength = 0;
        this.uploadService.fileCounter = 0;
        this.uploadService.totalFilesLength = event.target.files.length;
        for (let i = 0; i < event.target.files.length; i++) {
          if (event.target.files[i].type != 'audio/mp3' && event.target.files[i].type != 'audio/wav') {
            this.toastr.error('Please upload valid audio format only', null, { toastLife: 2000 });
            this.uploadService.totalFilesLength--;
            continue;
          }
          this.uploadedFilesList.push({
            'fileName': event.target.files[i].name
          });
          const audio = document.createElement('audio');
          audio.preload = 'metadata';
          const reader = new FileReader();
          const file = event.target.files[i];
          audio.src = URL.createObjectURL(file);
          reader.readAsDataURL(file);
          this.getDuration(audio, file);
        }
      }
      else {
        this.toastr.error('Max files upload limit exeded. you can upload 100 files at a time only.');
      }
    }
    else if (event.files.length > 0 && event.files) {
      if (event.files.length <= 15) {
        this.uploadService.totalFilesLength = 0;
        this.uploadService.fileCounter = 0;
        this.uploadService.totalFilesLength = event.files.length;
        for (let i = 0; i < event.files.length; i++) {
          const audio = document.createElement('audio');
          audio.preload = 'metadata';
          const fileEntry = event.files[i].fileEntry as FileSystemFileEntry;
          fileEntry.file((file: File) => {
            if (file.name.lastIndexOf(".") > 0) {
              this.uploadedFilesList.push({
                'fileName': file.name
              });
              const reader = new FileReader();
              audio.src = URL.createObjectURL(file);
              reader.readAsDataURL(file);
              this.getDuration(audio, file);
            }
            else {
              this.toastr.error('Please upload valid audio format only', null, { toastLife: 2000 });
              this.uploadService.totalFilesLength--;
            }
          });

        }
      }
      else {
        this.toastr.error('Max files upload limit exeded. you can upload 100 files at a time only.');
      };
    }

  }

  getDuration(audio, file) {
    let today: any = new Date();
    let dd: any = today.getDate();
    let mm: any = today.getMonth() + 1; //January is 0!
    let yyyy: any = today.getFullYear();
    if (dd < 10) {
      dd = '0' + dd
    }
    if (mm < 10) {
      mm = '0' + mm
    }
    today = mm + '-' + dd + '-' + yyyy;

    audio.ondurationchange = () => {
      this.data = {};
      this.uploadService.fileDuration = audio.duration;
      const t = Math.floor(this.uploadService.fileDuration);
      this.time =
        ('0' + Math.floor(t / 3600) % 24).slice(-2) + ':' + ('0' + Math.floor(t / 60) % 60).slice(-2) + ':' + ('0' + t % 60).slice(-2);
      const title = file.name.split('.')[0];
      const arr = file.name.split('_');
      if (this.customerLoggedIn) {
        this.data = {
          fileName: file.name,
          size: (file.size / 1000000),
          duration: this.uploadService.fileDuration,
          instruction: '',
          deliveryDate: today,
          jobId: '',
          orderId: '',
          title: '',
          program: '',
          customerID: this.authService.UserProfiledetails.customer.id + ''
        };
      } else {
        //today = this.uploadForm.controls['deliveryDate'].value;
        //let dd: any = today.getDate();
        //let mm: any = today.getMonth() + 1; //January is 0!
        //let yyyy: any = today.getFullYear();
        //if (dd < 10) {
        //  dd = '0' + dd
        //}
        //if (mm < 10) {
        //  mm = '0' + mm
        //}
        //today = mm + '-' + dd + '-' + yyyy;
        this.data = {
          fileName: file.name,
          size: (file.size / 1000000),
          duration: this.uploadService.fileDuration,
          instruction: this.uploadForm.controls['instructions'].value,
          deliveryDate: today,
       jobId: this.uploadForm.controls['jobId'].value,
          customerID: this.uploadForm.controls['customerId'].value,
          title: this.uploadForm.controls['title'].value,
          program: '',
          orderId: this.uploadForm.controls['orderId'].value
        }
      }
      if (this.targetedBucket.length == 0) {
        this.targetedBucket.push(this.authService.UserProfiledetails['defaultAPI']);
      }
      for (let t = 0; t < this.targetedBucket.length; t++) {
        this.uploadService.postFile(this.data, file, this.targetedBucket[t]);
      }
    };
  }
}
