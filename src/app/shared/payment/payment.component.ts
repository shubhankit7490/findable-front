import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Response } from '@angular/http';
import { Subscription } from 'rxjs';

// services:
import { DataService } from '../../rest/service/data.service';
import { AuthService } from '../../rest/service/auth.service';
import { AnalyticsService } from '../../services/analytics.service';
import { GrowlService } from '../../rest/service/growl.service';

// models:
import * as models from '../../rest/model/models';

import { environment } from 'environments/environment';
import { AutoUnsubscribe } from '../../utils/autoUnsubscribe';

declare let Stripe: stripe.StripeStatic;
declare let google: any;

@Component({
	selector: 'payment',
	templateUrl: './payment.component.html',
	styleUrls: ['./payment.component.css']
})
@AutoUnsubscribe()
export class PaymentComponent implements OnInit {
	@Input('mode') mode = 'create';
	@Input() token: string = '';
	@Input() package_id: number = null;
	@Input() payment: models.PaymentObject = {
		id: null,
		last4: null,
		exp_month: null,
		exp_year: null,
		name: null,
		billing_name: null,
		address_line1: null,
		address_line2: null,
		address_city: null,
		address_country: null,
		address_state: null,
		address_zip: null,
	};
	@Input() businessModel: models.Business = {
		name: '',
		year_established: 2017,
		size: null,
		location: null,
		industry: {
			id: null,
			name: null
		},
		duns: null,
		type: 1,
		web_address: null,
		logo: null
	};
	@Output() onComplete: EventEmitter<boolean> = new EventEmitter();
	@Output() onModelChange: EventEmitter<{ name: string; model: models.ModelPackage }> = new EventEmitter();
	@ViewChild('copmanyLocation') copmanyLocation: ElementRef;

	public paymentForm: FormGroup;
	public submitting: boolean = false;
	private paymentId: number = null;
	private stripe_token: models.StripeToken = {
		stripe_token: null,
		billing_name: null
	};

	// Error messaging object
	public controls: Controls = {
		fields: {
			fullname: 'Full Name',
			number: 'Credit Card Number',
			exp_datex: 'Expiration Date',
			cvv: 'CVV',
			name: 'Card Holder Name',
			address_line1: 'Adress line 1',
			address_line2: 'Adress line 2',
			location: 'Location',
			address_zip: 'Zip Code',
		},
		errors: {
			url: '{field} does not contain a valid url',
			required: '{field} field is required'
		},
		messages: {
			fullname: '',
			number: '',
			exp_datex: '',
			cvv: '',
			name: '',
			address_line1: '',
			address_line2: '',
			location: '',
			address_zip: '',
			global: '',
		}
	};

	private cloneCompanyDetails: boolean = true;
	public stripe: stripe.Stripe = null;
	public elements: stripe.elements.Elements = null;
	public definitions: Definitions = {
		classes: {
			base: 'form-control-container'
		},
		style: {
			base: {
				color: '#1e3d66',
				fontSize: '15px',
				fontSmoothing: 'antialiased',
				fontFamily: '"Roboto", arial'
			}
		}
	};

	private card: stripe.elements.Element;
	private cardExpiry: stripe.elements.Element;
	private cardCvc: stripe.elements.Element;

	private valid: boolean = false;
	private validFields: ValidFields = {
		location: true,
		number: false,
		exp_datex: true,
		cvv: false
	};

	private paymentGet$: Subscription;
	private paymentPut$: Subscription;
	private paymentPost$: Subscription;
	private historyGet$: Subscription;
	// Places API
	public autocomplete: google.maps.places.Autocomplete = null;

	constructor(
		private dataService: DataService,
		private authService: AuthService,
		private formBuilder: FormBuilder,
		private analyticsService: AnalyticsService,
	) {
		this.paymentForm = this.formBuilder.group({
			name:      		 [ '', Validators.required ],
			fullname:      [ { value: '', disabled: this.cloneCompanyDetails } ],
			address_line1: [ { value: '', disabled: this.cloneCompanyDetails } ],
			address_line2: [ { value: '', disabled: this.cloneCompanyDetails } ],
			location:    	 [ '' ],
			address_zip:   [ { value: '', disabled: this.cloneCompanyDetails } ],
		});
		this.stripe = Stripe(environment.stripeKey);
		this.elements = this.stripe.elements();
	}

