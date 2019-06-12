import { Component, OnInit, Input } from '@angular/core';

@Component({
	selector: 'app-input-loader',
	templateUrl: './input-loader.component.html',
	styleUrls: ['./input-loader.component.css']
})
export class InputLoaderComponent implements OnInit {

	@Input() loading: boolean = false;

	constructor() { }

	ngOnInit() {
	}

}
