import { Component, OnInit, OnChanges, SimpleChanges, SimpleChange, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Response } from '@angular/http';
import { CustomValidators } from 'ng2-validation';
import { Subscription } from 'rxjs/Subscription';

// services:
import { DataService } from '../../../rest/service/data.service';
import { AuthService } from '../../../rest/service/auth.service';
import { AnalyticsService } from '../../../services/analytics.service';
import { GrowlService } from '../../../rest/service/growl.service';

// models:
import * as models from '../../../rest/model/models';

import { environment } from 'environments/environment';
import { AutoUnsubscribe } from '../../../utils/autoUnsubscribe';
import { FileUpload } from 'interjet-primeng/components/fileupload/fileupload';

declare let orientation, rotation;
declare let google: any;

@Component({
	selector: 'app-business-setup-form',
	templateUrl: './setup-form.component.html',
	styleUrls: ['./setup-form.component.css']
})
@AutoUnsubscribe()
export class BusinessSetupFormComponent implements OnInit {
  /** Reference to Logo input */
  @ViewChild('businessLogo') businessLogo;
  /** Refrence to Industry input */
  @ViewChild('industrySelector') industrySelector;
  /** Output on complete event emitter */
  @Output() onComplete = new EventEmitter();
  /** form mode @default {string} 'create' */
  @Input('mode') mode = 'create';

  @Input() businessRecord: models.BusinessRecord = {
		name: null,
		year_established: null,
		size: null,
		location: null,
		industry: null,
		duns: null,
		type: null,
		web_address: null,
		logo: null
	};

  public addressModel: models.PaymentObject = {
    address_line1: '',
    address_line2: '',
    address_zip: null,
  };

  public controls: Controls = {
		fields: {
      firstname: 'First Name',
      lastname: 'Last Name',
      phone: 'Phone Number',
      email: 'Email Address',
      name: 'Company Name',
      size: 'Company Size',
      industry: 'Industry',
			address_line1: 'Address Line 1',
			address_line2: 'Address Line 2',
			location: 'Location',
      address_zip: 'Zip Code',
      web_address: 'Web Address',
		},
		errors: {
			url: '{field} does not contain a valid url',
			required: '{field} field is required'
		},
		messages: {
      firstname: '',
      lastname: '',
      phone: '',
      email: '',
      name: '',
      size: '',
      industry: '',
			address_line1: '',
			address_line2: '',
      location: '',
      address_zip: '',
      web_address: '',
			global: '',
		}
	};

  public companySizes: CompanySizes[] = [
		{ value: 1, text: '1-5' },
		{ value: 5, text: '5-10' },
		{ value: 10, text: '10-50' },
		{ value: 50, text: '50-100' },
		{ value: 100, text: '100-500' },
		{ value: 500, text: '500-1000' },
		{ value: 1000, text: '1000-10000' },
		{ value: 10001, text: '10000+' },
  ];
  
  // Places API
  public autocomplete: google.maps.places.Autocomplete = null;

  // Auto complete variables
	public industries: models.DictionaryItem[];	
  public requestingIndustry: boolean = false;
  private industryDictionary$: Subscription;
  private industryDictionaryPost$: Subscription;

  private dictionaryIndexed: boolean = true;

  private apiKey = '';
  private business_id = null;
  
  public companySetupForm: FormGroup;
  public submitting: boolean = false;
  public submissionAccomplished: boolean = false;
  
  private businessPost$: Subscription;
	private businessPut$: Subscription;

  // Company Logo input variables:
  public uploader: FileUpload;
	public businessLogoPath: string = '';
	private businessLogoPathDefault: string = '';
  public UPLOAD_PATH: string = environment.baseApiPath + '/business/images';
  public uploadingImage: boolean = false;

  // used for setState method >>> this[key]
  private firstname: string = '';
  private lastname: string = '';
  private phone: string = '';
  private email: string = '';
  private name: string = '';
  private size: string = '';
  private industry: models.Industry = { id: null, name: null };
  private location: models.Location;
  private address_line1: string = '';
  private address_line2: string = '';
  private address_zip: string = '';
  private web_address: string = '';
  private logo: number = null;

