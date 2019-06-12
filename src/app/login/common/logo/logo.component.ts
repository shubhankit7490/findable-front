import {Component, OnInit} from '@angular/core';

@Component({
	selector: 'app-logo',
	templateUrl: 'logo.component.html',
	styleUrls: ['logo.component.css'],
	inputs: ['size']
})

export class LogoComponent implements OnInit {

	_logoSize: string;

	constructor() {
	}

	set size(size) {
		this._logoSize = size
	}

	ngOnInit() {
	}

}
