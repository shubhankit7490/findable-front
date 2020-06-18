import { Component, OnInit, Input } from '@angular/core';

import { DataService } from '../../../../../rest/service/data.service';
import { AuthService } from '../../../../../rest/service/auth.service';
import { TourService } from '../../../../../services/tour.service';

@Component({
	selector: 'app-contact-info',
	templateUrl: './contact-info.component.html',
	styleUrls: ['./contact-info.component.css']
})
export class ContactInfoComponent implements OnInit {
	@Input() userId: number;
	profile;

	constructor(public dataService: DataService, public authService: AuthService, public tourService: TourService) {
		this.dataService = dataService;
		this.authService = authService;
		this.tourService = tourService;
	}

	ngOnInit() {
		console.log('@contact-info > oninit');
		this.profile = this.dataService.profile_get(this.userId,1);

		// Check the sections status and collect the data for the tour service
		this.profile.subscribe(
			response => {
				this.tourService.collect('personal', response.phone === null);
				this.tourService.collect('personal_details', response.phone === null);
			}
		);
	}

}
