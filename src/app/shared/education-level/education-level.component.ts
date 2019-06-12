import { Component, Input, Output, EventEmitter, ViewChild } from '@angular/core';

// models:
import * as models from '../../rest/model/models';

// components:
import { ArraySelectorComponent, EmitArraySelector } from '../array-selector/array-selector.component';
import { TagComponent } from '../tags-input/tag/tag.component';

@Component({
	selector: 'app-education-level',
	templateUrl: './education-level.component.html',
	styleUrls: ['./education-level.component.css']
})
export class EducationLevelComponent {
	@ViewChild('tagComponent') tagComponent: TagComponent;
	@ViewChild('arraySelector') arraySelector: ArraySelectorComponent;

	@Input() levels: models.EducationLevel[] = [];

	@Input() tags: models.DictionaryItem[] = [];

	@Input() selectedItem: models.EducationLevel;
	
	@Input() placeholderText: string;

	@Output() onSelect = new EventEmitter<models.EducationLevel>();

	@Output() onRemoved = new EventEmitter<number>();

	public error =  '';

	public onSelectChange({ item: { id, name } }: EmitArraySelector) {
		if (id === '0') {
			return;
		}
		if (this.tags && this.tags.length > 0) {
			for (let i = 0; i < this.tags.length; i++) {
				if (this.tags[i].id == Number(id)) {
					return;
				}
			}
		}
		let level = {
			id: Number(id),
			name,
		};
		
		this.tags.push(level);
		this.onSelect.emit(level);
	}

	public removeTag(id: number) {
		this.onRemoved.emit(id);
	}

}


