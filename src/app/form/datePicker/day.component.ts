import { Component, OnInit, Input, OnChanges, Output, EventEmitter, SimpleChanges } from '@angular/core';

declare let moment: any;

@Component({
	selector: 'day-picker',
	template: `
		<div>
			<select [disabled]="disabled" class="{{selectClass}}" (change)="onChangeDay($event.target.value)">
				<option *ngFor="let d of days" [selected]="(dd === d)" [value]="d">{{d}}</option>
			</select>
		</div>
	`
})
export class DayComponent implements OnInit, OnChanges {
	@Input() data: Date;
	@Input() disabled: boolean = false;
	@Input() selectClass: '';
	@Output() day = new EventEmitter<Date>();

	public days: number[] = [];
	public dd: number;

	ngOnInit() {
		this.getDay();
	}

	ngOnChanges(changes: SimpleChanges) {
		this.getDay();
	}

	getDay() {
		this.days = [];
		let today;
		if (this.data) {
			today = moment(this.data).toDate();
		} else {
			today = new Date();
		}
		this.dd = today.getDate();

		for (let i = 0; i < moment(today).daysInMonth(); i++) {
			this.days.push(i + 1);
		}
	}

	onChangeDay(day: number) {
		let date;
		if (this.data) {
			let allDate = moment(this.data).toDate();
			date = allDate.setDate(day);
		} else {
			date = new Date().setDate(day);
		}

		this.day.emit(date);
	}
}
