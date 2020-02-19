import { AuthService } from '../../../rest/service/auth.service';
import { Component, OnInit } from '@angular/core';

@Component({
	selector: 'account-number',
	templateUrl: 'account-number.component.html',
	styleUrls: ['account-number.component.css'],
})

export class AccountNumberComponent implements OnInit {

	_logoSize: string;

	constructor(public authService: AuthService) {
	}
	ngOnInit() {
	}

}
