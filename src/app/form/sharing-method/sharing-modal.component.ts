import { Component, OnInit,ViewChild,Output,EventEmitter,Input,OnChanges,SimpleChanges} from '@angular/core';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';

// service:
import { DataService } from '../../rest/service/data.service';
import { AuthService } from '../../rest/service/auth.service';
import { AnalyticsService } from '../../services/analytics.service';
// models:
import { Log } from '../../rest/model/Log';

import { environment } from 'environments/environment';

@Component({
	selector: 'app-sharing-modal',
	templateUrl: './sharing-modal.component.html',
	styleUrls: ['./sharing-modal.component.css']
})
export class SharingModalComponent implements OnInit {
	public formErrors: FormErrors = {
		message: { error: '', name: 'Message' },
		subject: { error: '', name: 'Subject' },
		to:      { error: '', name: 'Email' }
	};
	@Output() openpaymentModel = new EventEmitter();
	@Input() blockingInfoMode :string;
	public sharingFields: FormGroup;
	public globalError = '';
	public userId = null;
	public valid = true;
	public repoUrl:any = '';
	private shareUrl = '';
	private shareParams: ShareParams;
	public subscription: boolean=false;
	showLoader = false;
	log: Log = {
		category: 'profile_share',
		action: null,
		params: null
	};

	constructor(public authService: AuthService, public dataService: DataService, public formBuilder: FormBuilder, public analyticsService: AnalyticsService) {
		this.sharingFields = this.formBuilder.group({
			to:     ['', [Validators.required, Validators.pattern('.+\@.+\.+[a-zA-Z0-9]')]],
			subject: ['', Validators.required],
			message: ['']
		});
		this.authService = authService;
		this.dataService = dataService;
		this.analyticsService = analyticsService;
		this.userId = this.authService.getUserId();
		this.repoUrl = environment.baseUrl + '/user/' + btoa(this.userId);
		// create tiny  url to share by user (tiny url currently not used as per requirment)
		 /*this.dataService.ConvertTinyurl(this.userId).subscribe(
			(response:any) => {
				if(response.status){
					this.repoUrl=response.url;
				}
			}
		);*/
	}

	ngOnInit() {	
		//this.getBlockInfoSubscriptionData();
		console.log('value changed', this.blockingInfoMode);
	}
	ngOnChanges(changes: SimpleChanges): void {
    	console.log('value changed', this.blockingInfoMode);
    	if(this.blockingInfoMode == 'create'){
			this.subscription=true;
		}else if(this.blockingInfoMode == 'update'){
			this.subscription=true;
		}else{
			this.subscription=false;
		}
  	}
	validate(fieldName?: string, error?: string): void {
		if (fieldName && error) {
			this.formErrors[fieldName].error = error;
		} else if (fieldName && !error) {
			let _field = '';
			let key = fieldName;
			_field = this.formErrors[key].name;
			this.formErrors[key].error = '';

			if (!this.sharingFields.controls[key].valid) {
				if ('required' in this.sharingFields.controls[key].errors) {
					this.formErrors[key].error = `${_field} field is required`;
				}
				if ('pattern' in this.sharingFields.controls[key].errors && key === 'to') {
					this.formErrors[key].error = `Invalid email address`;
				}
				this.valid = false;
			}
		} else {
			let _field = '';
			for (let key in this.formErrors) {
				if (this.formErrors.hasOwnProperty(key)) {
					_field = this.formErrors[key].name;

					this.formErrors[key].error = '';

					if (!this.sharingFields.controls[key].valid) {
						if ('required' in this.sharingFields.controls[key].errors) {
							this.formErrors[key].error = `${_field} field is required`;
						}
						if ('pattern' in this.sharingFields.controls[key].errors && key === 'to') {
							this.formErrors[key].error = `Invalid email address`;
						}
						this.valid = false;
					}
				}
			}
		}
	}

	send(e: Event, sharingFields) {
		if(this.subscription){
			this.openpaymentModel.emit();
		}else{
			e.preventDefault();
			this.valid = true;
			this.showLoader = true;
			this.formErrors = {
				message:  { error: '', name: 'Message' },
				subject:    { error: '', name: 'Subject' },
				to:     { error: '', name: 'Email' }
			};
			this.validate('');

			if (this.valid) {
				this.dataService.email(sharingFields.value.to, sharingFields.value.subject, sharingFields.value.message).subscribe(
					response => {
						this.analyticsService.emitEvent('Sharing Method', 'Email', 'Desktop', this.authService.currentUser.user_id);
						this.showLoader = false;
						this.sharingFields.reset();
						this.log.action = 'email';
						this.dataService.log(this.log).subscribe();
						this.globalError = 'Your profile link was sent successfully';
						setTimeout(function () {
							this.globalError = '';
						}.bind(this), 3000);
					},
					error => {
						this.showLoader = false;
						let _error = JSON.parse(error._body);
						for (let i in _error.message) {
							if (_error.message.hasOwnProperty(i)) {
								this.validate(_error.message[i].field, _error.message[i].error);
							}
						}

						if (error.status === 403 || error.status === 404 || error.status === 400) {
							this.globalError = _error.message;
						}
					}
				);
			}
		}
	};

