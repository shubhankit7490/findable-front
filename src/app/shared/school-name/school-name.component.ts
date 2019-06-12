import { Component, Input, Output, EventEmitter, ViewChild, SimpleChanges } from '@angular/core';
import { AutoComplete } from 'interjet-primeng/components/autocomplete/autocomplete';
import { Subscription } from 'rxjs/Subscription';

// services:
import { DataService } from '../../rest/service/data.service';

// models:
import * as models from '../../rest/model/models';

@Component({
	selector: 'app-school-name',
	templateUrl: './school-name.component.html',
	styleUrls: ['./school-name.component.css']
})
export class SchoolNameComponent {
	@ViewChild('autocompleteElement') autocompleteElement: AutoComplete;

	@Output() onSelected = new EventEmitter<models.DictionaryItem>();

	@Output() onBlur = new EventEmitter<any>();

	@Input() school: models.DictionaryItem;

	public schools: models.DictionaryItem[];

	private schools$: Subscription;

	public searchTerm = '';

	public error = ''

	public requesting = false;

	constructor(public dataService: DataService) { }

	public searchSchool(event) {
		this.requesting = true;
		this.schools$ = this.dataService.dictionary_schools_get('school', event.query).subscribe(
			(response: models.DictionaryItem[]) => {
				this.requesting = false;
				this.schools = response;
			},
			error => {
				this.requesting = false;
				this.error = error.message;
			}
		)

	}

	public onSelect(school: models.DictionaryItem) {
		this.setSchoolText(school.name)
		this.school = school;

		// this.onSelected.emit({event, item: this.school});
		this.onSelected.emit(school);
		
	}

	public setSchoolText(text: string) {
		this.autocompleteElement.el.nativeElement.querySelector('input').value = text;
	}

	public setState(event: Event) {
		this.onSelected.emit({ id: null, name: '' });
	}

	public onFocusOut(event: Event) {
		this.onBlur.emit(event);
	}

	ngOnChanges(changes: SimpleChanges) {
		setTimeout(() => {
			if ('school' in changes) {
				if (changes['school'].currentValue !== null) {
					this.setSchoolText(this.school.name)
				}
				else {
					this.setSchoolText('');
				}
			}
		}, 0)
	}
}
