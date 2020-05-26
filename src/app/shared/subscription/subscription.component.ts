import {
  Component,
  OnInit,
  AfterViewInit,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef
} from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Response } from "@angular/http";
import { Subscription } from "rxjs";

// services:
import { DataService } from "../../rest/service/data.service";
import { AuthService } from "../../rest/service/auth.service";
import { AnalyticsService } from "../../services/analytics.service";
import { GrowlService } from "../../rest/service/growl.service";

// models:
import * as models from "../../rest/model/models";

import { environment } from "environments/environment";
import { AutoUnsubscribe } from "../../utils/autoUnsubscribe";

declare let Stripe: stripe.StripeStatic;
declare let google: any;

@Component({
  selector: "subscriptionComp",
  templateUrl: "./subscription.component.html",
  styleUrls: ["./subscription.component.css"]
})
@AutoUnsubscribe()
export class SubscriptionComponent implements OnInit {
  @ViewChild("userLocation") userLocation: ElementRef;
  @Input("modeStatus") modeStatus = "create";
  @Input("modeltype") modeltype = 1;
  @Output() subscribed = new EventEmitter<boolean>();

  public payment: models.PaymentObject = {
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
    address_zip: null
	};
	
	public  userModel: models.UserInfo = {
		fullname: '',
		location: null
	};
  public submitting: boolean = false;
  public cloneUserDetails: boolean = true;

  public subscriptionForm: FormGroup;

