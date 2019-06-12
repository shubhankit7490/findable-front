import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';

@Component({
	selector: 'app-select-list-item',
	templateUrl: './select-list-item.component.html',
	styleUrls: ['./select-list-item.component.css']
})
export class SelectListItemComponent implements OnInit {

	@Input() hasDrag: boolean;
	@Input() hasIcon: boolean;
	@Input() hasColor: boolean;
	@Input() hasLevel: boolean;
	@Input() index: number;
	@Input() item: any;

	@Output() onItemDelete = new EventEmitter<number>();

	constructor() {
	}

	ngOnInit() {
	}

	public onDelete() {
		this.onItemDelete.emit(this.index);
	}

}
