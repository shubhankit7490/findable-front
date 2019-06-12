import { Injectable } from '@angular/core';

declare let ga;

@Injectable()
export class AnalyticsService {

	constructor() { }

	public emitEvent(eventCategory: string, eventAction: string, eventLabel: string = null, eventValue: number = null) {
		ga('send', 'event', {
			eventCategory: eventCategory,
			eventLabel: eventLabel,
			eventAction: eventAction,
			eventValue: eventValue
		});
	}

	public emitPageview( page = null) {
		if ( ! page ) {
			ga('send', 'pageview', document.location.pathname);
		} else {
			ga('send', 'pageview', page);
		}
	}
}
