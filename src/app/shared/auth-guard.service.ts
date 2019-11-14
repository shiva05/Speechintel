import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';

import { AuthorizationService } from '../shared/authorization.service';

@Injectable()
export class AuthGuardService {

  constructor( private _router: Router, private _authService: AuthorizationService) {}
  
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    this._authService.redirectUrl = state.url;
    if (!this._authService.isAuthenticated()) {
      this._authService.redirectUrl = state.url;
      this._router.navigate(['']);
      return false;
    } 
    return true;
  }

}
