import {Component, OnInit} from '@angular/core';
import {AuthService} from '../../rest/service/auth.service';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
	selector: 'signup-layout',
	templateUrl: 'layout.component.html',
	styleUrls: ['layout.component.css']
})
export class SignupLayoutComponent implements OnInit {

	title: string;
	description: string;
	router;
	redirectLink = '';
	userType = 'user';

	constructor(private _router: Router, public authService: AuthService) {
		this.router = _router;
		this.authService = authService;
	}

	ngOnInit() {
		this.checkTitleText(this.router.url);
	}

	checkTitleText(url) {
		if (url.indexOf('/user/login') >= 0) {
			this.title = 'User Sign In';
			this.description = 'Sign in with your email and password:';
		}
		if (url.indexOf('/user/signup') >= 0) {
			this.title = 'User Sign Up';
			this.description = 'Sign up with your email and password:';
			this.userType = 'user';
		}
		if (url.indexOf('/business/login') >= 0) {
			this.title = 'Business Sign In';
			this.description = 'Sign in with your email and password:';
		}
		if (url.indexOf('/business/signup') >= 0) {
			this.title = 'Business Sign Up';
			this.description = 'Sign up with your email and password:';
			this.userType = 'business';
		}
		if (url.indexOf('/recruiter/login') >= 0) {
			this.title = 'Recruiter Sign In';
			this.description = 'Sign in with your email and password:';
		}
		if (url.indexOf('/recruiter/signup') >= 0) {
			this.title = 'Recruiter Sign Up';
			this.description = 'Sign up with your email and password:';
			this.userType = 'recruiter';
		}
		if (url.indexOf('/user/signup/thank') >= 0) {
			this.title = 'Thank you for creating account';
			this.description = 'An email was sent to you with a link. <br>Please click on the link to start contacting applicants<br>';
		}
		if (url.indexOf('/verify') >= 0) {
			this.title = 'Email verification';
		}
		if (url.indexOf('/user/password/forgot') >= 0) {
			this.redirectLink = 'forgot';
			this.title = 'Forgot password';
			this.description = 'Please enter the e-mail address for <br> your account. A verification email <br> will be sent to you';
		}
		if (url.indexOf('/user/password/thank') >= 0) {
			this.title = 'Check your inbox';
			this.description = 'We send a verification email with a<br>link to change your password.';
		}
		if (url.indexOf('/reset') >= 0) {
			this.title = 'Change Password';
			this.description = 'Write your new password';
		}
	}

	clearAuthAndRedirect(e: Event) {
		e.preventDefault();
		this.authService.deleteItem();
		this.router.navigate(['/user/login']);
	}
}
