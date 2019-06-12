import { Component, OnInit, Input, OnChanges, Output, EventEmitter, SimpleChanges } from '@angular/core';

import { Business } from '../../rest/model/Business';

declare let moment: any;

@Component({
	selector: 'year-picker',
	template: `
		<div>
				<select [disabled]="disabled" class="{{selectClass}}" (change)="onChangeYear($event.target.value)">
						<option *ngIf="defaults" [selected]="(yy === null)" disabled [value]="null">Year</option>
						<option *ngFor="let y of years" [selected]="(yy === y)" [value]="y">{{y}}</option>
				</select>
		</div>
	`
})
export class YearComponent implements OnInit, OnChanges {
	@Input() data: any | Business;
	@Input() disabled: boolean = false;
	@Input() defaults: boolean = false;
	@Input() selectClass: '';
	@Input() maxYears = 0;
	@Output() year = new EventEmitter<Date>();

	public years: number[] = [];
	public yy: number;

	ngOnInit() {
		let yearPrint = new Date().getFullYear() - this.maxYears;
		for (let i = yearPrint; i >= (yearPrint - 100); i--) {
			this.years.push(i);
		}
	}

	ngOnChanges(changes: SimpleChanges) {
		this.getYear();
	}

	getYear() {
		let today;
		if (this.data) {
			today = new Date(this.data);
			this.yy = today.getFullYear();
		} else {
			this.yy = null;
		}
	}

	onChangeYear(year: number) {
		let date;
		if (this.data) {
			let allDate = moment(this.data).toDate();
			date = allDate.setFullYear(year);
		} else {
			date = new Date().setFullYear(year);
		}

		this.year.emit(date);
	}
}
