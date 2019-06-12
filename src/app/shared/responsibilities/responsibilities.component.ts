import { Component, Input, Output, EventEmitter, ViewChild } from '@angular/core';

// services:
import { ProviderService } from '../../services/provider.service';

// models:
import * as models from '../../rest/model/models';

// components:
import { TagsInputComponent } from '../tags-input/tags-input.component';

@Component({
	selector: 'app-responsibilities',
	templateUrl: './responsibilities.component.html',
	styleUrls: ['./responsibilities.component.css']
})
export class ResponsibilitiesComponent {
	@ViewChild('tagInput') tagInput: TagsInputComponent;

	@Output() onSelected = new EventEmitter<models.DictionaryItem>();

	@Output() onRemoved = new EventEmitter<number>();

	@Output() onBlur = new EventEmitter<Event>();

	@Input() responsibility: models.AreaOfFocus;

	@Input() responsibilities: models.AreaOfFocus[] = [];

	@Input() query = '';

	public suggestions: models.AreaOfFocus[] = [];

	public error = '';

	public requesting = false;

	constructor(private providerService: ProviderService) { }

	public searchResponsibility(query: string) {
		this.suggestions = this.providerService.areasOfFocus
			.filter((areaOfFocus: models.AreaOfFocus): boolean => {
				return areaOfFocus.name.toLowerCase().indexOf(query.toLowerCase()) === 0;
			});
	}

	public onUpdate(event: Event) {
		this.onBlur.emit(event);
	}

	public onRemove(id: number) {
		this.onRemoved.emit(id);
	}

	public onSelect(item: models.DictionaryItem) {
		this.responsibility = item;
		this.onSelected.emit(item);
	}
}
