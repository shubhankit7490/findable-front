import { Injectable } from '@angular/core';

@Injectable()
export class ChartDataService {

	data = {};

	constructor() {
	}

	public add(storeName, userId, data) {
		if (!this.data[userId]) {
			this.initUserData(userId);
		}

		this.data[userId][storeName] = data;
	}

	public getData(storeName, userId) {
		if (!this.data[userId] || !this.data[userId][storeName]) {
			return false;
		} else {
			return this.data[userId][storeName];
		}
	}

	public reset() {
		for (let value in this.data) {
			this.data[value] = [];
		}
	}

	private initUserData(userId) {
		this.data[userId] = {
			experience: {},
			education: {},
			skills: {}
		}
	}


}
