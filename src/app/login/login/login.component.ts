import { Validators, FormBuilder, FormGroup, Form } from '@angular/forms';
import { Component, OnInit, ViewChild, ElementRef,AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';

// services:
import { Company } from '../../rest/model/Company';
import { GrowlService } from '../../rest/service/growl.service';
import { AuthService } from '../../rest/service/auth.service';
import { DataService } from '../../rest/service/data.service';
import { ProviderService } from '../../services/provider.service';
import { AnalyticsService } from '../../services/analytics.service';


import { FormValidator } from '../../utils/formValidator';
import { stringify } from '@angular/core/src/facade/lang';

@Component({
	selector: 'app-login',
	templateUrl: 'login.component.html',
	styleUrls: ['login.component.css']
})
export class LoginComponent implements OnInit,AfterViewInit {
	public loginFields: FormGroup;
	public showLoader: boolean = false;
	public formErrors: FormErrors;
	public companies: Company[];
	public companiesVisible: boolean;
	private businessId: number;
	private message: string;
	public email: string;
	public password: string;
	public userStatus: string;

	@ViewChild('rememberCheckbox') rememberCheckbox: ElementRef;

	constructor(
		public router: Router,
		public authService: AuthService,
		public dataService: DataService,
		public formBuilder: FormBuilder,
		public route: ActivatedRoute,
		public analyticsService: AnalyticsService,
		public providerService: ProviderService,
	) {

		this.formErrors = {
			email: '',
			password: '',
			global: ''
		};

		this.loginFields = this.formBuilder.group({
			email: ['', Validators.compose([Validators.required, FormValidator.validateEmail])],
			password: ['', Validators.required],
			rememberMe: ['']
		});
		this.authService = authService;
		this.analyticsService = analyticsService;

		this.setMessage();
	}

	ngOnInit() {
		this.companies = [];

		this.analyticsService.emitPageview('Login');

		if (this.authService.isLoggedIn) {
			this.authService.checkUserStatus(this.authService.currentUser);
		}

		this.route.queryParams.subscribe(data => {
			if (data['businessId']) {
				this.businessId = data['businessId'];
			}
		});
		if(this.route.snapshot.params['id']){
			var str=atob(this.route.snapshot.params['id']);
			var result = str.split('_email_');
			this.email=result[0];
			this.password=result[1];
		}
	}
	ngAfterViewInit() {
		document.getElementById('login').click();
	}
	onCompanySelected(event) {
		this.analyticsService.emitEvent('Account', 'Company Selected', 'Desktop', this.authService.currentUser.user_id);
		this.companiesVisible = false;
		this.showLoader = true;
		this.authService.checkUserStatus(this.authService.currentUser);
	}

	setMessage() {
		this.message = 'Logged ' + (this.authService.isLoggedIn ? 'in' : 'out');
	}

	login(e: Event, loginForm) {
		e.preventDefault();

		this.formErrors = {
			email: '',
			password: '',
			global: ''
		};

		this.message = 'Trying to log in ...';
		this.showLoader = true;
		this.authService.login(loginForm.value.email, loginForm.value.password, loginForm.value.rememberMe, this.businessId).subscribe(
			response => {
			
				this.userStatus = stringify(response.status);
				if(this.userStatus == 'deleted'){
					this.formErrors['global'] = 'Your account was disabled ';
					this.showLoader = false;
				} else {
					this.analyticsService.emitEvent('Account', 'Login', 'Desktop', this.authService.currentUser.user_id);
					this.setMessage();
	
					this.authService.currentUser = response;
	
					this.authService.isLoggedIn = true;
					this.dataService.apiKey = response.key;
	
					this.providerService.getData();
	
					if (response.businesses.length === 1) {
						this.dataService.update_user_config(this.authService.currentUser.user_id, {active_business_id: response.businesses[0].id}).subscribe(
							response => {
								this.authService.checkUserStatus(response);
							}
						);
					} else if (response.businesses.length > 1) {
						this.companies = response.businesses;
						this.companiesVisible = true;
						this.showLoader = false;
					} else {
						this.authService.checkUserStatus(response);
					}
	
					if (this.businessId) {
						GrowlService.message('Job application applied successfully.', 'success');
					}
				}
			},
			error => {
				let err_body = JSON.parse(error._body);
				if (error.status === 406) {
					for (let i = 0; i < err_body.message.length; i++) {
						if (err_body.message[i].field === 'email') {
							this.formErrors['email'] = err_body.message[i]['error'];
						}
						if (err_body.message[i].field === 'password') {
							this.formErrors['password'] = err_body.message[i]['error'];
						}
					}
				}
				if (error.status === 403 || error.status === 404 || error.status === 400) {
					this.formErrors['global'] = err_body.message;
				}
				this.showLoader = false;
			}
		);
	}

	shouldDisplayRequired(path: Array<string>): any {
		if (this.loginFields.get(path).hasError('required') && this.loginFields.get(path).touched) {
			this.formErrors[path[0]] = path[0].charAt(0).toUpperCase() + path[0].slice(1).toLowerCase() + ' is required';
		} else {
			this.formErrors[path[0]] = '';
		}
	}

	shouldDisplayEmailValidation(field: Array<string>, error: string): any {
		if (this.loginFields.get(field).hasError(error) && this.loginFields.get(field).touched) {
			this.formErrors['email'] = 'Email is invalid';
		} else {
			this.formErrors['email'] = '';
		}
	}

	logout() {
		this.analyticsService.emitEvent('Account', 'Logout', 'Desktop', this.authService.currentUser.user_id);
		this.authService.logout();
		this.setMessage();
	}

	signup(event) {
		event.preventDefault();
		this.router.navigate(['signup']);
	}

	checkV(e) {
		let key = e.which || e.keyCode;

		if (key === 32) {
			this.rememberCheckbox.nativeElement.checked = !this.rememberCheckbox.nativeElement.checked;
		}
		if (key === 13) {
			this.login(e, this.loginFields);
		}
	}

	onKeyDown(e) {
		let key = e.which || e.keyCode;

		if (key === 13) {
			this.login(e, this.loginFields);
		}
	}

}

export interface FormErrors {
	email: string;
	password: string;
	global: string;
}
