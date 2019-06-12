import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {AuthService} from './rest/service/auth.service';
import {ProviderService} from './services/provider.service';
import {TourService} from './services/tour.service';
import {environment} from 'environments/environment';

declare let Tour: any;

@Component({
	selector: 'app-root',
	styleUrls: ['./app.component.css'],
	template: `
        <router-outlet></router-outlet>
		`
})

export class AppComponent implements OnInit {

	constructor(public router: Router, public authService: AuthService, public tourService: TourService, public providerService: ProviderService) {
		if (this.authService.isLoggedIn) {
			this.providerService.getData();
		}
	}

	ngOnInit() {
		// Write a different Google analytics block depending on the evnironment
		// if (environment.production) {
		// 	document.write('<script>\n' +
		// 		'        (function(i,s,o,g,r,a,m){i[\'GoogleAnalyticsObject\']=r;i[r]=i[r]||function(){\n' +
		// 		'            (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),\n' +
		// 		'            m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)\n' +
		// 		'        })(window,document,\'script\',\'https://www.google-analytics.com/analytics.js\',\'ga\');\n' +
		// 		'\n' +
		// 		'        ga(\'create\', \'UA-106631784-2\', \'auto\');\n' +
		// 		'    </script>');
		// } else {
		// 	document.write('<script>\n' +
		// 		'        (function(i,s,o,g,r,a,m){i[\'GoogleAnalyticsObject\']=r;i[r]=i[r]||function(){\n' +
		// 		'            (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),\n' +
		// 		'            m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)\n' +
		// 		'        })(window,document,\'script\',\'https://www.google-analytics.com/analytics.js\',\'ga\');\n' +
		// 		'\n' +
		// 		'        ga(\'create\', \'UA-106631784-1\', \'auto\');\n' +
		// 		'    </script>');
		// }

		window['redirect'] = function(u, n){
			if (!n) { top.location.href = u; } else {
				this.open(u);
			}
		};
	}
}
