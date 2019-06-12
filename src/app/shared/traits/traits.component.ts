import { Component, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';

// services:
import { DataService } from '../../rest/service/data.service';

// models:
import * as models from '../../rest/model/models';

// components:
import { TagsInputComponent } from '../tags-input/tags-input.component';

@Component({
	selector: 'app-search-traits',
	templateUrl: './traits.component.html',
	styleUrls: ['./traits.component.css']
})
export class TraitsComponent {
	@ViewChild('tagInput') tagInput: TagsInputComponent;

	@Input() trait: models.Trait;

	@Input() tags: models.Trait[] = [];

	@Input() query = '';

	@Output() onSelected = new EventEmitter<models.Trait>();

	@Output() onBlur = new EventEmitter<Event>();

	@Output() onRemove = new EventEmitter<number>();

	public traits: models.Trait[];

	private traits$: Subscription;

	public error = '';

	public requesting = false;

	constructor(public dataService: DataService) {	}

	public searchTraits(searchPhrase: string) {
		this.requesting = true;
		this.traits$ = this.dataService.dictionary_traits_get('trait', searchPhrase).subscribe(
			(response: models.Trait[]) => {
				this.requesting = false;
				this.traits = response;
			},
			error => {
				this.requesting = false;
				this.error = error.message;
			}
		);
	}

	public onUpdate(event: Event) {
		this.onBlur.emit(event);
	}

	public removeTrait(id: number) {
		this.onRemove.emit(id);
	}

	public onSelect(item: models.DictionaryItem) {
		this.trait = item;
		this.onSelected.emit(item);
	}

}
