import { Component, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CustomValidators } from 'ng2-validation';
import { Subscription } from 'rxjs';

// services:
import { DataService } from '../../../rest/service/data.service';
import { AuthService } from '../../../rest/service/auth.service';
import { AnalyticsService } from '../../../services/analytics.service';
import { GrowlService } from '../../../rest/service/growl.service';

// models:
import * as models from '../../../rest/model/models';

import { AutoUnsubscribe } from '../../../utils/autoUnsubscribe';

@Component({
	selector: 'account-users',
	templateUrl: './account-users.component.html',
	styleUrls: ['./account-users.component.css']
})
@AutoUnsubscribe()
export class AccountUsersComponent implements OnInit {
	@ViewChild('jobtitle') jobTitleInput;
	public recruiters: models.Recruiter[] = null;
	private recruiter: models.NewRecruiter = {
		email: null,
		purchase_permission: false,
		jobtitle: <models.JobTitle> {
			id: null,
			name: null
		}
	};
	private permissions: models.PurchasePermissions = 0;
	public active = models.Recruiter.StatusEnum.Active;
	public pending = models.Recruiter.StatusEnum.Pending;

	public switchColor = '#a1a5be';
	public inviteUsersFormGroup: FormGroup;
	public submitting = false;

	public autoRenewEnabled = false;
	private recruitersGet$: Subscription;
	private recruitersSet$: Subscription;
	private recruitersDelete$: Subscription;
	private recruitersPost$: Subscription;

	public deletes = [];
	public updates = [];
	public searchTermJobTitle = '';
	public resultsJobtitle: models.DictionaryItem[];
	public requestingJobtitle = false;
	public dictionaryIndexed = true;
	setModelJobTitle: models.JobTitle = {
		id: null,
		name: ''
	};

	@Output() onModelChange = new EventEmitter();

	// Error messaging object
	public controls: any = {
		fields: {
			email: 'Email',
			jobtitle: 'Job title'
		},
		errors: {
			url: '{field} does not contain a valid url',
			required: '{field} is required',
			email: '{field} is not a valid email address'
		},
		messages: {
			email: '',
			jobtitle: ''
		}
	};

	constructor(
		public dataService: DataService,
		public authService: AuthService,
		public formBuilder: FormBuilder,
		public analyticsService: AnalyticsService,
	) {}

	ngOnInit() {
		this.inviteUsersFormGroup = this.formBuilder.group({
			email: 		[ '', [ Validators.required, CustomValidators.email ] ],
			jobtitle: [ '' ]
		});

		if (this.recruiters === null) {
			this.getRecruiters();
		}

		this.analyticsService.emitPageview('Account Users');
	}

	private getRecruiters(): void {
		this.recruitersGet$ = this.dataService.recruiters_get(this.authService.currentUser.business_id).subscribe(
			(response: models.Recruiter[]) => {
				this.recruiters = response;
				this.onModelChange.emit({ name: 'recruiters', model: this.recruiters });
			},
			error => {
				this.handleErrors(error);
			}
		);
	}

	public deleteRecruiter(e: Event, recruiter: models.Recruiter): void {
		e.preventDefault();
		e.stopImmediatePropagation();
		e.stopPropagation();

		this.startRecruiterAction(e, recruiter, 'deletes');

		this.recruitersDelete$ = this.dataService.recruiters_delete(this.authService.currentUser.business_id, recruiter.id).subscribe(
			response => {
				this.analyticsService.emitEvent('Account Users', 'Delete', 'Desktop', this.authService.currentUser.user_id);
				this.stopRecruiterAction(e, recruiter, 'deletes');
				this.removeFromModel(recruiter);
				GrowlService.message('Deleted the user from your account', 'success');
			},
			error => {
				this.stopRecruiterAction(e, recruiter, 'deletes');
				this.handleErrors(error);
			}
		);
	}

	private removeFromModel(recruiter: models.Recruiter): void {
		for (let i = 0; i < this.recruiters.length; i++) {
			if (this.recruiters[i].id === recruiter.id) {
				this.recruiters.splice(i, 1);
				break;
			}
		}

		this.onModelChange.emit({name: 'recruiters', model: this.recruiters});
	}

	public onSubmit(e: Event): void {
		e.preventDefault();
		e.stopPropagation();

		this.dictionaryIndexed = true;
		this.submitting = true;

		if (this.validate()) {
			// Adding the job title as a dictionary entity
			if (this.setModelJobTitle.name.length > 0 && this.setModelJobTitle.id === null && this.dictionaryIndexed) {
				this.dictionaryIndexed = false;
				this.dataService.dictionary_jobtitle_post(this.setModelJobTitle.name).subscribe(
					(response: models.NewDictionaryEntry) => {
						this.setModelJobTitle.id = response.id;
						this.submitting = false;
						this.onSubmit(e);
					},
					error => {
						this.handleErrors(error);
					}
				);
			}

			if (this.dictionaryIndexed) {
				this.recruiter.email = this.inviteUsersFormGroup.controls['email'].value;
				this.recruiter.jobtitle = this.setModelJobTitle;

				this.recruitersPost$ = this.dataService.recruiters_post(this.authService.currentUser.business_id, this.recruiter).subscribe(
					(response: models.Recruiter) => {
						this.analyticsService.emitEvent('Account Users', 'Create', 'Desktop', this.authService.currentUser.user_id);
						this.recruiters.push(<models.Recruiter>response);
						this.inviteUsersFormGroup.reset();
						this.setModelJobTitle = { id: null, name: '' };
						this.onModelChange.emit({ name: 'recruiters', model: this.recruiters });
						GrowlService.message('The user was added to your account', 'success');
						this.submitting = false;
					},
					error => {
						this.handleErrors(error);
						this.submitting = false;
					}
				);
			}
		}
	}

