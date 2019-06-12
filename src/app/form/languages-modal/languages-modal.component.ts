import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';
import * as models from '../../rest/model/models';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';

import { ProviderService } from '../../services/provider.service';
import { TourService } from '../../services/tour.service';
import { Language } from '../../rest/model/Language';
import { SingleDictionary } from '../../rest/model/SingleDictionary';

@Component({
	selector: 'app-languages-modal',
	styles: [`
        :host >>> .progress {
            height: 5px;
        }

        /* Auto complete component style */
        :host >>> .ui-autocomplete {
            width: 100%;
        }

        :host >>> .ui-autocomplete-input {
            border: 1px solid #c5c8d3 !important;
            width: 100%;
            font-size: 15px !important;
            padding-right: 20px;
        }

        :host >>> .ui-autocomplete-list-item {
            font-size: 14px;
        }

        :host >>> .auto-complete-spinner {
            position: relative;
            z-index: 999;
            float: right;
            margin-top: -32px;
            margin-right: 10px;
		}
		/* app-spinning-loader: */
		:host >>> .load-page i {
			font-size: 400%;
			top: 40%;
			left: 0%;
		}

        .float-right {
            float: right
        }

        .float-none {
            float: none;
        }

        .position-top {
            margin-top: -40px;
        }

        .text-center {
            text-align: center !important;
        }

        .text-right {
            text-align: right !important;
        }

        .click {
            cursor: pointer;
        }

        .text-width {
            width: 120px;
            line-height: 40px;
        }

        .list-wrapper {
            overflow-y: auto;
            height: 200px;
        }

        .container {
            width: 350px;
        }

        :host >>> .popover {
            max-width: 380px;
        }

        form .form-group {
            padding: 12px 0;
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

        .form-messages {
            clear: both;
            text-align: center;
            position: relative;
            top: 16px;
        }

        .form-messages.error {
            color: red;
        }

        .form-messages.success {
            color: #13345F;
        }
	`], template: `
        <div class="popup" id="languages_edit_form">
            <app-spinning-loader [showLoader]="isSubmitting"></app-spinning-loader>

            <form [formGroup]="languagesGroup" (ngSubmit)="onSubmit($event)" class="form-wrapper" autocomplete="off" novalidate>
                <div class="form-group">
                    <div class="col-xs-12">
                        <p-autoComplete
                                [(ngModel)]='searchTerm'
                                [suggestions]='results'
                                [minLength]=1
                                [delay]=500
                                dataKey='id'
                                placeholder='Enter language name ..'
                                (completeMethod)='search($event)'
                                (onSelect)='onSelectAutoComplete($event)'
                                formControlName='language'
                                field='name'
                        ></p-autoComplete>
                        <i *ngIf="requesting"
                           class="glyphicon glyphicon-refresh glyphicon-spinner auto-complete-spinner"
                           aria-hidden="true"></i>
                    </div>
                </div>
                <div class="form-group">
                    <div class="col-xs-12">
                        <progressbar value="{{level_languages}}" class="progress"></progressbar>
                    </div>
                </div>
                <div class="form-group position-top">
                    <div class="col-xs-12">
                        <div class="col-xs-4 click" (click)="updateLevel(1,languageSendModel)">Basic</div>
                        <div class="col-xs-4 text-center float-left click" (click)="updateLevel(2,languageSendModel)">
                            Good
                        </div>
                        <div class="col-xs-4 float-right text-right click" (click)="updateLevel(3,languageSendModel)">
                            Pro
                        </div>
                    </div>
                </div>
                <div class="form-group">
                    <div class="col-xs-12">
                        <button id="languages_edit_save_button" type="submit" [disabled]="!languagesGroup.valid"
                                class="pull-right btn success-btn btn-lg"><i class="glyphicon glyphicon-refresh"></i>
                            UPDATE
                        </button>
                        <br>
                        <p class="form-messages" [class.success]="messageObject.success"
                           [class.error]="!messageObject.success">{{ messageObject.message }}</p>
                    </div>
                </div>
                <div class="list-wrapper">
                    <ul class="fnd-peronal-traits ul-sortable">
                        <li *ngFor="let language of languagesModel; let i = index;">
                            <button type="button" class="btn-li btn-left" (click)="editLanguage(language)">
								<span *ngIf="!!language.flag" [ngClass]="'flag-' + language.flag" class="item-flag flag click"></span>
                                <i *ngIf="!language.flag" class="item-flag click glyphicon glyphicon-globe"></i>
							</button>
                            <span class="click" (click)="editLanguage(language)">{{language.name}}</span>
                            <span class="btn-li btn-right text-width click"
                                  (click)="editLanguage(language)">{{languageLevels[language.level]}}</span>
                            <button type="button" class="btn-li btn-right click" (click)="onDelete(language)"><i
                                    class="glyphicon glyphicon-remove"></i></button>
                        </li>
                    </ul>
                </div>
            </form>
        </div>
        <div id="language_modal_done_button" class="fnd-form-submit-container">
            <template #popTemplate>
                <button class="btn btn" (click)="done($event)">You are about to loose your data, are you sure?</button>
            </template>
            <button *ngIf="searchTerm" type="button" class="btn btn-success" [popover]="popTemplate">Done</button>
            <button id="fnd-languages-dialog-done-button" *ngIf="!searchTerm" type="button" class="btn btn-success" (click)="done($event)">Done
            </button>
        </div>
	`
})
export class LanguagesModalComponent implements OnInit {
	@Input() languagesModel: Language[];
	@Input() isSubmitting = false;
	@Input() errors: any;
	@Output() onLocationsChange = new EventEmitter<models.Languages>();
	@Output() deleteLanguage = new EventEmitter<models.Language>();
	@Output() updateLanguage = new EventEmitter<models.Language>();
	@Output() onClose: EventEmitter<boolean> = new EventEmitter();
	languageSendModel: Language;
	languagesGroup: FormGroup;
	level_languages = 0;
	public html = `<button class="btn btn-warning" (click)="done()">You are about to loose your data, are you sure?</button>`;
	public searchTerm: string;
	public results: SingleDictionary;
	public requesting = false;
	updateMode = false;
	languageLevels: Object = {
		'1': 'Basic',
		'2': 'Good',
		'3': 'Pro'
	};
	messageObject = {
		success: false,
		message: '',
	};

