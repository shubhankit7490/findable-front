import { Component, OnInit, Input, Output, EventEmitter, ViewChild, SimpleChanges } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

// services:
import { DataService } from '../../rest/service/data.service';

// models:
import * as models from '../../rest/model/models';

import { AutoComplete } from 'interjet-primeng/components/autocomplete/autocomplete';

@Component({
	selector: 'app-company-name',
	templateUrl: './company-name.component.html',
	styleUrls: ['./company-name.component.css']
})
export class CompanyNameComponent implements OnInit {
	@ViewChild('autocompleteElement') autocompleteElement: AutoComplete;

	@Output() onSelected = new EventEmitter<EmitCompany>();

	@Output() onBlur = new EventEmitter<EmitCompany>();

	@Input() company: models.Company;

	public companies: models.Company[];

	public searchTerm: string = '';

	public error = '';
	
	public requesting = false;
	
	private companies$: Subscription;

	constructor(public dataService: DataService) { }

	ngOnInit() { }

	public searchCompany(event: models.QueryEvent) {
		this.requesting = true;
		// console.log('@company-name searchCompany event', event);
		this.companies$ = this.dataService.dictionary_company_get('company', event.query).subscribe(
			(response: models.DictionaryItem[]) => {
				this.requesting = false;
				this.companies = response;
			},
			error => {
				this.requesting = false;
				this.error = error.message;
			}
		);

	}

	public onFocusOut(company: models.Company) {
		this.company = company;
		this.onBlur.emit({ company, item: this.company });
	}

	public onSelect(company: models.Company) {
		this.setCompanyText(company.name);
		this.company = company;

		this.onSelected.emit({ company, item: this.company });
	}

	private setCompanyText(text: string) {
		this.autocompleteElement.el.nativeElement.querySelector('input').value = text ? text : '';
	}

	public setState(event: Event) {
		this.onSelected.emit({
			event: { id: null, name: null },
			item: { id: null, name: null }
		});
	}

	ngOnChanges(changes: SimpleChanges) {
		setTimeout(() => {
			if ('company' in changes) {
				if (changes['company'].currentValue !== null) {
					this.setCompanyText(this.company.name);
				} else {
					this.setCompanyText('');
				}
			}
		}, 0)
	}

}

export interface EmitCompany {
	event?: models.Company;
	company?: models.Company;
	item: models.Company;
}