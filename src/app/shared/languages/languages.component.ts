import { Component, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

// services:
import { ProviderService } from '../../services/provider.service';

// models:
import * as models from '../../rest/model/models';

// components:
import { TagsInputComponent } from '../tags-input/tags-input.component';

@Component({
	selector: 'app-search-languages',
	templateUrl: './languages.component.html',
	styleUrls: ['./languages.component.css']
})
export class LanguagesComponent {
	@ViewChild('tagInput') tagInput: TagsInputComponent;

	@Input() language: models.Language;

	@Input() tags: models.Language[] = [];

	@Input() query = '';

	@Output() onSelected = new EventEmitter<models.DictionaryItem>();

	@Output() onBlur = new EventEmitter<Event>();

	@Output() onRemove = new EventEmitter<number>();

	public languages: models.Language[];

	private languages$: Subscription;

	public error = '';

	public requesting = false;

	constructor(private providerService: ProviderService) { }

	public searchLanguage(searchPhrase: string) {
		this.languages = this.providerService.languages
			.filter((language: models.Language): boolean => {
				return language.name.toLowerCase().indexOf(searchPhrase.toLowerCase()) === 0;
			});
	}

	public onUpdate(event: Event) {
		this.onBlur.emit(event);
	}

	public removeLanguage(id: number) {
		this.onRemove.emit(id);
	}

	public onSelect(item: models.DictionaryItem) {
		this.language = item;
		this.onSelected.emit(item);
	}

}
