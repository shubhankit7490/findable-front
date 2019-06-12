import { AuthService } from '../../rest/service/auth.service';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';

@Component({
	selector: 'app-apply',
	templateUrl: './apply.component.html',
	styleUrls: ['./apply.component.css']
})
export class ApplyComponent implements OnInit {

	constructor(public router: Router, public route: ActivatedRoute, public authService: AuthService) {
	}

	ngOnInit() {
		this.route.params.subscribe(
			data => {
				if (data['businessId']) {
					if (this.authService.isLoggedIn) {
						this.router.navigate(['/dashboard'], {
							queryParams: {
								businessId: data['businessId']
							}
						});
					} else {
						this.router.navigate(['/user/signup'], {
							queryParams: {
								businessId: data['businessId']
							}
						});
					}
				}
			}
		);
	}

}
