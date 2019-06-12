import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {DataService} from '../../rest/service/data.service';
import {AnalyticsService} from '../../services/analytics.service';
import {Validators, FormBuilder, FormGroup} from '@angular/forms';
import {FormValidator} from '../../utils/formValidator';
import {User} from '../../rest/model/User';

@Component({
	selector: 'app-password-forgot',
	templateUrl: 'passwordForgot.component.html',
	styleUrls: ['passwordForgot.component.css']
})

export class PasswordForgotComponent implements OnInit {
	passwordForgotField: FormGroup;
	showLoader = false;
	response: boolean;
	formErrors = {
		email: ''
	}

	constructor(public router: Router, public dataService: DataService, public formBuilder: FormBuilder, public analyticsService: AnalyticsService) {
		this.passwordForgotField = this.formBuilder.group({
			email: ['', Validators.compose([Validators.required, FormValidator.validateEmail])]
		});
	}

	ngOnInit() {
		this.analyticsService.emitPageview('Forgot Password');
	}

	handleErrors(error) {
		let err_body = JSON.parse(error._body);
		if (error.status === 406) {
			for (let i = 0; i < err_body.message.length; i++) {
				this.formErrors[err_body.message[i].field] = err_body.message[i]['error'];
			}
		}

		if (error.status === 403 || error.status === 400) {
			this.formErrors['email'] = err_body.message;
		}
	}

	passwordForgot(passwordForgotField) {
		this.showLoader = true;

		this.formErrors = {
			email: ''
		}

		this.dataService.forgot(passwordForgotField.value.email).subscribe(
			response => {
				this.response = response.status;
				this.showLoader = false;

				if (this.response) {
					this.router.navigate(['/user/password/thank']);
				}
			},
			error => {
				this.handleErrors(error);

				this.showLoader = false;
			}
		);

	}

	shouldDisplayRequired(path: Array<string>): boolean {
		return this.passwordForgotField.get(path).hasError('required') && this.passwordForgotField.get(path).touched;
	}

	shouldDisplayEmailValidation(field: Array<string>, error: string): boolean {
		return this.passwordForgotField.get(field).hasError(error) && this.passwordForgotField.get(field).touched;
	}
}