	constructor(
		private formBuilder: FormBuilder,
		private tourService: TourService,
		private providerService: ProviderService
	) {
		this.languagesGroup = this.formBuilder.group({
			language: ['', Validators.required]
		});

		this.requesting = false;
		this.updateMode = false;
	}

	ngOnInit() {}

	ngOnChanges(changes) {
		if (changes.errors) {
			if (changes.errors.currentValue.status) {
				let parsed = JSON.parse(changes.errors.currentValue._body);

				this.handleErrors(parsed, changes.errors.currentValue.status);
				this.isSubmitting = false;
			}
		}
	}

	handleErrors(data, status?): void {
		switch (status) {
			case 400:
			case 403:
				this.setMessage(false, 'Internal error, please try again');
				break;
			case 406:
				this.setMessage(false, data.message[0].error);
				break;
		}
	}

	setMessage(success: boolean, message, timeout = 5000): void {
		this.messageObject = {
			success: success,
			message: message
		};

		if (success) {
			setTimeout(() => {
				this.messageObject = {
					success: false,
					message: ''
				};
			}, timeout);
		}
	}

	updateLevel(level: number, dataLanguage: Language) {
		if (level === 1) {
			this.level_languages = 33;
		}
		if (level === 2) {
			this.level_languages = 66;
		}
		if (level === 3) {
			this.level_languages = 100;
		}

		this.languageSendModel.level = level;
	}

	editLanguage(editData) {
		this.languagesGroup.setValue({
			'language': editData.name
		});
		this.updateMode = true;
		this.languageSendModel = editData;
		this.languageSendModel = {
			id: Number(editData.id),
			name: editData.name,
			level: Number.parseInt(editData.level),
		};

		this.updateLevel(Number.parseInt(editData.level), editData);
	}

	public onDelete(language: Language) {
		this.deleteLanguage.emit(language);
	}

	onSubmit(e: Event) {
		e.preventDefault();

		if (this.languageSendModel.id !== null) {
			let filtered = this.languagesModel.filter(language => {
				return Number.parseInt(language.id.toString()) === this.languageSendModel.id && language.level === this.languageSendModel.level;
			});

			if (filtered.length > 0) {
				this.hardreset();
			} else {
				this.updateLanguage.emit(this.languageSendModel);
				this.hardreset();
			}
		} else {
			this.hardreset();
		}
	}

	resetValue() {
		this.searchTerm = '';
		this.level_languages = 0;
	}

	done(e) {
		if (this.tourService.shown) {
			if (this.languagesModel.length > 0) {
				this.tourService.initSection(e);
			} else {
				this.tourService.sleep();
			}
		}

		this.onClose.emit(true);
		this.resetValue();
	}

	search(event) {
		this.languageSendModel = {
			id: null,
			name: event.query,
			level: 1
		};

		if (!event.query.length) {
			return;
		}

		this.updateMode = false;

		this.results = this.providerService.languages.filter(language => {
			return language.name.toLowerCase().indexOf(event.query.toLowerCase()) === 0;
		});
	}

	onSelectAutoComplete(e) {
		for (let item of this.languagesModel) {
			if (item.id === e.id) {
				this.searchTerm = '';
				return;
			}
		}

		this.languagesGroup.setValue({
			'language': e.name
		});

		this.updateMode = false;
		this.languageSendModel.name = e.name;
		this.languageSendModel.id = Number(e.id);
		this.updateLevel(1, e);
	}

	hardreset() {
		this.searchTerm = '';
		this.languagesGroup.reset();
		this.languageSendModel = {
			id: null,
			name: '',
			level: 1
		};
		this.level_languages = 0;
	}
}