  constructor(
    private dataService: DataService,
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private analyticsService: AnalyticsService,
  ) {
    this.apiKey = this.authService.currentUser.key;
    this.business_id = this.authService.currentUser.business_id;

    this.companySetupForm = this.formBuilder.group({
      firstname:     [ '', Validators.required ],
      lastname:      [ '', Validators.required ],
      phone:         [ '', Validators.required ],
      email:         [ '', [ Validators.required, Validators.pattern('.+\@.+\.+[a-zA-Z0-9]') ] ],
      name:          [ '', Validators.required ],
      size:          [ '', Validators.required ],
      industry:      [ '' ],
      address_line1: [ '' ],
      address_line2: [ '' ],
      location:      [ '', Validators.required ],
      address_zip:   [ '' ],
      web_address:   [ 'https://', [ Validators.required, CustomValidators.url ] ],
      logo:          [ null ],
    });
  }
  
  ngOnInit() {
    this.analyticsService.emitPageview('Business Setup');
    this.getPersonalDetails();
    let domLooker = setInterval(() => {
			if (!!document.getElementById('city')) {
				this.loadGmaps();
				clearInterval(domLooker);
			}
		}, 50);
  }

  /** Google Maps Autocomplete loader method
   * Initially used in ngOnInit if #city exists in document.
   * @private .
   * 
   * Triggered by a 20ms timeout. Google Maps finds #city in DOM and
   * adds a dom listener by same id and listens to every keydown.
   * A 'place_changed' listener is also added and binds func getAutoCompleteLocation.
   * @returns {void} void
   */
  private loadGmaps(): void {
		setTimeout(() => {
			this.autocomplete = new google.maps.places.Autocomplete((document.getElementById('city')), { types: ['(cities)'] });
			google.maps.event.addDomListener(document.getElementById('city'), 'keydown', function(event) {
				if (event.keyCode === 13) {
          // prevent enter and return keys
					event.preventDefault();
				}
			});
			this.autocomplete.addListener('place_changed', this.getAutoCompleteLocation.bind(this));
		}, 20);
	}

  /** Use loadGmaps to receive autocomplete place & fill
   * Class var companyLocation with location data.
   * @private .
   * 
   * Once the received location data has a geometry property,
   * loop over the address components and assign received data
   * to companyLocation properties.
   * @requires city_name
   * @requires country_name
   * @returns {void} void
   */
	private getAutoCompleteLocation(): void {
		let place = this.autocomplete.getPlace();
		if (!place.geometry) {
			return;
    }
    
		this.location = {
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
          this.location.country_name = place.address_components[i]['long_name'];
					this.location.country_short_name_alpha_2 = place.address_components[i]['short_name'];
					break;
				case 'locality':
          this.location.city_name = place.address_components[i]['long_name'];
					break;
				case 'postal_town':
          if (this.location.city_name === null) {
            this.location.city_name = place.address_components[i]['long_name'];
					}
					break;
				case 'administrative_area_level_1':
          this.location.state_name = place.address_components[i]['long_name'];
					this.location.state_short_name = place.address_components[i]['short_name'];
					break;
				case 'administrative_area_level_2':
					if (this.location.state_name === null) {
						this.location.state_name = place.address_components[i]['long_name'];
						this.location.state_short_name = place.address_components[i]['short_name'];
					}
					break;
			}
    }

    /** Display string for location input */
    let location = `${this.location.city_name}, `;
    location += this.location.state_short_name ? `${this.location.state_short_name}, ` : '';
    location += `${this.location.country_name}`;

