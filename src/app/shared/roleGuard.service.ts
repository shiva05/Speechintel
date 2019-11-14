import {Injectable} from '@angular/core';
import {Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot} from '@angular/router';
import {AuthorizationService} from './authorization.service';


@Injectable()
export class RoleGuardService implements CanActivate {

  constructor(private _authService: AuthorizationService, private _router: Router) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {

    const role = localStorage.getItem('role');   
    if (this._authService.isAuthenticated()) {
      if (role === 'Editor') {
        this._router.navigate(['home']);
        return false;
      }
      return true;
    } else {
      this._authService.redirectUrl = state.url;
      this._router.navigate(['login']);
      return false;
    }
  }
}
