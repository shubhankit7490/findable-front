import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

// services:
import { DataService } from '../../rest/service/data.service';
import { AuthService } from '../../rest/service/auth.service';
import { AnalyticsService } from '../../services/analytics.service';

// models:
import { ModelPackage } from '../../rest/model/ModelPackage';

import { AutoUnsubscribe } from '../../utils/autoUnsubscribe';

@Component({
	selector: 'app-package-selector',
	templateUrl: './package-selector.component.html',
	styleUrls: ['./package-selector.component.css']
})
@AutoUnsubscribe()
export class PackageSelectorComponent implements OnInit {
	@Output() onSelect = new EventEmitter<number>();

	public packages:any = [];
	private package$: Subscription;

	constructor(
		public dataService: DataService,
		public authService: AuthService,
		public analyticsService: AnalyticsService,
	) { }

	ngOnInit() {
		this.analyticsService.emitPageview('Packages');
		this.getPackages();
	}

	private getPackages(): void {
		this.package$ = this.dataService.packages_get().subscribe(
			(response: ModelPackage[]) => {
				this.packages = response;
				console.log(this.packages);
			},
			error => {
				console.log('error');
			}
		);
	}

	public selectPackage(packageId?: number): void {
		// Temporary, should be removed when other packages are enabled as per Aryeh's request
		//if (packageId != 1) { return; }
		this.analyticsService.emitEvent('Packages', 'Select', 'Desktop', this.authService.currentUser.user_id);
		this.onSelect.emit(packageId);
	}
}
