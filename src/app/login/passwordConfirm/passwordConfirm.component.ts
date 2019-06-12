import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';

// services:
import { DataService } from '../../rest/service/data.service';
import { AnalyticsService } from '../../services/analytics.service';

// models:
import { User } from '../../rest/model/User';

import { FormValidator } from '../../utils/formValidator';
import { environment } from '../../../environments/environment';

@Component({
	selector: 'app-password-confirm',
	templateUrl: 'passwordConfirm.component.html',
	styleUrls: ['passwordConfirm.component.css']
})
export class PasswordConfirmComponent implements OnInit {
	passwordConfirmFields: FormGroup;
	showLoader = false;
	response: boolean;
	token = '';
	formErrors = {
		global: ''
	}

	constructor(
		public router: Router,
		public dataService: DataService,
		public formBuilder: FormBuilder,
		public route: ActivatedRoute,
		public analyticsService: AnalyticsService,
	) {
		this.passwordConfirmFields = this.formBuilder.group({
			confirmPasswordGroup: this.formBuilder.group({
				newPassword: 		[ '', Validators.required ],
				repeatPassword: [ '', Validators.required ]
			}, { validator: FormValidator.passwordMatchValidator('newPassword', 'repeatPassword') }),

		});
	}

	ngOnInit() {
		this.route
			.queryParams
			.subscribe(params => {
				this.token = params['token'];
			});
	}

	passwordConfirm(passwordConfirmFields) {
		if (!this.token) {
			this.formErrors.global = 'Invalid verification token.';
			return;
		}

		this.showLoader = true;

		this.dataService.usersResetPost(this.token, passwordConfirmFields.controls.confirmPasswordGroup.controls.newPassword.value).subscribe(
			(response:any) => {
				this.analyticsService.emitEvent('Account', 'Password Reset', 'Desktop');
				// Hide loader
				this.showLoader = false;
				console.log(response);
				// Store current user, make him logged in
				sessionStorage.setItem('currentUser', JSON.stringify(response));
				// Notify the user of success
				this.formErrors.global = 'Password reset successfully';
				setTimeout(() => {
					// Redirect to dashboard after 3 seconds
					//this.router.navigateByUrl('/dashboard');
					if(response.role=='manager'){
						window.open(environment.baseUrl+'/search',"_self");
					}else{
						window.open(environment.baseUrl+'/dashboard',"_self");
					}
				}, 1500);
			},
			error => {
				this.showLoader = false;
				let errorBody = JSON.parse(error._body);
				if (typeof errorBody === 'string') {
					alert(errorBody);
				} else {
					this.formErrors.global = errorBody.message[0].error;
				}
			}
		);

	}

	resetErrors() {
		this.formErrors.global = '';
	}

	handleErrors(error) {

	}

	shouldDisplayRequired(path: Array<string>): boolean {
		return this.passwordConfirmFields.get(path).hasError('required') && this.passwordConfirmFields.get(path).touched;
	}

	passwordMatched() {
		return this.shouldCheckMatch(['confirmPasswordGroup'], 'mismatchedPasswords');
	}

	shouldCheckMatch(field: Array<string>, error: string): boolean {
		return this.passwordConfirmFields.get(field).hasError(error) && this.passwordConfirmFields.get(field).touched;
	}
}
