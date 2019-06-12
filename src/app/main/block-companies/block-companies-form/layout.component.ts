import { Component } from '@angular/core';
import { DataService } from '../../../rest/service/data.service';
import { AuthService } from '../../../rest/service/auth.service';
import { AnalyticsService } from '../../../services/analytics.service';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
	selector: 'block-companies-form',
	template: `
		<div class="col-xs-12 padding-remove">
			<div class="col-xs-12"><img src="./../../../../../assets/images/account_faq_contact.png"
										class="icon-center-faq"></div>
			<div class="col-xs-12 text-form-faq">Can't find what you're looking for?</div>
			<div class="col-xs-12 padding-remove">
				<form autocomplete="off" [formGroup]="faqForm" (ngSubmit)="sendMessage(faqForm.value)">
					<div class="form-group clearfix">
						<div class="col-xs-12">
							<input maxlength="50" type="string" class="form-control" id="subject" placeholder="Subject"
								   formControlName="subject" autocomplete="off" autocomplete="smartystreets">
							<span *ngIf="formErrors.subject" class="error"><i
									class="glyphicon glyphicon-remove border-radius"></i>{{formErrors.subject}}</span>
						</div>
					</div>
					<div class="form-group clearfix padding-remove">
						<div class="col-xs-12">
							<textarea maxlength="250" class="form-control form-textarea" id="message" placeholder="Your message"
									  formControlName="message" autocomplete="off"
									  autocomplete="smartystreets"></textarea>
							<span *ngIf="formErrors.message" class="error"><i
									class="glyphicon glyphicon-remove border-radius"></i>{{formErrors.message}}</span>
						</div>
					</div>
					<div class="form-group clearfix col-xs-12 pull-right display">
						<button type="submit" class="btn fnd-btn-primary fnd-btn-large position pull-right"
								[disabled]="!faqForm.valid || showLoader" (focus)="true">
							<span class="icon-faq" aria-hidden="true"></span>
							Send
						</button>
					</div>
					<div class="form-group clearfix col-xs-12 pull-right display error-container">
						<p class="error" id="login-error">{{formErrors.global}}</p>
						<div *ngIf="showLoader" class="load-page">
							<i class="glyphicon glyphicon-refresh glyphicon-refresh-animate loading-icon"></i>
						</div>
					</div>
				</form>
			</div>
		</div>
	`,
	styleUrls: [ './layout.component.css' ]

})
export class BlockCompaniesFormComponent {
	faqForm: FormGroup;
	showLoader = false;
	public formErrors: FormErrors = {
		subject: '',
		message: '',
		global: ''
	};

	constructor(public dataService: DataService,
				public authService: AuthService,
				public router: Router,
				public formBuilder: FormBuilder,
				public analyticsService: AnalyticsService) {

		this.dataService = dataService;
		this.authService = authService;
		this.analyticsService = analyticsService;
		this.faqForm = this.formBuilder.group({
			subject: ['', Validators.required],
			message: ['', Validators.required]

		});

		this.formErrors = {
			subject: '',
			message: '',
			global: ''
		};
	}

	shouldDisplayRequired(path: Array<string>): boolean {
		return this.faqForm.get(path).hasError('required') && this.faqForm.get(path).touched;
	}

	shouldDisplayEmailValidation(field: Array<string>, error: string): boolean {
		return this.faqForm.get(field).hasError(error) && this.faqForm.get(field).touched;
	}

	sendMessage(message: any) {
		event.preventDefault();
		this.formErrors = {
			subject: '',
			message: '',
			global: ''
		};
		this.showLoader = true;
		this.dataService.message_post(this.faqForm.value.subject, this.faqForm.value.message).subscribe(
			response => {
				this.analyticsService.emitEvent('Feedback', 'Help Message', 'Desktop', this.authService.currentUser.user_id);
				this.showLoader = false;
				this.formErrors[ 'global' ] = 'Message was sent!';
			},
			error => {
				this.showLoader = false;
				let err_body = JSON.parse(error._body);
				if (error.status === 406) {
					for (let i = 0; i < err_body.message.length; i++) {
						if (err_body.message[ i ].field === 'subject') {
							this.formErrors[ 'subject' ] = err_body.message[ i ][ 'error' ];
						}

						if (err_body.message[ i ].field === 'message') {
							this.formErrors[ 'message' ] = err_body.message[ i ][ 'error' ];
						}
					}
				}

				if (error.status === 403 || error.status === 404 || error.status === 400) {
					this.formErrors[ 'global' ] = err_body.message;
				}
			}
		);
	}
}

interface FormErrors {
	subject: string;
	message: string;
	global: string;
}