	public onAutoRenewChangeRecruiter(event: Event, recruiter: models.Recruiter): void {
		this.permissions = recruiter.purchase_permission = event ? 1 : 0;
		this.updatePermission(event, recruiter);
	}

	public onAutoRenewChange(checked: boolean): void {
		this.switchColor = checked ? '#3afbcf' : '#a1a5be';
		this.autoRenewEnabled = checked;
		this.recruiter.purchase_permission = checked;
	}

	public validate(key?: string): boolean {
		let __v = 0;
		if (!key) {
			for (let c in this.inviteUsersFormGroup.controls) {
				if (this.inviteUsersFormGroup.controls.hasOwnProperty(c) && !this.inviteUsersFormGroup.controls[c].valid) {
					for (let e in this.inviteUsersFormGroup.controls[c].errors) {
						if (this.inviteUsersFormGroup.controls[c].errors.hasOwnProperty(e) &&  this.controls.errors.hasOwnProperty(e)) {
							this.controls.messages[c] = this.controls.errors[e].replace('{field}', this.controls.fields[c]);
							__v++;
							break;
						}
					}
				}
			}
		} else {
			if (!this.inviteUsersFormGroup.controls[key].valid) {
				for (let e in this.inviteUsersFormGroup.controls[key].errors) {
					if (this.inviteUsersFormGroup.controls[key].errors.hasOwnProperty(e) &&  this.controls.errors.hasOwnProperty(e)) {
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

	private updatePermission(event: Event, recruiter: models.Recruiter): void {
		this.startRecruiterAction(event, recruiter, 'updates', true);
		this.recruitersSet$ = this.dataService.recruiters_put(this.authService.currentUser.business_id, recruiter.id, this.permissions).subscribe(
			response => {
				this.analyticsService.emitEvent('Account Users', 'Update', 'Desktop', this.authService.currentUser.user_id);
				GrowlService.message('Purchase settings were updated', 'success');
				this.stopRecruiterAction(event, recruiter, 'updates', true);
			},
			error => {
				this.handleErrors(error);
				this.stopRecruiterAction(event, recruiter, 'updates');
			}
		);
	}

	private removeArrayItem(arr, item: any) {
		let what, a = arguments, L = a.length, ax;
		while (L > 1 && arr.length) {
			what = a[--L];
			while ((ax = arr.indexOf(what)) !== -1) {
				arr.splice(ax, 1);
			}
		}
		return arr;
	}

	private startRecruiterAction(e: Event, recruiter: models.Recruiter, container: string, minimal = false): void {
		this[container].push(recruiter.id);
		if (!minimal) {
			let el = e['path'][1];

			if (el.classList) {
				el.classList.add('sending');
			} else {
				el.className += ' ' + 'sending';
			}
		}
	}

	private stopRecruiterAction(e: Event, recruiter: models.Recruiter, container: string, minimal = false): void {
		this[container] = this.removeArrayItem(this[container], recruiter.id);
		if (!minimal) {
			let el = e['path'][1];

			if (el.classList) {
				el.classList.remove('sending');
			} else {
				el.className = el.className.replace(new RegExp('(^|\\b)' + 'sending'.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
			}
		}
	}

	private handleErrors(error): void {
		let err_body = JSON.parse(error._body);
		if (error.status === 406) {
			for (let i = 0; i < err_body.message.length; i++) {
				this.controls.messages[err_body.message[i].field] = err_body.message[i]['error'];
			}
		}

		if (error.status === 403 || error.status === 400) {
			GrowlService.message(err_body.message, 'error');
		}
	}

	public UpdateJobtitleState(event): void {
		let _e: HTMLInputElement = event.srcElement || event.target;

		if (_e.value.length > 0) {
			this.inviteUsersFormGroup.controls['jobtitle'].markAsDirty();
		} else {
			this.inviteUsersFormGroup.patchValue({
				'jobtitle': ''
			});
		}
	}

	public validateJobTitle(element): void {
		setTimeout(function(){
			this.jobTitleInput.hide();
		}.bind(this), 200);
	}

	public searchJobtitle(event): void {
		if (!event.query.length) {
			return;
		}

		this.setModelJobTitle = {
			id: null,
			name: event.query
		}

		this.requestingJobtitle = true;
		this.dataService.dictionary_job_title_get('jobtitle', event.query).subscribe(
			(response: models.DictionaryItem[]) => {
				this.resultsJobtitle = response;
				this.requestingJobtitle = false;
			}
		);
	}

	public onSelectJobtitleAutoComplete(e: models.JobTitle): void {
		this.inviteUsersFormGroup.patchValue({
			jobtitle: e.name
		});

		this.setModelJobTitle = e;
		this.controls.messages.jobtitle = '';
	}
}
