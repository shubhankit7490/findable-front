import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { DataService } from '../../rest/service/data.service';
import { AuthService } from '../../rest/service/auth.service';
import { GrowlService } from '../../rest/service/growl.service';

@Component({
	selector: 'app-confirm-modal',
	templateUrl: './confirm-email.component.html',
	styleUrls: ['./confirm-email.component.css']
})
export class ConfirmEmailComponent implements OnInit {
	public userId = null;
	public valid = true;
	public isSubmitting = false;

	@Output() confirmSent = new EventEmitter();

	constructor(public authService: AuthService, public dataService: DataService) {
		this.userId = this.authService.getUserId();
	}

	ngOnInit() {
	}

	sendActivation(e: Event) {
		e.preventDefault();

		if (this.isSubmitting) {
			return false;
		}

		this.isSubmitting = true;

		this.dataService.confirm().subscribe(
			response => {
				if (response.status) {
					GrowlService.message('Your confirmation email has been sent', 'success');
					this.confirmSent.emit();
				} else {
					GrowlService.message('Failed to send the activation request', 'error');
				}

				this.isSubmitting = false;
			},
			error => {
				this.isSubmitting = false;
			}
		);
	}
}