    this.companySetupForm.patchValue({ location });
  }

  /** Parse location object for displayment
   * @private
   * @param {models.Location} location .
   * 
   * Receives a Location object and returns a location string.
   * @returns {string} Location of business
   */
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
  
  ngOnChanges(changes: SimpleChanges) {
		if (this.mode === 'update' && 'businessRecord' in changes) {
			if (changes['businessRecord'].currentValue.name !== null) {
				this.getBusinessDetails();
			}
		}
	}

  private getBusinessDetails() {
    const {
      name,
      size,
      industry,
      location,
      web_address,
      logo,
    } = this.businessRecord;

    this.industry = industry;
    this.location = location;

    if (logo) {
      this.businessLogoPath = this.businessRecord.logo.url || '';
    }
    
		this.companySetupForm.patchValue({
			name,
      size,
      industry: industry.name,
			address_line1: '',
			address_line2: '',
      location: this.parseLocation(location),
      address_zip: '',
      web_address,
      logo: logo.id,
    });

    // this.loadGmaps();
	}
  
  /** Get Personal Details used at Signup stage
   * @private .
   * 
   * Destructure and assign data to Class object userDetailsModel
   * & patchValues for companySetupForm.
   * @returns {void} void
   */
  private getPersonalDetails(): void {
		this.dataService.personal_details_get(this.authService.getUserId()).subscribe(
			({ firstname, lastname, phone, email }: models.PersonalDetails) => {
        this.companySetupForm.patchValue(<models.PersonalDetails>{
          firstname,
          lastname,
          phone,
          email
        });
			},
			error => {
				console.log('there was an error');
			}
		);
	}

  /** Validate form per property
   * @private
   * @param {string} key 
   * @param {string} error
   * @returns {boolean} boolean
   * 
   * @if error count is > 0 then returns false and validation fails.
   */
  private validate(key?: string, error?: string): boolean {
    let errCount = 0;
    if (key && error) {
			this.controls.messages[key] = error;
		} else {
      // Check if key was passed in
      if (!key) { // Key was not passed in
        for (let c in this.companySetupForm.controls) {
          // Loop over every property in form controls:
          if (this.companySetupForm.controls.hasOwnProperty(c) && !this.companySetupForm.controls[c].valid) {
            // property exists but is invalid
            for (let e in this.companySetupForm.controls[c].errors) {
              // loop over every error property of current controls property:
              if (this.companySetupForm.controls[c].errors.hasOwnProperty(e) &&  this.controls.errors.hasOwnProperty(e)) {
                // error property exists & Class object controls property errors has same property name

                // replace message by property name of form controls
                this.controls.messages[c] = this.controls.errors[e].replace('{field}', this.controls.fields[c]);
                errCount++;
                break;
              }
            }
          }
        }
      } else { // Key was passed in
        if (!this.companySetupForm.controls[key].valid) {
          // form controls property is invalid
          for (let e in this.companySetupForm.controls[key].errors) {
            // loop over every error property of current controls property:
            if (this.companySetupForm.controls[key].errors.hasOwnProperty(e) &&  this.controls.errors.hasOwnProperty(e)) {
              // error property exists & Class object controls property errors has same property name

              // replace message by property name of form controls
              this.controls.messages[key] = this.controls.errors[e].replace('{field}', this.controls.fields[key]);
              errCount++;
              break;
            }
          }
        } else { // form controls property is valid
          this.controls.messages[key] = '';
        }
      }

      return errCount === 0;
    }
	}

  /** Setting different models:
   * Models:
   *  userDetialsModel
   *  businessModel
   *  addressModel
   * @private
   * @param {string} key key in model
   * @param {any} value value to assign to model[key]
   * @returns {void} void
   */
  private setModel(key: string, value: any): void {
    if ((/firstname|lastname|phone|email|name|size|web_address|logo/).test(key)) {
      this.companySetupForm.patchValue({ [key]: value });
    } else
    if ((/address_line1|address_line2|zip_address/).test(key)) {
      this.addressModel[key] = value;
    } else
    if ((/industry/).test(key)) {
      this.companySetupForm.patchValue({ industry: value.name });
      this.industry = value;
    }
  }

  /** Set State on model & form properties
   * @public
   * @param {string} key property name on model obj to be changed 
   * @param {HTMLInputElement} event Input or Select
   * 
   * Receives prop name as key from an input or select DOM nodes.
   * IF value of node > 0 then mark the equivalent property on form controls. 
   * @returns {void} void
   */
  public setState(key: string, event): void {
		let t = (event.srcElement as HTMLInputElement) || (event.target as HTMLInputElement);
		let prop = {};

    prop[key] = '';
    if (this.validate(key)) {
      // key is valid
      if (t.value.length > 0) {
        // target is longer than 0, mark property on form as dirty

        if (key === 'industry') {
          this.companySetupForm.controls[key].markAsDirty();
          this[key] = { id: null, name: t.value };
        } else {
          this.companySetupForm.controls[key].markAsDirty();
          this[key] = t.value;
        }
      } else {
        // target is empty, reset property on form
        
        if (key === 'industry') {
          this.companySetupForm.patchValue(prop);    
          this[key] = { id: null, name: null };
        } else {
          this.companySetupForm.patchValue(prop);
          this[key] = null;
        }
      }
      
      this.setModel(key, this[key]);
    } else {
      return;
    }
  }
  
  /** Search Industry handler
   * @public
   * @param {Event} event receives an object with a query property
   * 
   * IF query is empty short circut.
   * Assign class var industry name property with query value.
   * Start input search spinner.
   * Subscribe to data service and GET industry dictionary.
   * Assign received dictionary to Class var industires & stop spinner.
   * @returns {void} void
   */
  public searchIndustry(event): void {
		// stop if length === 0
		if (!event.query.length) { return; }
		this.industry = {
			id: null,
			name: event.query
		};

		// start spinner:
		this.requestingIndustry = true;

		this.industryDictionary$ = this.dataService.dictionary_industry_get('industry', event.query).subscribe(
			(response: models.DictionaryItem[]) => {
				this.industries = response;
				// stop spinner:
				this.requestingIndustry = false;
			},
			error => {
				console.log('@setup-form > searchIndustry [ERROR]', error);
				this.requestingIndustry = false;
			}
		);
  }
  
  /** Industry input on select handler
   * @public
   * @param {Industry} industry industry object
   * 
   * Setting class var industry with selected industry object.
   * patching industry value on companySetupForm with name of industry.
   * Setting businessModel['industry'] with selected industry object.
   * @returns {void} void
   */
  public onSelectIndustry(industry: models.Industry): void {
    this.industry = industry;
		this.companySetupForm.patchValue({ industry: industry.name });
		this.setModel('industry', this.industry);
  }
  
  /** Company Logo file uploader input method
   * @public
   * @func onBeforeSend fires before sending the file
   * @param {Event} event
   * @returns {void} void
   */
  public onBeforeSend(event): void {
		event.xhr.setRequestHeader('X-API-KEY', this.apiKey);
  }
  
  /** Company Logo file uploader input method
   * @public
   * @func onSelect fires when option is selected
   * @param {Event} event 
   * @param {FileUpload} fileInput .
   * 
   * Getting the file input, assigning to this.uploader
   * and reassigning businessLogoPath in case is second try.
   * 
   * passing first file received from fileInput and callback to orientation.
   * assigning the base64 string to the businessLogo viewChild reference.
   * @returns {void} void
   */
  public onSelect(event: Event, fileInput: FileUpload): void {
		this.uploader = fileInput;
		this.businessLogoPath = '';

		orientation(this.uploader.files[0], (base64img, value) => {
			this.businessLogo.nativeElement.src = base64img
			let el = <HTMLElement>document.querySelector('.ui-fileupload-row img');

			if (value > 1) {
				this.businessLogo.nativeElement.style.maxHeight = '160px';
				this.businessLogo.nativeElement.style.transform = rotation[value];
				el.style.display = 'none';
			} else {
				this.businessLogo.nativeElement.style.maxHeight = '210px';
				this.businessLogo.nativeElement.style.transform = rotation[1];
				el.style.display = 'initial';
			}
    });
    
    this.uploader.upload();
    this.uploadingImage = true;
  }

  /** Company Logo file uploader input method
   * @public
   * @param {Event} event reference to xhr
   * 
   * Parse xhr response to JSON and send call method sendForm with image id argument.
   * @returns {void} void
   */
  public onUpload(event): void {
		let response = JSON.parse(event.xhr.response);
		let el = <HTMLElement>document.querySelector('.ui-fileupload-row img');
    el.style.display = 'none';
    this.setModel('logo', response.id);
		this.businessLogo.nativeElement.style.maxHeight = '210px';
		this.businessLogo.nativeElement.style.transform = rotation[1];
		el.style.display = 'initial';

    this.businessLogoPath = this.businessLogoPathDefault = response.path;
    this.uploadingImage = false;
	}
  
  /** Company Logo file uploader input method
   * @public
   * @func uploadError fires when an error occurs while file is uploading
   * @param {Event} event 
   * @returns {void} void
   */
  public uploadError(event): void {
		console.log(event);
  }
  
  /** Company Logo file uploader input method
   * @public
   * @func onClear fires once the file has been uploaded successfully
   * 
   * Assigns businessLogoPathDefault to businessLogoPath.
   * @returns {void} void
   */
  public onClear(): void {
    // this.businessLogoPath = this.businessLogoPathDefault;
  }

  /** Add New Industry to DB Dictionary
   * @private .
   * @if industry ID does not exist & dictionaryIndexed === true,
   * subscribe and send new input and receive response with new created ID.
   * @returns {void} void
   */
  private addNewIndustryToDictionary(): void {
    this.industryDictionaryPost$ = this.dataService.dictionary_industry_post(this.industry.name).subscribe(
      response => {
        this.submitting = false;
        this.industry.id = response.id;
        this.onSubmit(event);
      },
      error => {
        this.submitting = false;
        console.log('@setup-form > onSubmit industryDictionaryPost$ [ERROR]:', error);
        this.handleErrors(error);
      }
    );
  }

  /** Send Business Details to DB
   * @private .
   * 
   * Destructure companySetupForm values and assign them to businessModel equivalents.
   * Pass businessModel to bussiness_post & subscribe for response.
   * Assign response message to Localstorage currentUser business_id and update:
   *  - currentUser
   *  - currentBusiness
   * @returns {void} void
   */
  private sendBusinessDetails(business: models.Business, personalDetails:  models.PersonalDetails): void {
    // console.log('@setup-form > sendBusinessDetails business:', business);
    // console.log('@setup-form > sendBusinessDetails personalDetails:', personalDetails);
    this.businessPost$ = this.dataService.business_post(business).subscribe(
      response => {
        this.analyticsService.emitEvent('Company Information', 'Create', 'Desktop', this.authService.currentUser.user_id);
        // Updates Localstorage objects
        this.authService.currentUser.business_id = response.message;
        this.authService.update('currentUser', this.authService.currentUser);
        this.authService.update('currentBusiness', business);

        this.sendPersonalDetails(personalDetails);
      },
      error => {
        console.log('@company-info > onSubmit mode=create [ERROR]:', error);
        let _error = JSON.parse(error._body);
        for (let i in _error.message) {
          if (_error.message[i].field.indexOf('city_name') !== -1) {
            this.validate('location', 'Please manually enter and select a location.');
            GrowlService.message('If you are auto filling your form location field, please manually enter and select from the populated list.', 'error', 10 * 1000);
            this.companySetupForm.patchValue({ location: '' });
          } else {
            if (_error.message.hasOwnProperty(i)) {
              this.validate(_error.message[i].field, _error.message[i].error);
            }
          }
        }
        this.submitting = false;
        this.handleErrors(error);
      }
    );
  }

  private updateBusinessDetails(business: models.Business, personalDetails:  models.PersonalDetails): void {

    this.businessPut$ = this.dataService.business_put(this.business_id, business).subscribe(
      (response: Response) => {
        this.analyticsService.emitEvent('Company Information', 'Update', 'Desktop', this.authService.currentUser.user_id);
        this.submitting = false;
        
        this.sendPersonalDetails(personalDetails);
      },
      error => {
        this.submitting = false;
        this.handleErrors(error);
      }
    );
  }
  
  /** Send Form after submit button pressed
   * @private .
   * 
   * @returns {void} void
   */
  private sendPersonalDetails(personalDetails: models.PersonalDetails): void {
    // console.log('@setup-form > sendPersonalDetails personalDetails:', personalDetails);
    this.dataService.personal_details_put(this.authService.getUserId(), personalDetails).subscribe(
      (response: models.Success) => {
        this.analyticsService.emitEvent('Personal Details', 'Update', 'Desktop', this.authService.currentUser.user_id);
        if (response.status === true) {
          let el = <HTMLElement>document.querySelector('.ui-fileupload-row img');
          if (el !== null) {
            el.style.display = 'none';
          }

          // might not be noticeable - navigation to fast
          this.submissionAccomplished = true;
          this.submitting = false;
          if (this.mode === 'create') {
            this.onComplete.emit();
          } else if (this.mode === 'update') {
            setTimeout(() => this.submissionAccomplished = false, 3000);
            GrowlService.message('Successfully updated your company information', 'success');
          }
        }
      },
      error => {
        let _error = JSON.parse(error._body);
        for (let i in _error.message) {
          if (_error.message.hasOwnProperty(i)) {
            this.validate(_error.message[i].field, _error.message[i].error);
          }
        }

        this.submitting = false;
      }
    );
  }
  
  /** Check Website text validity
   * 
   * Make sure https:// prefix is set
   */
  public checkSiteText(event?) {
		let model = this.companySetupForm.get('web_address');

		if (model.value.indexOf('https://') < 0) {
			model.setValue('https://');
		}
  }

  /** Form submit handler
   * 
   * @param {Event} event reference to event
   * 
   * Prevent default & stop propogation.
   * Set Class var dictionaryIndexed to TRUE
   * 
   * IF func validate > 0 then all is valid & can continue.
   * If industry is !== to null then POST to data service industry dictionary.
   * 
   * Map & Assign companySetupForm values to appropriate businessModel props.
   * IF mode == 'create' then subscribe to POST business and send
   * businessModel to DB. Response needs to be update currentUser & currentBusiness
   * in LocalStorage.
   * 
   * Emit onComplete to trigger completeSetup on business-setup component.
   */
  public onSubmit(event: Event) {
		event.preventDefault();
    event.stopPropagation();

		this.dictionaryIndexed = true;

		if (this.validate()) {

			// Adding the company as a dictionary entity
			if (this.industry.name !== null) {
				if (this.industry.name.length > 0 && this.industry.id === null && this.dictionaryIndexed) {
					this.dictionaryIndexed = false;
					this.submitting = true;
          this.addNewIndustryToDictionary();
				}
      }
      
      const { firstname, lastname, phone, email, name, size, web_address, logo }: models.Business & models.PersonalDetails = this.companySetupForm.value;
      let location: models.Location = this.location;
      let industry: models.Industry = this.industry;
      let year_established = 2018;
      let business = { name, size, industry, location, web_address, logo, year_established };
      let personalDetails = { firstname, lastname, phone, email, location };
      if (this.mode === 'create') {
        this.submitting = true;
        this.sendBusinessDetails(business, personalDetails);
			} if (this.mode === 'update') {
        this.submitting = true;
				this.updateBusinessDetails(business, personalDetails);
      }
		}
  }
  
  private handleErrors(error) {
		let err_body = JSON.parse(error._body);
		if (error.status === 406) {
			for (let i = 0; i < err_body.message.length; i++) {
				this.controls.messages[err_body.message[i].field] = err_body.message[i]['error'];
			}
		}

		if (error.status === 403 || error.status === 400) {
			this.controls.messages.global = err_body.message;
			GrowlService.message(err_body.message, 'error');
		}
	}

}

export interface CompanySizes {
  value: number;
  text: string;
}

export interface Controls {
  fields: ControlFields;
  errors: ControlErrors;
  messages: any;
}

interface ControlFields {
  firstname:     string;
  lastname:      string;
  phone:         string;
  email:         string;
  name:          string;
  size:          string;
  industry:      string;
  address_line1: string;
  address_line2: string;
  location:      string;
  address_zip:   string;
  web_address:   string;
}

interface ControlErrors {
  url: string;
  required: string;
}

interface ControlMessages extends ControlFields {
  global: string;
}