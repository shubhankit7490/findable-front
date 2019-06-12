import { Component, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { AutoComplete } from 'interjet-primeng/components/autocomplete/autocomplete';

// models:
import * as models from '../../rest/model/models';

// components
import { TagComponent } from './tag/tag.component';

@Component({
	selector: 'app-tags-input',
	templateUrl: './tags-input.component.html',
	styleUrls: ['./tags-input.component.css']
})
export class TagsInputComponent {
	@ViewChild('autocompleteElement') autocompleteElement: AutoComplete;

	@ViewChild('tagComponent') tagComponent: TagComponent;

	@Input() tags: models.DictionaryItem[] = [];

	@Input() suggestionsArray = [];

	@Input() field: string;

	@Output() onQuery = new EventEmitter<string>();

	@Output() onRemove = new EventEmitter<number>();

	@Output() onAdd = new EventEmitter<models.DictionaryItem>();

	@Output() onFocusOut = new EventEmitter<Event>();

	@Output() onChange = new EventEmitter<Event>();

	@Input() query: string;

	public initSearch(event: models.QueryEvent) {
		if (!event.query.length) {
			return;
		}

		this.onQuery.emit(event.query);
	}

	public onSelect(item: models.DictionaryItem) {
		for (let i in this.tags) {
			if (item.id == this.tags[i].id)
				return;
		}

		this.tags.push(item);

		this.onAdd.emit(item);

		this.clearInput();
	}

	public onBlur(event: Event) {
		this.onFocusOut.emit(event);
	}

	public onUpdate(event: Event) {
		this.onChange.emit(event);
	}

	public removeTag(id: number) {
		let tagValue: number;

		this.tags = this.tags.filter(<Array>(value, index): boolean => {
			if (value.id == id) {
				tagValue = value.id;
			}

			return value.id != id;
		});

		this.onRemove.emit(tagValue);

		this.clearInput();
	}

	private clearInput() {
		this.autocompleteElement.el.nativeElement.querySelector('input').value = '';
	}

}
