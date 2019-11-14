import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable()
export class SideNavService {

  constructor(private http: HttpClient) { }

  getComponentPermissions(Email, PageId) {
    return this.http.get(`${environment.user_Api}/api/user/UserFeature/${Email}/${PageId}` );
    }
}