  // Error messaging object
  public controls: Controls = {
    fields: {
      fullname: "Full Name",
      number: "Credit Card Number",
      exp_datex: "Expiration Date",
      cvv: "CVV",
      name: "Card Holder Name",
      address_line1: "Adress line 1",
      address_line2: "Adress line 2",
      location: "Location",
      address_zip: "Zip Code"
    },
    errors: {
      url: "{field} does not contain a valid url",
      required: "{field} field is required"
    },
    messages: {
      fullname: "",
      number: "",
      exp_datex: "",
      cvv: "",
      name: "",
      address_line1: "",
      address_line2: "",
      location: "",
      address_zip: "",
      global: ""
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

	private token: string = '';
  public stripe: stripe.Stripe = null;
  public elements: stripe.elements.Elements = null;
  public definitions: Definitions = {
    classes: {
      base: "form-control-container"
    },
    style: {
      base: {
        color: "#1e3d66",
        fontSize: "15px",
        fontSmoothing: "antialiased",
        fontFamily: '"Roboto", arial'
      }
    }
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
    private analyticsService: AnalyticsService
  ) {
    this.subscriptionForm = this.formBuilder.group({
      name: ["", Validators.required],
      fullname: [{ value: "", disabled: this.cloneUserDetails }],
      address_line1: [{ value: "", disabled: this.cloneUserDetails }],
      address_line2: [{ value: "", disabled: this.cloneUserDetails }],
      location: [""],
      address_zip: [{ value: "", disabled: this.cloneUserDetails }]
    });

    this.stripe = Stripe(environment.stripeKey);
    this.elements = this.stripe.elements();
  }

  ngOnInit() {
    this.controls.messages = {
      fullname: "",
      number: "",
      exp_datex: "",
      cvv: "",
      name: "",
      address_line1: "",
      address_line2: "",
      location: "",
      address_zip: "",
      global: ""
		};
    console.log(this.authService.getItem('currentProfile'));
		if (!this.userModel.fullname.length) {
			if (!!this.authService.getItem('currentProfile')) {
				this.userModel.location = this.authService.getItem('currentProfile').location;
				this.userModel.fullname = this.authService.getItem('currentProfile').firstname + ' ' + this.authService.getItem('currentProfile').lastname; 
			}
		}
		//this.loadGmaps();

    
    this.observeForm();

    this.analyticsService.emitPageview("Subscription");

    if (this.modeStatus === "create") {
      this.subscriptionForm.patchValue({
        location: this.parseLocation(this.authService.getItem("currentProfile").location)
      });
    }
    
    console.log("Subscription init");
  }
  ngAfterViewInit() {
    this.createElements();
  }


  private createElements(values: Object = null): void {
    this.card = this.elements.create("cardNumber", this.definitions);
    this.card.on("change", (event: stripe.elements.ElementChangeResponse) => {
      this.validFields.number = event.complete;
      if (!event.complete) {
        this.controls.messages.number = "Invalid card number";
      } else {
        this.controls.messages.number = "";
      }

      if (event.complete) {
        this.valid = this.determineStripeErrors();
      } else {
        this.valid = false;
      }
    });
    this.card.mount("#card-element"+this.modeltype);

    this.cardExpiry = this.elements.create("cardExpiry", this.definitions);
    this.cardExpiry.on(
      "change",
      (event: stripe.elements.ElementChangeResponse) => {
        this.validFields.exp_datex = event.complete;
        if (!event.complete) {
          this.controls.messages.exp_datex = "Invalid expiration date";
        } else {
          this.controls.messages.exp_datex = "";
        }

        if (event.complete) {
          this.valid = this.determineStripeErrors();
        } else {
          this.valid = false;
        }
      }
    );
    this.cardExpiry.mount("#cardExpiry-element"+this.modeltype);

    this.cardCvc = this.elements.create("cardCvc", this.definitions);
    this.cardCvc.on(
      "change",
      (event: stripe.elements.ElementChangeResponse) => {
        this.validFields.cvv = event.complete;
        if (!event.complete) {
          this.controls.messages.cvv = "Invalid CVC code";
        } else {
          this.controls.messages.cvv = "";
        }

        if (event.complete) {
          this.valid = this.determineStripeErrors();
        } else {
          this.valid = false;
        }
      }
    );
    this.cardCvc.mount("#cardCvc-element"+this.modeltype);
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
			let billingName = (this.cloneUserDetails) ? this.userModel.fullname : this.subscriptionForm.controls['fullname'].value;
			console.log(result);
			
			if (this.modeStatus === 'create') {
				this.paymentPost$ = this.dataService.subscription_post(this.authService.currentUser.user_id, this.token, billingName).subscribe(
					(response: Response) => {
						if (response.status) {
							this.analyticsService.emitEvent('Subscription', 'Create', 'Desktop', this.authService.currentUser.user_id);
							GrowlService.message('Successfully created your subscription', 'success');
              this.submitting = false;
              this.subscribed.emit(true);
              console.log(response);
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
	 * getStripeOptionalParameters: Extract from the form / model the required parameter for the Stripe subscription
	 */
   // 10/jan2018 remove location from subscrption for this comment location in html,commnet content in getStripeOptionalParameters function
   // comment loadGmaps function and body.
	private getStripeOptionalParameters(): models.StipeOptionalParameters {
		if (!this.cloneUserDetails) {
			return {
				name: this.subscriptionForm.controls['name'].value,
				address_line1: this.subscriptionForm.controls['address_line1'].value,
				address_line2: this.subscriptionForm.controls['address_line2'].value,
				address_city: '',//this.userModel.location.city_name,
				address_state:'',// this.userModel.location.state_name || '',
				address_country:'',// this.userModel.location.country_name,
				address_zip: this.subscriptionForm.controls['address_zip'].value,
				currency: 'usd'
			};
		} else {
			return {
				name: this.subscriptionForm.controls['name'].value,
				address_line1: '',
				address_line2: '',
				address_city: this.userModel.location.city_name || '', 
				address_state: this.userModel.location.state_name || '',
				address_country: this.userModel.location.country_name || '',
				address_zip: '',
				currency: 'usd'
			};
		}
	}

  private observeForm(): void {
    this.subscriptionForm.valueChanges.subscribe(data => {
      if (!data.name.length) {
        this.valid = this.determineStripeErrors(false);
      } else {
        this.valid = this.determineStripeErrors();
      }

      this.payment.billing_name = data.fullname || this.payment.billing_name;
    });
  }

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
   * validatex: A generic error validation function based on the mapping object (controls)
   */
  public validate(key?: string, slient?: boolean): boolean {
    let __v = 0;
    if (!key) {
      for (let c in this.subscriptionForm.controls) {
        if (
          this.subscriptionForm.controls.hasOwnProperty(c) &&
          !this.subscriptionForm.controls[c].valid
        ) {
          for (let e in this.subscriptionForm.controls[c].errors) {
            if (
              this.subscriptionForm.controls[c].errors.hasOwnProperty(e) &&
              this.controls.errors.hasOwnProperty(e)
            ) {
              if (!slient) {
                this.controls.messages[c] = this.controls.errors[e].replace(
                  "{field}",
                  this.controls.fields[c]
                );
              }
              __v++;
              break;
            }
          }
        } else {
          this.controls.messages[c] = "";
        }
      }
    } else {
      if (!this.subscriptionForm.controls[key].valid) {
        for (let e in this.subscriptionForm.controls[key].errors) {
          if (
            this.subscriptionForm.controls[key].errors.hasOwnProperty(e) &&
            this.controls.errors.hasOwnProperty(e)
          ) {
            if (!slient) {
              this.controls.messages[key] = this.controls.errors[e].replace(
                "{field}",
                this.controls.fields[key]
              );
            }
            __v++;
            break;
          }
        }
      } else {
        this.controls.messages[key] = "";
      }
    }

    return __v === 0;
  }

	/*
   * checkV: Handle changes in the checkbox component
   */
  public checkV(e: KeyboardEvent): void {
    if (e.type === "keyup") {
      let key = e.which || e.keyCode;
      if (key === 32) {
        this.userLocation.nativeElement.checked = !this.userLocation
          .nativeElement.checked;
        this.cloneUserDetails = (e.target as HTMLInputElement).checked;
      }
    } else if (e.type === "change") {
      this.cloneUserDetails = (e.target as HTMLInputElement).checked;
    }

    if (this.cloneUserDetails) {
      this.setUserInfo();
    } else {
      this.clearUserInfo();
    }
	}

  private parseLocation(location: models.Location): string {
    console.log(location);
    let locationPartsArray = [];
    if (
      !!location.city_name &&
      !!location.state_name &&
      !!location.country_name
    ) {
      // Show a city
      locationPartsArray = [
        location.city_name,
        location.state_short_name,
        location.country_short_name_alpha_2
      ];
    } else if (
      !location.city_name &&
      !!location.state_name &&
      !!location.country_name
    ) {
      // Show a state
      locationPartsArray = [
        location.state_name,
        location.country_short_name_alpha_2
      ];
    } else if (
      !location.city_name &&
      !location.state_name &&
      !!location.country_name
    ) {
      // Show a country
      locationPartsArray = [location.country_name];
    }
    return locationPartsArray.length > 0 ? locationPartsArray.join(", ") : "";
	}

  private setUserInfo(): void {
    this.subscriptionForm.controls["fullname"].disable();
    this.subscriptionForm.controls["address_line1"].disable();
    this.subscriptionForm.controls["address_line2"].disable();
    this.subscriptionForm.controls["address_zip"].disable();

    this.validFields["location"] = true;
  }

  /*
   * clearCompanyInfo: Disable and patch the value of the billing information's formControls
   */
  private clearUserInfo(): void {
    if (this.modeStatus === "create") {
      this.subscriptionForm.patchValue({
        fullname: this.userModel.fullname,
        address_line1: "",
        address_line2: "",
        address_zip: "",
        location: this.parseLocation(this.userModel.location)
      });

      this.subscriptionForm.controls["fullname"].enable();
      this.subscriptionForm.controls["address_line1"].enable();
      this.subscriptionForm.controls["address_line2"].enable();
      this.subscriptionForm.controls["address_zip"].enable();
    }
	}
	

/*	public loadGmaps(): void {
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
	}*/

	private getAutoCompleteLocation(): void {
		let place = this.autocomplete.getPlace();
		if (!place.geometry) {
			return;
		}

		this.userModel.location = {
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
					this.userModel.location.country_name = place.address_components[i]['long_name'];
					this.userModel.location.country_short_name_alpha_2 = place.address_components[i]['short_name'];
					break;
				case 'locality':
					this.userModel.location.city_name = place.address_components[i]['long_name'];
					break;
				case 'postal_town':
					if (this.userModel.location.city_name === null) {
						this.userModel.location.city_name = place.address_components[i]['long_name'];
					}
					break;
				case 'administrative_area_level_1':
					this.userModel.location.state_name = place.address_components[i]['long_name'];
					this.userModel.location.state_short_name = place.address_components[i]['short_name'];
					break;
				case 'administrative_area_level_2':
					if (this.userModel.location.state_name === null) {
						this.userModel.location.state_name = place.address_components[i]['long_name'];
						this.userModel.location.state_short_name = place.address_components[i]['short_name'];
					}
					break;
			}
		}
	}
}

export interface Controls {
  fields: ControlFields;
  errors: ControlErros;
  messages: ControlMessages;
}

interface ControlFields {
  fullname: string;
  number: string;
  exp_datex: string;
  cvv: string;
  name: string;
  address_line1: string;
  address_line2: string;
  location: string;
  address_zip: string;
}

interface ControlErros {
  url: string;
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
  color: string;
  fontSize: string;
  lineHeight?: string;
  fontSmoothing: string;
  fontFamily: string;
}

export interface ValidFields {
  location: boolean;
  number: boolean;
  exp_datex: boolean;
  cvv: boolean;
}
