import { Component, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { DataService } from '../../rest/service/data.service';
import * as models from '../../rest/model/models';
import { FormGroup, Validators, FormBuilder} from '@angular/forms';
import { AuthService } from '../../rest/service/auth.service';

import { StudyField } from '../../rest/model/StudyField';
import { SingleDictionary } from '../../rest/model/SingleDictionary';

@Component({
	selector: 'field-of-degree',
	styles: [` 
    .list-wrapper{
        min-height: 300px;
    }
    :host select, :host options, :host input {
        font-family: 'Roboto', arial;
        font-size: 15px;
    }

    :host >>> ::-webkit-input-placeholder {
        font-family: 'Roboto', arial;
        font-size: 15px;
    }
    :host >>> ::-moz-placeholder {
        font-family: 'Roboto', arial;
        font-size: 15px;
    }
    :host >>> :-ms-input-placeholder {
        font-family: 'Roboto', arial;
        font-size: 15px;
    }
    :host >>> :-moz-placeholder {
        font-family: 'Roboto', arial;
        font-size: 15px;
    }
    :host >>> .fnd-block {
        padding-right: 40px;
        display: inline-block;
        text-indent: -30px;
        margin-left: 30px;
    }
    p.form-messages {
        clear: both;
        text-align: center;
        height: 0;
        font-size: 13px;
        color: red;
        position: relative;
        top: 3px;
        margin: 0;
    }
    `],    template: ` 
      <form [formGroup]="fieldsForm" (ngSubmit)="onSubmitFields($event)" class="form-wrapper">
		  <div class="form-group">
				<label>Field of Degree</label>
				<p-autoComplete
					#fieldOfDegree
					[(ngModel)]='searchTerm'
					[suggestions]='results'
					[minLength]=1
					[delay]=500
					dataKey='id'
					placeholder='Enter Field Name...'
					(completeMethod)='search($event)'
					(onSelect)='onSelectAutoComplete($event)'
					(onBlur)='hideAutocomplete($event)'
					(updateModel)='updateFieldsState($event)'
					formControlName='fields'
					field='name'
                    maxlength="150"
				></p-autoComplete>
				<app-input-loader [loading]="requesting"></app-input-loader>
			</div>
			<div class="row">
				<div class="col-xs-12">
					<button type="submit" class="pull-right btn success-btn btn-lg" [disabled]="!fieldsForm.dirty"><i class="glyphicon glyphicon-refresh"></i> UPDATE</button>
				</div>
				<p class="form-messages">{{ errorMessage }}</p>
			</div>
			  <div class="form-group">
			<div class="list-wrapper">
				<ul class="fnd-location-of-interest">
					<li *ngFor="let field of fields; let g = index;">
						<span class="fnd-block fnd_color_{{g}}" >{{field.name}}</span>
						<button type="button" class="btn-li btn-right" (click)="deleteField(field.id)"><i class="glyphicon glyphicon-remove"></i></button>
					</li>
				</ul>
			</div>
		</div>
	</form>
   
  `
})
export class FieldOfDegreeComponent  {
	@ViewChild('fieldOfDegree') fieldOfDegree;
	@Input() fields: StudyField[] = [];
	@Output() fieldsEdit = new EventEmitter<models.StudyField[]>();
	sendModel: Array<any> = [];
	fieldsForm: FormGroup;
	editFieldParams: StudyField;
	public typeaheadLoading: boolean;
	public typeaheadNoResults: boolean;
	public searchTerm: string;
	public results: SingleDictionary;
	public requesting = false;
	private studyFieldModel: StudyField = {};
	errorMessage = '';
	constructor(public authService: AuthService, public dataService: DataService, public formBuilder: FormBuilder) {
		this.fieldsForm = this.formBuilder.group({
			fields: ['', Validators.required]
		});
		this.authService = authService;
		this.dataService = dataService;
	}

	hideAutocomplete(event) {
		setTimeout(function(){
			this.fieldOfDegree.hide();
		}.bind(this), 200);
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

	deleteField(id) {
		for (let i = 0; i < this.fields.length; i++) {
			if (this.fields[i].id === id) {
				this.fields.splice(i, 1);
				break;
			}
		}
		this.fieldsEdit.emit(this.fields);
	}

	onSubmitFields(e?: Event) {
		if (!!e) {
			e.preventDefault();
			e.stopPropagation();

			this.studyFieldModel = {
				id: null,
				name: this.fieldOfDegree.el.nativeElement.querySelector('input').value
			};
		}

		this.errorMessage = '';

		if (this.studyFieldModel.name.length > 0 && this.studyFieldModel.id === null) {

			let filtered = this.fields.filter(field => {
				return field.name.toLowerCase() === this.studyFieldModel.name.toLowerCase();
			});

			if (filtered.length > 0) {
				this.hardreset();
			} else {
				this.dataService.dictionary_studyfields_post(this.studyFieldModel.name).subscribe(
					response => {
						this.studyFieldModel.id = response.id;
						this.fields.push(this.studyFieldModel);
						this.fieldsEdit.emit(this.fields);
						this.hardreset();
					},
					error => {
						this.handleErrors(error);
					}
				);
			}
		}
	}

	search(event) {
		this.studyFieldModel = {
			id: null,
			name: event.query
		};

		if (!event.query.length) {
			return;
		}

		this.requesting = true;
		this.dataService.dictionary_studyfields_get('studyfields', event.query).subscribe(
			response => {
				this.results = response;
				this.requesting = false;
			}
		);
	}

	onSelectAutoComplete(e) {
		for (let item of this.fields){
			if (item.id === e.id) {
				this.searchTerm = '';
				return;
			}
		}

		this.studyFieldModel = {
			id: Number(e.id),
			name: e.name
		};
		this.fields.push(this.studyFieldModel);
		this.fieldsEdit.emit(this.fields);
		this.hardreset();
	}

	updateFieldsState(event) {
		let _e = event.srcElement || event.target;

		if (_e.value.length > 0) {
			this.fieldsForm.controls['fields'].markAsDirty();
		} else {
			this.fieldsForm.reset();
			this.fieldsForm.patchValue({
				'fields': ''
			});
		}
	}

	hardreset() {
		this.fieldsForm.reset();
		this.studyFieldModel = {
			id: null,
			name: ''
		};
		this.fieldOfDegree.hide();
		if (this.fieldOfDegree.el.nativeElement.querySelector('input') !== null ) {
			this.fieldOfDegree.el.nativeElement.querySelector('input').value = '';
		}
	}
}
