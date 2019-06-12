import { Component, OnInit, Input, OnChanges, Output, EventEmitter, SimpleChanges } from '@angular/core';

declare let moment: any;

@Component({
	selector: 'month-picker',
	template: `
		<div>  
			<select [disabled]="disabled" class="{{selectClass}}" (change)="onChangeMonth($event.target.value)">
				<option *ngIf="defaults" [selected]="(mm === null)" disabled [value]="null">Month</option>
				<option *ngFor="let p of months"  [selected]="(mm === p.val)" [value]="p.val">{{p.name}}</option>    
			</select>
		</div>
	`
})
export class MonthComponent implements OnInit, OnChanges {
	@Input() data: Date;
	@Input() disabled: boolean = false;
	@Input() defaults: boolean = false;
	@Input() selectClass: '';
	@Output() month = new EventEmitter<Date>();
	public mm: any;

	public months = [
		{ val: 0,  name: 'Jan' },
		{ val: 1,  name: 'Feb' },
		{ val: 2,  name: 'Mar' },
		{ val: 3,  name: 'Apr' },
		{ val: 4,  name: 'May' },
		{ val: 5,  name: 'Jun' },
		{ val: 6,  name: 'Jul' },
		{ val: 7,  name: 'Aug' },
		{ val: 8,  name: 'Sep' },
		{ val: 9,  name: 'Oct' },
		{ val: 10,  name: 'Nov' },
		{ val: 11,  name: 'Dec' }
	];

	ngOnInit() {
		this.getMonth();
	}

	ngOnChanges(changes: SimpleChanges) {
		this.getMonth();
	}

	getMonth() {
		let today;
		if (this.data) {
			today = moment(this.data).toDate();
			this.mm = today.getMonth();
		} else {
			this.mm = null;
		}
	}

	onChangeMonth(month: number) {
		let date;
		if (this.data) {
			let allDate = moment(this.data).toDate();
			date = allDate.setMonth(month);
		} else {
			date = new Date().setMonth(month);
		}
		this.month.emit(date);
	}
}