	share_facebook() {
		/*if (this.blockingInfoStatus === undefined) { return; };
		
		let _blockingInfoStatus = Number();*/
		if(this.subscription){
			this.openpaymentModel.emit();
		}else{
			this.shareUrl = 'https://www.facebook.com/sharer/sharer.php';
			this.shareParams = {
				u: this.repoUrl
			};
			// Log the share action
			this.log.action = 'facebook';
			this.dataService.log(this.log).subscribe();

			this.analyticsService.emitEvent('Sharing Method', 'Facebook', 'Desktop', this.authService.currentUser.user_id);

			this.urlSharer({
				params: this.shareParams,
				shareUrl: this.shareUrl
			});
		}
		
	};

	share_twitter(title: string) {
		if(this.subscription){
			this.openpaymentModel.emit();
		}else{
			this.shareUrl = 'https://twitter.com/intent/tweet/';
			this.shareParams = {
				url: this.repoUrl,
				text: title
			};

			// Log the share action
			this.log.action = 'twitter';
			this.dataService.log(this.log).subscribe();

			this.analyticsService.emitEvent('Sharing Method', 'Twitter', 'Desktop', this.authService.currentUser.user_id);

			this.urlSharer({
				params: this.shareParams,
				shareUrl: this.shareUrl
			});
		}
	};

	share_linkedin() {
		if(this.subscription){
			this.openpaymentModel.emit();
		}else{
			this.shareUrl = 'https://www.linkedin.com/shareArticle';
			this.shareParams = {
				url: this.repoUrl,
				mini: true
			};

			// Log the share action
			this.log.action = 'linkedin';
			this.dataService.log(this.log).subscribe();

			this.analyticsService.emitEvent('Sharing Method', 'LinedIn', 'Desktop', this.authService.currentUser.user_id);

			this.urlSharer({
				params: this.shareParams,
				shareUrl: this.shareUrl
			});
		}
	}

	share_gplus() {
		if(this.subscription){
			this.openpaymentModel.emit();
		}else{
			this.shareUrl = 'https://plus.google.com/share';
			this.shareParams = {
				url: this.repoUrl
			};

			// Log the share action
			this.log.action = 'googleplus';
			this.dataService.log(this.log).subscribe();

			this.analyticsService.emitEvent('Sharing Method', 'Google+', 'Desktop', this.authService.currentUser.user_id);

			this.urlSharer({
				params: this.shareParams,
				shareUrl: this.shareUrl
			});
		}
	}

	private urlSharer(sharer: any) {
		let p = sharer.params || {},
			keys = Object.keys(p),
			i: any,
			str = keys.length > 0 ? '?' : '';
		for (i = 0; i < keys.length; i++) {
			if (str !== '?') {
				str += '&';
			}
			if (p[keys[i]]) {
				str += keys[i] + '=' + encodeURIComponent(p[keys[i]]);
			}
		}
		let url = sharer.shareUrl += str;

		if (!sharer.isLink) {
			let popWidth = sharer.width || 600,
				popHeight = sharer.height || 480,
				left = window.innerWidth / 2 - popWidth / 2 + window.screenX,
				top = window.innerHeight / 2 - popHeight / 2 + window.screenY,
				popParams = 'scrollbars=no, width=' + popWidth + ', height=' + popHeight + ', top=' + top + ', left=' + left,
				newWindow = window.open(url, '', popParams);

			if (window.focus) {
				newWindow.focus();
			}
		} else {
			window.location.href = url;
		}
	}

	selectSharingLink(e: Event) {
		let _thisval = <HTMLInputElement>e.srcElement;
		_thisval.setSelectionRange(0, _thisval.value.length);
	}
}

interface FormErrors {
	subject: FormErrorItem;
	message: FormErrorItem;
	to:			 FormErrorItem;
}

interface FormErrorItem {
 error: string;
 name:  string;
}

interface ShareParams {
	u?:		string;
	url?:  string;
	text?: string;
	mini?: boolean;
}