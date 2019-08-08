import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

// services:
import { GrowlService } from '../../rest/service/growl.service';
import { DataService } from '../../rest/service/data.service';
import { AuthService } from '../../rest/service/auth.service';
import { ProviderService } from '../../services/provider.service';
import { AnalyticsService } from '../../services/analytics.service';

// models:
import * as models from '../../rest/model/models';

import { FormValidator } from '../../utils/formValidator';

@Component({
	selector: 'app-sign-up',
	templateUrl: 'signUp.component.html',
	styleUrls: ['signUp.component.css']
})
export class SignUpComponent implements OnInit {
	@ViewChild('agreeTerms') agreeTerms;
	@Input('userType') userType;
	public signUpFields: FormGroup;
	public showLoader: boolean = false;
	public inviteCode: string;
	public formErrors: FormErrors;
	public termsError: boolean = false;
	private response: models.User;
	public role: string;
	private businessId: number;

	constructor(
		public router: Router,
		public dataService: DataService,
		public authService: AuthService,
		public formBuilder: FormBuilder,
		public activatedRoute: ActivatedRoute,
		public analyticsService: AnalyticsService,
		public providerService: ProviderService
	) {
		this.formErrors = {
			fname: '',
			lname: '',
			email: '',
			password: '',
			global: '',
			terms: false,
		};

		this.signUpFields = this.formBuilder.group({
			email: ['', Validators.compose([Validators.required, FormValidator.validateEmail])],
			firstname: ['', Validators.required],
			lastname: ['', Validators.required],
			password: ['', Validators.required],
			terms: [false, Validators.required],
			invite: [''],
			role: ['']
		});
	}

	ngOnInit() {
		this.activatedRoute.queryParams.subscribe(
			params => {
				this.inviteCode = params['invite'] || null;
				this.businessId = params['businessId'] || null;
			},
			error => {
				console.log(error);
			}
		);

		if (this.activatedRoute.routeConfig.path.indexOf('business/signup') > -1) {
			this.role = 'manager';
		}else if(this.activatedRoute.routeConfig.path.indexOf('recruiter/signup') > -1) {
			this.role = 'recruiter';
		}
		else {
			this.role = (!!this.inviteCode) ? 'recruiter' : 'applicant';
		}

		this.analyticsService.emitPageview('Signup');
	}

	handleErrors(error) {
		let err_body = JSON.parse(error._body);
		if (error.status === 406) {
			for (let i = 0; i < err_body.message.length; i++) {
				GrowlService.message(err_body.message[i]['error'], 'error', 5000);
				this.formErrors[err_body.message[i].field] = err_body.message[i]['error'];
			}
		}

		if (error.status === 403 || error.status === 400) {
			GrowlService.message(err_body.message, 'error', 5000);
			this.formErrors['global'] = err_body.message;
		}
	}

	signUp(signUpForm) {
		this.formErrors = {
			fname: '',
			lname: '',
			email: '',
			password: '',
			global: ''
		};

		if (!signUpForm.value.terms) {
			this.formErrors['terms'] = true;
			this.showLoader = false;
		} else {
			this.showLoader = true;
			this.dataService.signup(signUpForm.value.firstname, signUpForm.value.lastname, signUpForm.value.email, signUpForm.value.password, this.role, this.inviteCode, this.businessId).subscribe(
				response => {
					this.analyticsService.emitEvent('Account', 'Signup', 'Desktop', this.authService.currentUser.user_id);
					this.providerService.getData();
					this.response = response;
					this.showLoader = false;
					if (this.response.user_id) {
						// TODO: Replace this hack with a currentUser object returned from /verify
						// request, to login the user automatically after signup and email verify.
						this.authService.update('currentUser', response);

						let r = JSON.parse(JSON.stringify(response));

						if (r.status === 'active') {
							this.authService.isLoggedIn = true;
							if (this.role === 'applicant') {
								this.router.navigate(['/dashboard'], { queryParams: { uploadResume: null } });
							} else {
								this.router.navigate(['/business/search']);
							}
						} else if (r.status === 'pending') {
							if (this.role === 'applicant') {
								// initial applicant signup will get in here when login routing kicks in
								this.authService.isLoggedIn = true;
								this.router.navigate(['/dashboard'], { queryParams: { uploadResume: null } });
							} else if( this.role === 'manager') {
								this.authService.isLoggedIn = true;
								this.router.navigate(['/business/setup']);
							} else {
								this.authService.isLoggedIn = true;
								this.router.navigate(['/business/setup']);
								//this.router.navigate(['user/signup/thank']);
							}
						} else if (r.status === 'banned') {
							this.formErrors.global = 'This account has been banned.';
						}
					}
				},
				error => {
					this.showLoader = false;
					this.handleErrors(error);
				}
			);
		}
	}

	validateField(e: Event, signUpForm) {
		if (!signUpForm.value.terms) {
			this.termsError = false;
		} else {
			this.termsError = true;
		}
	}

	shouldDisplayRequired(path: Array<string>) {
		if (this.signUpFields.get(path).hasError('required') && this.signUpFields.get(path).touched) {
			this.formErrors[path[0]] = path[0].charAt(0).toUpperCase() + path[0].slice(1).toLowerCase() + ' is required';
		} else {
			this.formErrors[path[0]] = '';
		}
	}

	shouldDisplayEmailValidation(field: Array<string>, error: string) {
		if (this.signUpFields.get(field).hasError(error) && this.signUpFields.get(field).touched) {
			this.formErrors['email'] = 'Email is invalid';
		} else {
			this.formErrors['email'] = '';
		}
	}

	toggleTermsAgreement(e) {
		let key = e.which || e.keyCode;

		if (key === 32) {
			let isAccepted = this.agreeTerms.nativeElement.checked;
			isAccepted = !isAccepted;
			this.signUpFields.patchValue({
				terms: isAccepted ? true : false
			});
			this.formErrors['terms'] = isAccepted;
			this.termsError = isAccepted;
		}
		if (key === 13) {
			this.signUp(this.signUpFields);
		}
	}

	onKeyDown(e) {
		let key = e.which || e.keyCode;

		if (key === 13) {
			this.signUp(this.signUpFields);
		}
	}
}

interface FormErrors {
	fname: string;
	lname: string;
	email: string;
	password: string;
	global: string;
	terms?: boolean;
}