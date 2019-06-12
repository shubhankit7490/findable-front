import { Component, OnInit, Input, Output, EventEmitter, ViewChild, SimpleChanges, OnChanges } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

// services:
import { DataService } from '../../rest/service/data.service';

// models:
import * as models from '../../rest/model/models';
import { LocationExt } from '../../rest/service/extended-models/LocationExt';

import { AutoComplete } from 'interjet-primeng/components/autocomplete/autocomplete';

@Component({
	selector: 'app-location',
	templateUrl: './location.component.html',
	styleUrls: ['./location.component.css']
})
export class LocationComponent implements OnInit, OnChanges {
	@ViewChild('autocompleteElement') autocompleteElement: AutoComplete;

	@Output() onSelected = new EventEmitter<LocationExt>();

	@Input() location: LocationExt;

	@Input() label: string;

	public locations: models.Location[];

	public searchTerm: string = '';

	public error = '';
	
	public requesting = false;
	
	private locations$: Subscription;

	constructor(public dataService: DataService) { }

	ngOnInit() { }

	searchLocation(event) {
		if (!event.query.length) {
			return;
		}

		this.requesting = true;
		this.locations$ = this.dataService.locations_get(event.query, null, null, true).subscribe(
			(response: LocationExt[]) => {
				this.requesting = false;
				this.locations = response;
			},
			error => {
				this.requesting = false;
				this.error = error.message;
			}
		);

	}

	public onSelect(location: LocationExt) {
		this.setLocationText(location.name);
		this.location = location;

		this.onSelected.emit(location);
	}

	public setLocationText(text: string) {
		if (this.autocompleteElement.el.nativeElement.querySelector('input')) {
			this.autocompleteElement.el.nativeElement.querySelector('input').value = text ? text : '';
		}
	}

	public setState(event: Event) {
		this.onSelected.emit({
			continent_id: null,
			continent_name: null,
			city_id: null,
			city_name: null,
			name: null,
			state_id: null,
			state_name: null,
			state_short_name: null,
			country_id: null,
			country_name: null,
			country_short_name_alpha_3: null,
			country_short_name_alpha_2: null
		});
	}

	ngOnChanges(changes: SimpleChanges) {
		if (changes['location']) {
			if (changes['location'].currentValue.name !== null) {
				this.setLocationText(changes['location'].currentValue.name);
			}
		}
	}
}
