import {Router} from '@angular/router';
import {Component, OnInit} from '@angular/core';
import {AuthService} from '../rest/service/auth.service';
import * as models from '../rest/model/models';

@Component({
	selector: 'app-landing',
	templateUrl: './landing.component.html',
	styleUrls: ['./landing.component.css']
})
export class LandingComponent implements OnInit {

	constructor(private router: Router, private authService: AuthService) {
	}

	ngOnInit() {
		let userObject = this.authService.currentUser;

		if (!userObject) {
			setTimeout(() => {
				userObject = this.authService.getItem('currentUser');
				if (!userObject) {
					//window.location.href = 'https://welcome.findable.co';
					window.location.href = window.location.origin + "/business/login";
					return;
				} else {
					this.authService.currentUser = userObject;
					this.authService.profile = this.authService.getItem('currentProfile');
					this.authService.rememberMe = this.authService.getItem('rememberMe');
					this.authService.isLoggedIn = true;
					this.authService.checkUserStatus(userObject);
				}
			}, 500);
		} else {
			this.authService.checkUserStatus(userObject);
		}
	}
}
