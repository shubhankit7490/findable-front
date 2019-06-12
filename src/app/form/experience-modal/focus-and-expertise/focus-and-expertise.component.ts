import {Component, Input, Output, EventEmitter, ViewChild} from '@angular/core';
import {FormGroup, Validators, FormBuilder} from '@angular/forms';

// services:
import {DataService} from '../../../rest/service/data.service';
import {AuthService} from '../../../rest/service/auth.service';
import {ProviderService} from '../../../services/provider.service';

// models:
import * as models from '../../../rest/model/models';
import {AreaOfFocus} from '../../../rest/model/AreaOfFocus';
import {SingleDictionary} from '../../../rest/model/SingleDictionary';

@Component({
	selector: 'app-focus-and-expertise',
	templateUrl: './focus-and-expertise.component.html',
	styleUrls: ['./focus-and-expertise.component.css'],
})
export class FocusAndExpertiseComponent {
	@Input() public areasOfFocus: AreaOfFocus[] = [];
	@Output() areasEdit = new EventEmitter<models.AreaOfFocus[]>();
	@ViewChild('responsibilitiesComponent') responsibilitiesAutcompleteComponent;
	sendModel: AreaOfFocus;
	areasForm: FormGroup;
	public results: SingleDictionary;
	public requesting = false;
	public searchTerm: String = '';
	public charsLeft = 150;
	errorMessage = '';

	constructor(
		public authService: AuthService,
		public dataService: DataService,
		public formBuilder: FormBuilder,
		public providerService: ProviderService,
	) {
		this.areasForm = this.formBuilder.group({
			area: ['', Validators.required]
		});
		this.requesting = false;
	}

	closeAutocomplete(event) {
		setTimeout(function () {
			this.responsibilitiesAutcompleteComponent.hide();
		}.bind(this), 200);
	}

	resetSearchTerm() {
		this.searchTerm = '';
	}

	handleErrors(error) {
		let err_body = JSON.parse(error._body);
		if (error.status === 406) {
			this.errorMessage = err_body.message[0]['error'];
		}

		if (error.status === 403 || error.status === 400) {
			this.errorMessage = err_body.message;
		}
	}

	updateResponsibilityForm(event) {
		let _e = event.srcElement || event.target;
		if (_e.value.length > 0) {
			this.areasForm.controls['area'].markAsDirty();
			this.charsLeft = Number.parseInt(_e.maxLength) - _e.value.length;
		} else {
			this.areasForm.reset();
			this.areasForm.patchValue({
				'area': ''
			});
			this.charsLeft = Number.parseInt(_e.maxLength);
		}
	}

	addNewValue() {
		if (this.sendModel.name.length > 0 && this.sendModel.id === null) {

			let filtered = this.areasOfFocus.filter(responsibility => {
				return responsibility.name.toLowerCase() === this.sendModel.name.toLowerCase();
			});

			if (filtered.length > 0) {
				this.hardreset();
			} else {
				this.dataService.dictionary_focusareas_post(this.sendModel.name).subscribe(
					response => {
						this.sendModel.id = response.id;
						this.areasOfFocus.push(this.sendModel);
						this.onSubmitFields();
					},
					error => {
						this.handleErrors(error);
					}
				);
			}
		}
	}

	search(event) {
		this.sendModel = {
			id: null,
			name: event.query
		};

		if (!event.query.length) {
			return;
		}

		this.results = this.providerService.areasOfFocus.filter(areaOfFocus => {
			return areaOfFocus.name.toLowerCase().indexOf(event.query.toLowerCase()) === 0;
		});
	}

	onSelectAutoComplete(e) {
		for (let item of this.areasOfFocus) {
			if (item.id === e.id) {
				this.searchTerm = '';
				this.charsLeft = 150;
				return;
			}
		}

		this.areasForm.setValue({
			'area': e.name
		});

		this.sendModel = e;
		this.areasOfFocus.push(this.sendModel);
		this.onSubmitFields();
	}

	deleteField(field) {
		for (let i = 0; i < this.areasOfFocus.length; i++) {
			if (this.areasOfFocus[i].id === field.id) {
				this.areasOfFocus.splice(i, 1);
				break;
			}
		}
		this.areasEdit.emit(this.areasOfFocus);
	}

	onSubmitFields(e?: Event) {
		if (!!e) {
			e.preventDefault();
			e.stopPropagation();

			this.sendModel = {
				id: null,
				name: this.responsibilitiesAutcompleteComponent.el.nativeElement.querySelector('input').value
			};

			if (e.type === 'submit' && this.sendModel.name.length > 0 && this.sendModel.id === null) {
				this.addNewValue();
				return;
			}
		}

		this.errorMessage = '';

		this.areasEdit.emit(this.areasOfFocus);
		this.hardreset();
	}

	hardreset() {
		this.areasForm.reset();
		this.areasForm.patchValue({
			'area': ''
		});
		this.sendModel = {
			name: '',
			id: null
		};
		this.responsibilitiesAutcompleteComponent.hide();
		if (this.responsibilitiesAutcompleteComponent.el.nativeElement.querySelector('input') !== null) {
			this.responsibilitiesAutcompleteComponent.el.nativeElement.querySelector('input').value = '';
		}
		this.charsLeft = 150;
	}
}