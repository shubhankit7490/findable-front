import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

// services:
import { DataService } from '../../../rest/service/data.service';
import { AuthService } from '../../../rest/service/auth.service';
import { AnalyticsService } from '../../../services/analytics.service';
import { GrowlService } from '../../../rest/service/growl.service';

// models:
import * as models from '../../../rest/model/models';

import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';
import { AutoUnsubscribe } from '../../../utils/autoUnsubscribe';

declare let moment: any;

@Component({
	selector: 'current-package',
	templateUrl: './current-package.component.html',
	styleUrls: ['./current-package.component.css']
})
@AutoUnsubscribe()
export class CurrentPackageComponent implements OnInit {
	private packageGet$: Subscription;
	private creditsGet$: Subscription;
	private creditsSet$: Subscription;
	private creditsPurchaseSet$: Subscription;
	public autoRenewEnabled: boolean = false;
	public packageMode: boolean = false;
	public confirmMode: boolean = false;
	public package_id: number = null;
	public packageIcon: string = '';
	public packageDescription: string = '';
	public switchColor: string = '#a1a5be';
	public submitting: boolean = false;
	public package: models.ModelPackage = {
		id: null,
		name: null,
		applicant_screening: null,
		initial_credits: null,
		cashback_percent: null,
		credits: null,
		price: null
	};

	@Input() credits: models.Credits = {
		left: 0,
		spent: 0,
		earned: 0,
		auto_reload: false,
		reload_package_id: null
	};
	@Input() packages: models.ModelPackage[] = [];
	@Output() onModelChange: EventEmitter<{ name: string; model: models.ModelPackage[] | models.Credits }> = new EventEmitter();
	@Output() onpackagePurchase: EventEmitter<{ package_id: number;}> = new EventEmitter();
	@ViewChild('PurchaseConfirmDialog') dialog: ConfirmDialogComponent;

	paymentSettingsFormGroup: FormGroup;

	// Error messaging object
	public controls: Controls = {
		fields: {
			name: 'Company name',
			established: 'Year established',
			location: 'Location',
			web: 'Web address'
		},
		errors: {
			url: '{field} does not contain a valid url',
			required: '{field} field is required'
		},
		messages: {
			name: '',
			established: '',
			location: '',
			web: '',
			global: ''
		}
	};

	private settings: models.CreditsSettings = {
		auto_reload: false,
		package_id: null
	};

	constructor(
		private router: Router,
		public dataService: DataService,
		public authService: AuthService,
		public formBuilder: FormBuilder,
		public analyticsService: AnalyticsService,
	) { }

	ngOnInit() {
		this.paymentSettingsFormGroup = this.formBuilder.group({
			autoRenewPackage: [ { value: '', disabled: !this.autoRenewEnabled } ]
		});

		if (!this.packages.length) {
			this.getPackages();
		}

		if (this.credits.reload_package_id === null) {
			this.getCredits();
		} else {
			this.parseCredits();
			this.onAutoRenewChange(this.credits.auto_reload);
		}

		this.analyticsService.emitPageview('Current Balance');
	}

	getPackages() {
		this.packageGet$ = this.dataService.packages_get().subscribe(
			(response: models.ModelPackage[]) => {
				this.packages = response['message'];
				this.onModelChange.emit({ name: 'packages', model: this.packages });
			},
			error => {
				console.log('error');
			}
		);
	}

	getCredits() {
		this.creditsGet$ = this.dataService.credits_get(this.authService.currentUser.business_id).subscribe(
			(response: models.Credits) => {
				this.credits = response;
				this.onModelChange.emit({ name: 'credits', model: this.credits });
				this.parseCredits();
				this.onAutoRenewChange(this.credits.auto_reload);
			},
			error => {
				console.log('error');
			}
		);
	}

	private parseCredits() {
		this.autoRenewEnabled = this.credits.auto_reload;
		this.paymentSettingsFormGroup.reset();
		this.paymentSettingsFormGroup.patchValue({
			autoRenewPackage: this.credits.reload_package_id
		});
	}

	onAutoRenewChange(checked: boolean) {
		checked ? this.paymentSettingsFormGroup.controls['autoRenewPackage'].enable() : this.paymentSettingsFormGroup.controls['autoRenewPackage'].disable();
		this.switchColor = checked ? '#3afbcf' : '#a1a5be';
		this.paymentSettingsFormGroup.controls['autoRenewPackage'].setValidators(checked ? [ Validators.required ] : null);
		this.paymentSettingsFormGroup.controls['autoRenewPackage'].validator = Validators.compose(checked ? [ Validators.required ] : null);
		this.paymentSettingsFormGroup.controls['autoRenewPackage'].updateValueAndValidity();
		this.autoRenewEnabled = checked;
	}

