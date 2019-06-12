import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Observable } from 'rxjs/Observable';

// services:
import { DataService } from '../../rest/service/data.service';
import { AuthService } from '../../rest/service/auth.service';

// models:
import * as models from '../../rest/model/models';

import { SelectListItemComponent } from '../../form/select-list-item/select-list-item.component';

@Component({
	selector: 'app-save-search',
	templateUrl: './save-search.component.html',
	styleUrls: ['./save-search.component.css']
})
export class SaveSearchComponent implements OnInit {
	@Input() applicantProfile: models.ApplicantsSearchProfile;
	@Input() isOpen: boolean;
	@Input() closeOnSelection = true;
	@Output() onSave = new EventEmitter<any>();
	@Output() onOpen = new EventEmitter<any>();
	@Output() onDelete = new EventEmitter<any>();
	@Output() onLoadSearch = new EventEmitter<any>();

	public savedSearches: models.SavedSearch[] = [];

	private savedSearchSubmitModel: models.RecruiterSearchProfile;

	private searches$: Observable<models.SavedSearches>;

	public savedSearch: models.SavedSearch;

	public form: FormGroup;

	public formErrors = {
		name: '',
		search: '',
		global: ''
	};

	constructor(public authService: AuthService, public dataService: DataService, public formBuilder: FormBuilder) {
	}

	ngOnInit() {
		this.getSavedSearches();

		this.form = this.formBuilder.group({
			searchName: [ '', Validators.required ]
		});
	}

	public onSubmit(event) {

		this.savedSearchSubmitModel = {
			name: this.form.get('searchName').value,
			search: this.applicantProfile
		}

		this.savedSearch = {
			name: this.form.get('searchName').value
		}

		this.form.reset();

		this.dataService.user_saved_searches_post(this.authService.getUserId(), this.savedSearchSubmitModel)
			.subscribe(
				response => {
					this.savedSearch.id = response
					this.savedSearches.push(this.savedSearch)
				},
				error => {
					this.handleErrors(error);
				}
			);
	}

	getSavedSearches() {
		this.searches$ = this.dataService.user_saved_searches_get(this.authService.getUserId());

		this.searches$.subscribe(
			(response: models.SavedSearches) => {
				this.savedSearches = response;
			},
			error => {
				this.handleErrors(error);
			}
		);
	}

	getSearchRecord(id) {
		if (this.closeOnSelection) {
			this.isOpen = false;
		}

		this.dataService.user_saved_searches_get_by_id(this.authService.getUserId(), id)
			.subscribe(
				response => {
					this.onLoadSearch.emit(response);
				},
				error => {
					this.handleErrors(error);
				}
			);
	}

	public remove(key): void {
		let deletedObject = this.savedSearches[key];

		this.dataService.user_saved_searches_delete(this.authService.getUserId(), this.savedSearches[key].id)
			.subscribe(
				response => {
					this.savedSearches.splice(key, 1);
					this.onDelete.emit(deletedObject);
				},
				error => {
					this.handleErrors(error);
				}
			);
	}

	toggleDialog() {
		this.isOpen = !this.isOpen;

		if (this.isOpen) {
			this.onOpen.emit(true);
		}
	}

	handleErrors(error) {
		let err_body = JSON.parse(error._body);
		if (error.status === 406) {
			for (let i = 0; i < err_body.message.length; i++) {
				this.formErrors[err_body.message[i].field] = err_body.message[i]['error'];
			}
		}

		if (error.status === 403 || error.status === 400 || error.status === 404) {
			this.formErrors['global'] = err_body.message;
		}
	}

}
