import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

// services:
import { AuthService } from '../../rest/service/auth.service';
import { DataService } from '../../rest/service/data.service';

@Component({
	selector: 'app-confirm-dialog',
	templateUrl: './confirm-dialog.component.html',
	styleUrls: ['./confirm-dialog.component.css']
})
export class ConfirmDialogComponent implements OnInit {

	@Input() title = 'Confirm the action';

	@Input() subTitle = null;

	@Input() icon = null;

	@Input() iconClass = '';

	@Input() description = '';

	@Input() submitting: boolean = false;

	@Output() onConfirm = new EventEmitter<any>();

	@Output() onCancel = new EventEmitter<any>();

	public spinning: boolean = false;

	public enabled: boolean = true;

	constructor(public authService: AuthService, public dataService: DataService) { }

	ngOnInit() {}

	confirm(event) {
		this.onConfirm.emit();
	}

	cancel(event) {
		this.onCancel.emit();
	}

	disableButtons() {
		this.enabled = false;
	}

	enableButtons() {
		this.enabled = true;
	}

	startSpinner() {
		this.spinning = true;
	}

	stopSpinner() {
		this.spinning = false;
	}
}