	ngOnInit() {
		this.controls.messages = {
			fullname: '',
			number: '',
			exp_datex: '',
			cvv: '',
			name: '',
			address_line1: '',
			address_line2: '',
			location: '',
			address_zip: '',
			global: ''
		};

		this.submitting = false;

		if (!this.businessModel.name.length) {
			if (!!this.authService.getItem('currentBusiness')) {
				this.businessModel.location = this.authService.getItem('currentBusiness').location;
				this.businessModel.name = this.authService.getItem('currentBusiness').name;
			}
		}

		this.createElements();
		this.observeForm();

		this.analyticsService.emitPageview('Payment');

		if (this.mode === 'update') {
			if (this.payment.name === null) {
				this.getPayment(true);
			} else {
				this.populateValues();
			}
		} else if (this.mode === 'create') {
			this.paymentForm.patchValue({
				location: this.parseLocation(this.businessModel.location)
			});
		}
	}

	public loadGmaps(): void {
		setTimeout(() => {
			this.autocomplete = new google.maps.places.Autocomplete((document.getElementById('city')), {types: ['(cities)']});
			google.maps.event.addDomListener(document.getElementById('city'), 'keydown', function(event) {
				if (event.keyCode === 13) {
					// prevent Enter & Return events
					event.preventDefault();
				}
			});
			this.autocomplete.addListener('place_changed', this.getAutoCompleteLocation.bind(this));
		}, 20);
	}

	private getAutoCompleteLocation(): void {
		let place = this.autocomplete.getPlace();
		if (!place.geometry) {
			return;
		}

		this.businessModel.location = {
			continent_id: null,
			continent_name: null,
			city_id: null,
			city_name: null,
			state_id: null,
			state_name: null,
			state_short_name: null,
			country_id: null,
			country_name: null,
			country_short_name_alpha_2: null,
			country_short_name_alpha_3: null
		};

		for (let i = 0; i < place.address_components.length; i++) {
			let addressType = place.address_components[i].types[0];
			switch (addressType) {
				case 'country':
					this.businessModel.location.country_name = place.address_components[i]['long_name'];
					this.businessModel.location.country_short_name_alpha_2 = place.address_components[i]['short_name'];
					break;
				case 'locality':
					this.businessModel.location.city_name = place.address_components[i]['long_name'];
					break;
				case 'postal_town':
					if (this.businessModel.location.city_name === null) {
						this.businessModel.location.city_name = place.address_components[i]['long_name'];
					}
					break;
				case 'administrative_area_level_1':
					this.businessModel.location.state_name = place.address_components[i]['long_name'];
					this.businessModel.location.state_short_name = place.address_components[i]['short_name'];
					break;
				case 'administrative_area_level_2':
					if (this.businessModel.location.state_name === null) {
						this.businessModel.location.state_name = place.address_components[i]['long_name'];
						this.businessModel.location.state_short_name = place.address_components[i]['short_name'];
					}
					break;
			}
		}
	}

