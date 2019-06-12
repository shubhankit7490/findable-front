import { PrivateProfile } from '../../../../rest/model/PrivateProfile';
import { Component, OnInit, Input } from '@angular/core';
import { DataService } from '../../../../rest/service/data.service';
import { AuthService } from '../../../../rest/service/auth.service';

@Component({
	selector: 'app-details-section',
	templateUrl: './details-section.component.html',
	styleUrls: ['./details-section.component.css']
})
export class DetailsSectionComponent implements OnInit {
	@Input() userId: number;

	contactDetails: boolean;

	constructor(public dataService: DataService, public authService: AuthService) {
	}

	getContactDetails() {
		console.log('@details-section > getContactDetails');
		this.dataService.profile_get(this.userId).subscribe(
			(data: PrivateProfile) => {
				if (data.firstname) {
					this.contactDetails = true;
				}
			}
		);
	}

	ngOnInit() {
		this.getContactDetails();
	}

}
