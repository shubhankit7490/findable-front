import {CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot} from '@angular/router';
import {Injectable} from '@angular/core';
import {AuthService} from '../rest/service/auth.service';

@Injectable()
export class AuthguardService implements CanActivate {

	constructor(private authService: AuthService, private router: Router) {
	}

	canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
		let url: string = state.url;

		return this.checkLogin(url);
	}

	checkLogin(url: string): boolean {
		if (this.authService.isLoggedIn) {
			return true;
		}

		this.authService.redirectUrl = url;

		this.router.navigate(['/user/login']);

		return false;
	}
}