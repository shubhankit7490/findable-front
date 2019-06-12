import { Injectable } from '@angular/core';

// services:
import { DataService } from '../rest/service/data.service';

// models:
import * as models from '../rest/model/models';

import { AutoUnsubscribe } from '../utils/autoUnsubscribe';

@Injectable()
@AutoUnsubscribe()
export class ProviderService {

	public languages: models.Languages = [];
	public areasOfFocus: models.AreaOfFocus[] = [];

	constructor(public dataService: DataService) {
	}

	getData() {
		this.dataService.dictionary_languages_get('languages', '*', true).subscribe(
			response => {
				this.languages = response;
			},
			error => {
				console.log('error', error);
			}
		);

		this.dataService.dictionary_focusarea_get('focusareas', '*', true).subscribe(
			response => {
				this.areasOfFocus = response;
			}
		);
	}


}
