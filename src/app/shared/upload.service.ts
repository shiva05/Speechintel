import { Injectable, NgZone } from '@angular/core';
import { Subject } from 'rxjs';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';
import { HttpRequest, HttpClient, HttpEventType, HttpResponse } from '@angular/common/http';
import { DataService } from './data.service';
import { environment } from '../../environments/environment';

@Injectable()
export class UploadService {
  fileData: any;
  fileDuration: number;
  totalFilesLength: number;
  fileCounter: number;

  fileuploadstatus = { uploadCompleted: false, uploading: false, percentDone: 0  };
  constructor(private _dataService: DataService, private _http: HttpClient, private _ngZone: NgZone, public toastr: ToastsManager) {
   // this.toastr.setRootViewContainerRef(vRef);
  }

  private trackFile = new Subject();
  trackFile$ = this.trackFile.asObservable();

  sendFileStatus(status) {
    this.trackFile.next(status);
  }
  updateflag(updatedvalue) {
    this._ngZone.run(() => {
      this.fileuploadstatus = updatedvalue;
    });
  }
  postFile(data, file, target) {
    this.fileuploadstatus = { uploadCompleted: false, uploading: true, percentDone: 0  };
         this.updateflag(this.fileuploadstatus);
         return this._dataService.dataServicePost(`${environment.transcription_Api}/api/file/${target}`, data)
      .subscribe(item => {
       
        this.fileData = item;
        const req = new HttpRequest('PUT', this.fileData.Url, file, {
          reportProgress: true,
        });
        this._http.request(req).subscribe((event) => {
          // Via this API, you get access to the raw event stream.
          // Look for upload progress events.
          if (event.type === HttpEventType.UploadProgress) {
            // This is an upload progress event. Compute and show the % done:
            this.fileuploadstatus.percentDone = Math.round(100 * event.loaded / event.total);
            this.updateflag(this.fileuploadstatus);
            if (this.fileuploadstatus.percentDone == 100) {
              setTimeout(() => {
                this.fileuploadstatus.uploadCompleted = true;
               // this.updateflag(this.fileuploadstatus);
                this.toastr.success('File Uploaded Successfully', null, { toastLife: 60000 });
              
              }, 2000);
            }
            // console.log(`File is ${this.percentDone}% uploaded.`);
          }
          //else if (event instanceof HttpResponse) {
          //  this._dataService.dataServicePut(`${environment.transcription_Api}/api/file/${this.fileData.Guid}/status/2`, '')
          //    .subscribe((data) => {
          //      this.fileCounter++;
          //      if (this.fileCounter === this.totalFilesLength) {

          //        this.updateflag(this.fileuploadstatus);
          //        this.sendFileStatus(true);
          //        this.fileuploadstatus = { uploadCompleted: false, uploading: false, percentDone: 0  };
          //        this.updateflag(this.fileuploadstatus);
          //        // sending status to clear the form if uploading is success.
          //      }
          //    }, err => {
          //      this.sendFileStatus(false);
          //    });
          //}
        }, err => {
          this.sendFileStatus(false);
        });
      },
      err => {
        if (err) {
         // console.log(err);
          this.toastr.error(err.error);
          this.sendFileStatus(false);
        }
      });
  }

}
