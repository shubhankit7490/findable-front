import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';

@Component({
	selector: 'app-tag',
	templateUrl: './tag.component.html',
	styleUrls: ['./tag.component.css']
})
export class TagComponent implements OnInit {

	@Input() valueName: string;

	@Input() valueIdentifier: string;

	@Output() onRemove = new EventEmitter<number>();

	ngOnInit() {}
	
	public removeTag(id: string) {
		this.onRemove.emit(Number(id));
	}

}