	onSubmit(e: Event) {
		e.preventDefault();
		e.stopPropagation();
		this.submitting = true;
		if (this.validate()) {
			this.credits.reload_package_id = this.paymentSettingsFormGroup.controls['autoRenewPackage'].value;
			this.credits.auto_reload = this.autoRenewEnabled;
			this.settings = {
				auto_reload: this.autoRenewEnabled,
				package_id: this.paymentSettingsFormGroup.controls['autoRenewPackage'].value
			};

			this.creditsSet$ = this.dataService.credits_put(this.authService.currentUser.business_id, this.settings).subscribe(
				response => {
					this.submitting = false;
					this.analyticsService.emitEvent('Current Balance', 'Update', 'Desktop', this.authService.currentUser.user_id);
					this.onModelChange.emit({ name: 'credits', model: this.credits });
					GrowlService.message('Successfully updated your payment configuration', 'success');
				},
				error => {
					this.submitting = false;
					GrowlService.message(JSON.parse(error._body).message, 'error');
				}
			);
		}
	}

	selectPackageMode(e: Event) {
		this.packageMode = true;
	}

	purchasePackage(event) {
		this.package_id = event;
		this.package = this.packages.filter((_package: models.ModelPackage) => _package.id === event)[0];

		if (this.package) {
			this.packageIcon = '/assets/images/' + this.package.name.split(' ')[0] + '.png';
			this.packageDescription = this.package.name + ' $' + this.package.price;
			this.confirmMode = true;
		} else {
			GrowlService.message('Please select one of the packages', 'error');
		}
	}

	closeDialog(event) {
		this.submitting = false;
		this.confirmMode = false;
	}

	confirmPurchase(event) {
		this.dialog.startSpinner();
		this.dialog.disableButtons();
		this.submitting = true;
		this.creditsPurchaseSet$ = this.dataService.credits_post(this.authService.currentUser.business_id, this.package_id).subscribe(
			response => {
				this.analyticsService.emitEvent('Current Balance', 'Purchase', 'Desktop', this.authService.currentUser.user_id);
				this.dialog.stopSpinner();
				this.dialog.enableButtons();
				this.confirmMode = false;
				this.packageMode = false;
				this.submitting = false;
				this.getCredits();

				setTimeout(() => {
					this.submitting = false;
					GrowlService.message('Successfully purchased the package', 'success');
				}, 500);
			},
			error => {
				// console.log('@current-package > confirmPurchase [ERROR]:', error);
				this.dialog.stopSpinner();
				this.dialog.enableButtons();
				let body = JSON.parse(error._body);
				if (typeof body.message === 'object') {
					if (body.message[0].field === 'stripe_token') {
						//GrowlService.message('You have not supplied a credit card.', 'error');
						setTimeout(() => {
							if(this.submitting) { // in case user presses cancel button at this stage
								GrowlService.message('Navigating to Payment...');
								setTimeout(() => {
									if(this.submitting) { // in case user presses cancel button at this stage
									//this.router.navigateByUrl('/business/account/payment');
									this.onpackagePurchase.emit({ package_id:this.package_id});
									} else {
										GrowlService.message('Navigation Aborted');
									}
								}, 1000);
							} else {
								GrowlService.message('Please fill in your Cradit Card Info at your Payment section for future purchases.');
							}
						}, 3500);
					}
				} else {
					this.submitting = false;
					GrowlService.message(body.message, 'error');
				}
			}
		);
	}

	validate(key?: string) {
		let __v = 0;
		if (!key) {
			for (let c in this.paymentSettingsFormGroup.controls) {
				if (this.paymentSettingsFormGroup.controls.hasOwnProperty(c) && !this.paymentSettingsFormGroup.controls[c].valid) {
					for (let e in this.paymentSettingsFormGroup.controls[c].errors) {
						if (this.paymentSettingsFormGroup.controls[c].errors.hasOwnProperty(e) && this.controls.errors.hasOwnProperty(e)) {
							this.controls.messages[c] = this.controls.errors[e].replace('{field}', this.controls.fields[c]);
							__v++;
							break;
						}
					}
				}
			}
		} else {
			if (!this.paymentSettingsFormGroup.controls[key].valid) {
				for (let e in this.paymentSettingsFormGroup.controls[key].errors) {
					if (this.paymentSettingsFormGroup.controls[key].errors.hasOwnProperty(e) && this.controls.errors.hasOwnProperty(e)) {
						this.controls.messages[key] = this.controls.errors[e].replace('{field}', this.controls.fields[key]);
						__v++;
						break;
					}
				}
			} else {
				this.controls.messages[key] = '';
			}
		}

		return __v === 0;
	}
}

export interface Controls {
	fields: 	ControlFields;
	errors: 	ControlErros;
	messages: ControlMessages;
}

interface ControlFields {
	name:  	  	 string;
	established: string;
	location:  	 string;
	web:   			 string;
}

interface ControlErros {
	url: 			string;
	required: string;
}

interface ControlMessages extends ControlFields {
	global: string;
}
