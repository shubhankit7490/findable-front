import { Component, OnInit, Input, Output, EventEmitter, ViewChild, SimpleChanges } from '@angular/core';
import { Subscription } from 'rxjs';

// services:
import { DataService } from '../../rest/service/data.service';

// models:
import { Industry } from '../../rest/model/Industry'

@Component({
	selector: 'app-industry',
	templateUrl: './industry.component.html',
	styleUrls: ['./industry.component.css']
})
export class IndustryComponent implements OnInit {
	@ViewChild('autocompleteElement') autocompleteElement;

	@Output() onSelected = new EventEmitter<any>();

	@Output() onBlur = new EventEmitter<any>();

	@Input() industry: Industry;

	public industries: Industry[];

	public searchTerm: string;

	private industriesObservable: Subscription;

	public error: string = ''

	public requesting: boolean = false;

	constructor(public dataService: DataService) {
	}

	ngOnInit() {
	}

	searchIndustry(event) {
		this.requesting = true;
		this.industriesObservable = this.dataService.dictionary_industry_get('industry', event.query).subscribe(
			response => {
				this.requesting = false;
				this.industries = response;
			},
			error => {
				this.requesting = false;
				this.error = error.message;
			}
		);

	}

	onSelect(event) {
		this.setIndustryText(event.name);
		this.industry = event;

		this.onSelected.emit({event, item: this.industry});
	}

	onFocusOut(event) {
		this.industry = event;
		this.onBlur.emit({event, item: this.industry});
	}

	setIndustryText(text) {
		this.autocompleteElement.el.nativeElement.querySelector('input').value = text;
	}

	setState(event) {
		this.onSelected.emit({event: {id: null, name: null}, item: {id: null, name: null}});
	}

	ngOnChanges(changes: SimpleChanges) {
		setTimeout(() => {
			if ('industry' in changes) {
				if (changes['industry'].currentValue !== null) {
					this.setIndustryText(this.industry.name)
				}
				else {
					this.setIndustryText('');
				}
			}
		}, 0);
	}
}
