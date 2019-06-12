import {TestBed, inject} from '@angular/core/testing';

import {ProviderService} from './provider.service';

describe('AnalyticsService', () => {
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [ProviderService]
		});
	});

	it('should ...', inject([ProviderService], (service: ProviderService) => {
		expect(service).toBeTruthy();
	}));
});