	/*
	 * validatex: A generic error validation function based on the mapping object (controls)
	 */
	public validate(key?: string, slient?: boolean): boolean {
		let __v = 0;
		if (!key) {
			for (let c in this.paymentForm.controls) {
				if (this.paymentForm.controls.hasOwnProperty(c) && !this.paymentForm.controls[c].valid) {
					for (let e in this.paymentForm.controls[c].errors) {
						if (this.paymentForm.controls[c].errors.hasOwnProperty(e) &&  this.controls.errors.hasOwnProperty(e)) {
							if (!slient) {
								this.controls.messages[c] = this.controls.errors[e].replace('{field}', this.controls.fields[c]);
							}
							__v++;
							break;
						}
					}
				} else {
					this.controls.messages[c] = '';
				}
			}
		} else {
			if (!this.paymentForm.controls[key].valid) {
				for (let e in this.paymentForm.controls[key].errors) {
					if (this.paymentForm.controls[key].errors.hasOwnProperty(e) &&  this.controls.errors.hasOwnProperty(e)) {
						if (!slient) {
							this.controls.messages[key] = this.controls.errors[e].replace('{field}', this.controls.fields[key]);
						}
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

	/*
	 * checkV: Handle changes in the checkbox component
	 */
	public checkV(e: KeyboardEvent): void {
		if (e.type === 'keyup') {
			let key = e.which || e.keyCode;
			if (key === 32) {
				this.copmanyLocation.nativeElement.checked = !this.copmanyLocation.nativeElement.checked;
				this.cloneCompanyDetails = (e.target as HTMLInputElement).checked;
			}
		} else if (e.type === 'change') {
			this.cloneCompanyDetails = (e.target as HTMLInputElement).checked;
		}

		if (this.cloneCompanyDetails) {
			this.setCompanyInfo();
		} else {
			this.clearCompanyInfo();
		}
	}
	
	private parseLocation(location: models.Location): string {
		let locationPartsArray = [];
		if (!!location.city_name && !!location.state_name && !!location.country_name) {
			// Show a city
			locationPartsArray = [
				location.city_name,
				location.state_short_name,
				location.country_short_name_alpha_2
			];
		} else if (!location.city_name && !!location.state_name && !!location.country_name) {
			// Show a state
			locationPartsArray = [
				location.state_name,
				location.country_short_name_alpha_2
			];
		} else if (!location.city_name && !location.state_name && !!location.country_name) {
			// Show a country
			locationPartsArray = [
				location.country_name
			];
		}
		return (locationPartsArray.length > 0) ? locationPartsArray.join(', ') : '';
	}

	/** On Submit handler
	 * @public .
	 * @param {Event} e used primarily to prevent default and stop propagation.
	 * 
	 * @if there are not stipe errors:
	 * Create a stripe_token and then process the charge.
	 * @returns {void} void
	 */
	public onSubmit(e: Event): void {
		e.preventDefault();
		e.stopPropagation();

		if (this.determineStripeErrors(false)) {
			// Add extra parameters to the card object
			let data = this.getStripeOptionalParameters();
			// Start spinner
			this.submitting = true;
			// Create a stripe token
			this.stripe.createToken(this.card, data).then(this.createTokenCallback);
		}
	}

	/** Callback for createToken method envoked on OnSubmit
	 * @private .
	 * No need of .bind(this) - arrow function allows access of outer `this`.
	 * @param {Object} result returned after token created
	 * @returns {void} void
	 */
	private createTokenCallback = (result: stripe.TokenResponse): void => {
		if (result.error as stripe.Error) {
			this.controls.messages.global = result.error.message;
			this.submitting = false;
		} else {
			this.token = result.token.id;
			let billingName = (this.cloneCompanyDetails) ? this.businessModel.name : this.paymentForm.controls['fullname'].value;
			if (this.mode === 'create') {
				this.paymentPost$ = this.dataService.credits_post(this.authService.currentUser.business_id, Number(this.package_id), this.token, billingName).subscribe(
					(response: Response) => {
						if (response.status) {
							this.analyticsService.emitEvent('Payment', 'Create', 'Desktop', this.authService.currentUser.user_id);
							GrowlService.message('Successfully updated your payment details', 'success');
							this.mode = 'update';
							this.submitting = false;
							this.getPayment(true);
						}
					},
					error => {
						GrowlService.message(error.message, 'error');
						this.controls.messages.global = error.message;
						this.submitting = false;
					}
				);
			} else if (this.mode === 'update') {
				this.stripe_token.stripe_token = this.token;
				this.stripe_token.billing_name = billingName;
				this.paymentPut$ = this.dataService.payments_put(this.authService.currentUser.business_id, this.paymentId, this.stripe_token).subscribe(
					(response: models.Success) => {
						if (response.status) {
							this.analyticsService.emitEvent('Payment', 'Update', 'Desktop', this.authService.currentUser.user_id);
							this.payment.name = this.paymentForm.controls['name'].value;
							this.payment.billing_name = this.paymentForm.controls['fullname'].value;
							this.payment.address_line1 = this.paymentForm.controls['address_line1'].value;
							this.payment.address_line2 = this.paymentForm.controls['address_line2'].value;
							this.payment.address_zip = this.paymentForm.controls['address_zip'].value;
							this.payment.address_city = this.businessModel.location.city_name;
							this.payment.address_country = this.businessModel.location.country_name;
							this.payment.address_state = this.businessModel.location.state_name || '';
							this.onModelChange.emit({ name: 'payment', model: this.payment });

							GrowlService.message('Successfully updated your payment details', 'success');
							this.submitting = false;
							this.onComplete.emit(true);
						}
					},
					error => {
						GrowlService.message(error.message, 'error');
						this.controls.messages.global = error.message;
						this.submitting = false;
					}
				);
			}
		}
	}

	/*
	 * setCompanyInfo: Enable and patch the value of the billing information's formControls
	 */
	private setCompanyInfo(): void {
		this.paymentForm.controls['fullname'].disable();
		this.paymentForm.controls['address_line1'].disable();
		this.paymentForm.controls['address_line2'].disable();
		this.paymentForm.controls['address_zip'].disable();

		this.validFields['location'] = true;
	}

	/*
	 * clearCompanyInfo: Disable and patch the value of the billing information's formControls
	 */
	private clearCompanyInfo(): void {
		if (this.mode === 'update') {
			this.paymentForm.patchValue({
				fullname: this.payment.billing_name,
				address_line1: this.payment.address_line1 || '',
				address_line2: this.payment.address_line2 || '',
				address_zip: this.payment.address_zip || '',
				location: this.parseLocation(this.businessModel.location)
			});
		} else {
			this.paymentForm.patchValue({
				fullname: this.businessModel.name,
				address_line1: '',
				address_line2: '',
				address_zip: '',
				location: this.parseLocation(this.businessModel.location)
			});
		}

		this.paymentForm.controls['fullname'].enable();
		this.paymentForm.controls['address_line1'].enable();
		this.paymentForm.controls['address_line2'].enable();
		this.paymentForm.controls['address_zip'].enable();
	}

	/*
	 * getReadableLocation: Convert a location model into a readable string
	 */
	private getReadableLocation(location: models.Location): string {
		let locationString = `${location.city_name} `;
		if (location.state_id !== null) {
			locationString += `${location.state_name} `;
		}
		locationString += location.country_short_name_alpha_2;
		return locationString;
	}

	/*
	 * getStripeOptionalParameters: Extract from the form / model the required parameter for the Stripe subscription
	 */
	private getStripeOptionalParameters(): models.StipeOptionalParameters {
		if (!this.cloneCompanyDetails) {
			return {
				name: this.paymentForm.controls['name'].value,
				address_line1: this.paymentForm.controls['address_line1'].value,
				address_line2: this.paymentForm.controls['address_line2'].value,
				address_city: this.businessModel.location.city_name,
				address_state: this.businessModel.location.state_name || '',
				address_country: this.businessModel.location.country_name,
				address_zip: this.paymentForm.controls['address_zip'].value,
				currency: 'usd'
			};
		} else {
			return {
				name: this.paymentForm.controls['name'].value,
				address_line1: '',
				address_line2: '',
				address_city: this.businessModel.location.city_name,
				address_state: this.businessModel.location.state_name || '',
				address_country: this.businessModel.location.country_name,
				address_zip: '',
				currency: 'usd'
			};
		}
	}

	/*
	 * createElements: Create the stripe elements and append them into the DOM
	 */
	private createElements(values: Object = null): void {
		this.card = this.elements.create('cardNumber', this.definitions);
		this.card.on('change', (event: stripe.elements.ElementChangeResponse) => {
			this.validFields.number = event.complete;
			if (!event.complete) {
				this.controls.messages.number = 'Invalid card number';
			} else {
				this.controls.messages.number = '';
			}

			if (event.complete) {
				this.valid = this.determineStripeErrors();
			} else {
				this.valid = false;
			}
		});
		this.card.mount('#card-element');

		this.cardExpiry = this.elements.create('cardExpiry', this.definitions);
		this.cardExpiry.on('change', (event: stripe.elements.ElementChangeResponse) => {
			this.validFields.exp_datex = event.complete;
			if (!event.complete) {
				this.controls.messages.exp_datex = 'Invalid expiration date';
			} else {
				this.controls.messages.exp_datex = '';
			}

			if (event.complete) {
				this.valid = this.determineStripeErrors();
			} else {
				this.valid = false;
			}
		});
		this.cardExpiry.mount('#cardExpiry-element');

		this.cardCvc = this.elements.create('cardCvc', this.definitions);
		this.cardCvc.on('change', (event: stripe.elements.ElementChangeResponse) => {
			this.validFields.cvv = event.complete;
			if (!event.complete) {
				this.controls.messages.cvv = 'Invalid CVC code';
			} else {
				this.controls.messages.cvv = '';
			}

			if (event.complete) {
				this.valid = this.determineStripeErrors();
			} else {
				this.valid = false;
			}
		});
		this.cardCvc.mount('#cardCvc-element');
	};

	/*
	 * determineStripeErrors: Look for errors in the stripe elements and in the FormGroup
	 */
	private determineStripeErrors(silent: boolean = true): boolean {
		let _e = 0;
		for (let _f in this.validFields) {
			if (this.validFields.hasOwnProperty(_f)) {
				if (!this.validFields[_f]) {
					_e++;
					break;
				}
			}
		}

		if (!_e) {
			if (!this.validate(null, silent)) {
				_e++;
			}
		}

		return _e === 0;
	}

	/*
	 * observeForm: Subscribe for changes in the FormGroup
	 */
	private observeForm(): void {
		this.paymentForm.valueChanges.subscribe(data => {
			if (!data.name.length) {
				this.valid = this.determineStripeErrors(false);
			} else {
				this.valid = this.determineStripeErrors();
			}

			this.payment.billing_name = data.fullname || this.payment.billing_name;
		});
	}

	/** Get Payment Data
	 * @private
	 * @param {boolean} populateValues will populate values if true
	 * 
	 * Envokes payment_get on data service with LocalStorage currentUser 
	 * property ID & subscribes for the response. The response is a PaymentObject object type.
	 * Assign the data to Class object payment and Emit Outupt model name and model Data for business-account component.
	 * @if true is passed in as an argument then populateValues with received Data.
	 * @returns {void} void
	 */
	private getPayment(populateValues: boolean = false): void {
		this.paymentGet$ = this.dataService.getPaymentsByBusinessId(this.authService.currentUser.business_id).subscribe(
			(response: models.PaymentObject) => {
				this.payment = response;
				this.onModelChange.emit({ name: 'payment', model: this.payment });
				if (populateValues) {
					this.populateValues();
				}
			},
			error => {
				if (error.status === 400) {
					// Business first time creating credit card
					let body = JSON.parse(error._body);
					// console.log('error', error);
					if (body.status === false && body.message === 'Invalid customer') {
						console.log('Payment returned 400 & Detected Invalid Customer...');
						console.log('Changing to create mode...');
						this.mode = 'create';
						let location = this.parseLocation(this.businessModel.location);
						this.paymentForm.patchValue({ location });
						this.getPurchasesHistory();
					}
				}
			}
		);
	}

	/** Get Credits By Business ID
	 * @private .
	 * 
	 * Envokes a GET credits request. Uses LocalStorage currentUser object property business_id
	 * & subscribes to response. Response property reload_package_id is assigned to Class var package_id.
	 * @returns {void} void
	 */
	private getPurchasesHistory(): void {
		this.historyGet$ = this.dataService.purchase_history_get(this.authService.currentUser.business_id, 1).subscribe(
			(response: models.BusinessPurchase[]) => {
				this.package_id = response[0].package.id;
			},
			error => {
				GrowlService.message(JSON.parse(error._body).message, 'error')
			}
		);
	}

	/*
	 * populateValues: Update the model and set the field values
	 */
	private populateValues(): void {
		let location: string = this.parseLocation(this.businessModel.location);

		const {
			id,
			name,
			billing_name: fullname,
			address_zip,
			address_line1,
			address_line2
		}: models.PaymentObject = this.payment;
		
		this.paymentId = id;
		
		this.stripe_token.billing_name = fullname;
		this.paymentForm.patchValue({
			name,
			fullname,
			location,
			address_zip,
			address_line1,
			address_line2,
		});
	}
}

export interface Controls {
	fields: 	ControlFields;
	errors: 	ControlErros;
	messages: ControlMessages;
}

interface ControlFields {
	fullname:  	   string;
	number: 	 	   string;
	exp_datex: 	   string;
	cvv: 			 	   string;
	name: 		 	   string;
	address_line1: string;
	address_line2: string;
	location:  	   string;
	address_zip:   string;
}

interface ControlErros {
	url: 			string;
	required: string;
}

interface ControlMessages extends ControlFields {
	global: string;
}

export interface Definitions {
	classes: DefClasses;
	style: DefStyle;
}

interface DefClasses {
 base: string;
}

interface DefStyle {
	base: DefStyleBase;
}

interface DefStyleBase {
	color: 			 	 string;
	fontSize: 		 string;
	lineHeight?: 	 string;
	fontSmoothing: string;
	fontFamily: 	 string;
}

export interface ValidFields {
	location:  boolean;
	number: 	 boolean;
	exp_datex: boolean;
	cvv: 			 boolean;
}
