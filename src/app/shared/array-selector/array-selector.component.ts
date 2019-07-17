import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { Observable } from 'rxjs';

// services:
import { DataService } from '../../rest/service/data.service';
import { AuthService } from '../../rest/service/auth.service';

@Component({
	selector: 'app-array-selector',
	templateUrl: './array-selector.component.html',
	styleUrls: ['./array-selector.component.css']
})
export class ArraySelectorComponent implements OnInit {
	@ViewChild('selectBox') selectBox;

	@Input() selectedItem: any;

	@Input() arrayItems = [];

	@Input() arrayLabels = [];

	@Input() placeholderText: string;

	@Input() key_id: string;

	@Input() key_name: string;

	@Input() disabled: boolean;

	@Input() disablePlaceholder: boolean;

	@Input() placeholderValue = null;

	@Input() resetOnSelection: boolean;

	@Output() onSelect = new EventEmitter<EmitArraySelector>();

	itemsObservable: Observable<any>;

	error: string;

	chosenItem = {
		name: '',
		id: null
	};

	constructor(public dataService: DataService, public authService: AuthService) {
	}

	ngOnInit() {}

	onSelectChange(event: Event) {
		let selectedIndex = event.target['value'],
			selectedName = event.target['options'][event.target['selectedIndex']].text;

		if (this.arrayLabels.length > 0) {
			selectedName = this.arrayItems[selectedIndex];
		}

		this.chosenItem = {
			name: selectedName,
			id: selectedIndex
		};
		this.onSelect.emit({ item: this.chosenItem, event });

		if (this.resetOnSelection) {
			this.selectBox.nativeElement.options.selectedIndex = 0;
		}
	}

}

export interface EmitArraySelector {
	item: {
		id: string;
		name: string;
	},
	event: Event;
}
