import { AuthService } from '../../../rest/service/auth.service';
import { Component, OnInit } from '@angular/core';

@Component({
	selector: 'app-logo-main',
	templateUrl: 'logo.component.html',
	styleUrls: ['logo.component.css'],
	inputs: ['size']
})

export class LogoComponent implements OnInit {

	_logoSize: string;

	constructor(public authService: AuthService) {
	}

	set size(size) {
		this._logoSize = size
	}

	ngOnInit() {
	}

}
