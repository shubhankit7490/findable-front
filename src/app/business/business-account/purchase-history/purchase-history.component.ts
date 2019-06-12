import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

// services:
import { DataService } from '../../../rest/service/data.service';
import { AuthService } from '../../../rest/service/auth.service';
import { AnalyticsService } from '../../../services/analytics.service';
import { GrowlService } from '../../../rest/service/growl.service';

// models:
import * as models from '../../../rest/model/models';

import { AutoUnsubscribe } from '../../../utils/autoUnsubscribe';

@Component({
	selector: 'purchase-history',
	templateUrl: './purchase-history.component.html',
	styleUrls: ['./purchase-history.component.css']
})
@AutoUnsubscribe()
export class PurchaseHistoryComponent implements OnInit {
	private history$: Subscription;
	private months = 1;
	public validMonths = [1, 3, 6, 12];
	@Input() history: models.BusinessPurchase[] = [];
	@Output() onModelChange = new EventEmitter();

	constructor(public dataService: DataService, public authService: AuthService, public analyticsService: AnalyticsService) {}

	ngOnInit() {
		if (!this.history.length) {
			this.getHistory();
		}

		this.analyticsService.emitPageview('Purchase History');
	}

	getHistory(e: Event = null) {
		if (!!e) {
			this.months = Number.parseInt((<HTMLSelectElement>e.srcElement).selectedOptions[0].value);
			this.months = isNaN(this.months) ? 1 : this.months;
			this.analyticsService.emitEvent('Purchase History', 'Load Report', 'Desktop', this.authService.currentUser.user_id);
		}

		this.history$ = this.dataService.purchase_history_get(this.authService.currentUser.business_id, this.months).subscribe(
			(response: models.BusinessPurchase[]) => {
				this.history = response;
				this.onModelChange.emit({name: 'history', model: this.history});
			},
			error => {
				GrowlService.message(JSON.parse(error._body).message, 'error')
			}
		);
	}
}
