import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class MessageService {
	public subject = new Subject<any>();

	sendMessage(message: any) {
		this.subject.next(message);
	}
	clearMessage() {
		this.subject.next();
	}

	getMessage() {
		return this.subject;
	}
}
