import { Subscriber } from 'rxjs/Subscriber';

export function AutoUnsubscribe( blackList: Array<string> = [] ) {
	return function ( constructor ) {
		const original = constructor.prototype.ngOnDestroy;
		constructor.prototype.ngOnDestroy = function () {
			for ( let prop in this ) {
				if (this.hasOwnProperty(prop)) {
					const property = this[ prop ];
					if ( blackList.indexOf(prop) < 0 ) {
						if ( property && ( typeof property.unsubscribe === 'function' ) && property instanceof Subscriber ) {
							property.unsubscribe();
						}
					}
				}
			}
			return original && typeof original === 'function' && original.apply(this, arguments);
		};
	};
}