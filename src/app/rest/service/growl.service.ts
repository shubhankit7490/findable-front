import {Injectable} from '@angular/core';

declare let moment: any;
declare let iziToast: any;

@Injectable()
export class GrowlService {
	constructor() {}

	static message(message = '', type = 'info', timeout = 3000) {
		let iziToastOptions = {
			class: 'iziToastPosition',
			title: '',
			message: message,
			transitionIn: 'flipInX',
			transitionOut: 'fadeOutUp',
			transitionInMobile: 'fadeInUp',
			transitionOutMobile: 'fadeOutDown',
			timeout: timeout,
			position: 'topCenter',
			close: false
		};
		iziToast[type](iziToastOptions);
	}
}