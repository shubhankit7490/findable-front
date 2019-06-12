import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';
import { TypeaheadMatch } from 'ng2-bootstrap/typeahead';
import { Observable } from 'rxjs/Observable';

// services:
import { DataService } from '../../rest/service/data.service';

// models:
import * as models from '../../rest/model/models';

@Component({
	selector: 'app-location-form',
	templateUrl: './locations-form.component.html',
	styleUrls: ['./locations-form.component.css']
})
export class LocationFormComponent implements OnInit {

	// Model object for location selector
	@Input() selectedLocations: any;
	// onLocationsChange event
	@Output() onLocationsChange = new EventEmitter<models.Locations>();
	public typeaheadLoading: boolean;
	public typeaheadNoResults: boolean;
	// Observable on location search results
	public matchingLocations: Observable<any>;
	// Search term model
	public searchTerm: string;

	constructor(public dataService: DataService) {
		this.dataService = dataService;
		this.matchingLocations = Observable
			.create((observer: any) => {
				// Runs on every search
				observer.next(this.searchTerm);
			})
			.mergeMap((token: string) => this.getLocationsAsObservable(token));
	}

	public getLocationsAsObservable(token: string): Observable<any> {
		return this.dataService.locations_get(token);
	}

	public changeTypeaheadLoading(e: boolean): void {
		this.typeaheadLoading = e;
	}

	public changeTypeaheadNoResults(e: boolean): void {
		this.typeaheadNoResults = e;
	}

	public typeaheadOnSelect(e: TypeaheadMatch): void {
		// Prevent duplicate item selection
		for (let item of this.selectedLocations){
			if (item.city_id === e.item.city_id) {
				this.searchTerm = '';
				return;
			}
		}

		// Add selected location to model, emit the change
		//this.selectedLocations.push(e.item);
		this.onLocationsChange.emit(e.item);
		// Clear search term
		this.searchTerm = '';
	}

	public onDelete(index) {
		//this.selectedLocations.splice(index, 1);
		this.onLocationsChange.emit(index);
	}
	ngOnInit() {
	}

}
