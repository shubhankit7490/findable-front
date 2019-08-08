import { Injectable } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/share';
import 'rxjs/add/operator/delay';

import { DataService } from './data.service';
import * as models from '../model/models';
import { CookieOptions, CookieService } from 'ngx-cookie';

@Injectable()

/**
 * AuthService is the authentication service for Findable.
 *
 * Handles login and logout, setting and removing local session and local storage of
 * current user details (mainly the API key)
 */
export class AuthService {

	isLoggedIn = false;
	currentUser: models.User = null;
	currentBusiness: models.BusinessRecord = null;
	returnUrl: string;
	rememberMe: boolean;
	redirectUrl: string;
	profile: models.PersonalDetails = null;
	isLocalStorageSupported = true;

	/**
	 * When loaded, authService is checking for stored credentials (session storage)
	 * and sets isLoggedIn to true, for the authGuard.
	 * it also sets the API key for the dataService, to allow API requests.
	 *
	 * @param dataService
	 * @param route
	 */
	constructor(
		public dataService: DataService,
		public route: ActivatedRoute,
		public router: Router,
		public cookieService: CookieService,
	) {
		this.isLocalStorageSupported = this.isStorageSupported();

		this.currentUser = this.getItem('currentUser');
		this.profile = this.getItem('currentProfile');
		this.rememberMe = this.getItem('rememberMe');

		// If current user exist, allow access.
		if (!!this.currentUser) {
			this.isLoggedIn = true;
			this.dataService.apiKey = this.currentUser.key;
		}
	}

	getUserId() {
		if (this.currentUser.hasOwnProperty('key') && this.currentUser['active_user_id'] && this.currentUser.role === 'admin') {
			return this.currentUser['active_user_id'];
		} else {
			return this.currentUser.user_id;
		}
	}

	/**
	 * Login the user into the system.
	 * Upon successful login - set session data and isLoggedIn flag.
	 *
	 * @param username
	 * @param password
	 * @param rememberMe - boolean, true if "Remember Me" checkbox is checked.
	 * @param applyId - integer. The business ID the user will apply to upon login
	 * @returns {Observable<models.User>}
	 */
	login(username: string, password: string, rememberMe: boolean, applyId?: number): Observable<models.User> {
		let responsePromise = this.dataService.login(username, password, applyId);
		responsePromise.subscribe(
			response => {
				this.isLoggedIn = true;
				this.rememberMe = rememberMe; // Set from login form, not from server response.
				this.currentUser = response;
				this.setItem('currentUser', this.currentUser);
				this.setItem('rememberMe', this.rememberMe);

				// if (this.rememberMe) {
				// 	localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
				// }
				// sessionStorage.setItem('currentUser', JSON.stringify(this.currentUser));
				//
				// // Set "Remember Me" according to user selection
				// localStorage.setItem('rememberMe', JSON.stringify(this.rememberMe));
			},
			error => {
				this.isLoggedIn = false;
			}
		);

		return responsePromise;
	}

	update(key?: string, model?: any, storageKey?: string) {
		this[key] = model;
		this.setItem(storageKey || key, model);
		// if (this.rememberMe) {
		// 	localStorage.setItem(storageKey || key, JSON.stringify(this[key]));
		// }
		// sessionStorage.setItem(storageKey || key, JSON.stringify(this[key]));
	}

	logout(): void {
		this.isLoggedIn = false;
		this.currentUser = null;
		// localStorage.removeItem('currentUser'); // But leave "Remember Me" for next session
		// sessionStorage.removeItem('currentUser');
		// localStorage.removeItem('currentProfile');
		// sessionStorage.removeItem('currentProfile');
		this.deleteItem();
		// get return url from route parameters or default to '/'
		this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
	}

	checkUserStatus(user: models.User) {

		const userPending = models.User.StatusEnum.Pending;
		const userActive = models.User.StatusEnum.Active;
		
		if (this.isLoggedIn) {
			switch (user['role']) {
				case 'applicant':
					if (user.status === userActive || user.status === userPending) {
						// once user signs up will be passing through here
						this.router.navigate([this.redirectUrl || '/dashboard']);
					} else {
						this.router.navigate(['/user/login']);
					}
					break;
				case 'recruiter':
					/*if (user.status === userActive) {
						this.router.navigate([this.redirectUrl || '/business/search']);
					} else if (user.status === userPending) {
						this.router.navigate(['user/signup/thank']);
					} else {
						this.router.navigate(['/user/login']);
					}*/
					if (user.status === userActive) {
						this.router.navigate([this.redirectUrl || '/business/search']);
					} else if (user.status === userPending) {
						this.router.navigate([this.redirectUrl || '/business/search']);
					} else {
						this.router.navigate([this.redirectUrl || '/business/search']);
					}
					break;
				case 'manager':
					if (user.status === userActive || user.status === userPending) {
						const Setup = models.BusinessRecord.StatusEnum.Setup;
						const PendingBiz = models.BusinessRecord.StatusEnum.Pending;
						const ActiveBiz = models.BusinessRecord.StatusEnum.Active;

						if (user['business_id']) {
							this.dataService.get_business_setup_status(user.business_id).subscribe(
								responseBizRecord => {
									this.currentBusiness = responseBizRecord;
									if (responseBizRecord.status === Setup) {
										this.router.navigate(['/business/setup']);
									} else if (responseBizRecord.status === ActiveBiz || user.status === PendingBiz) {
										this.router.navigate([this.redirectUrl || '/business/search']);
									} else {
										this.logout();
										this.router.navigate(['/user/login']);
									}
								},
								error => {
									console.log('@authService > checkUserStatus [ERROR]:', error);
								}
							);
						} else {
							let i = true;
							if (i) {
								this.router.navigate(['/business/setup']);
								i = false;
							}
						}
					} else {
						console.log('@authService > checkUserStatus [manager] fail');
						this.router.navigate(['/user/login']);
					}
					break;
				case 'admin':
					if(!!user['active_user_id']) {
						this.router.navigate([this.redirectUrl || '/dashboard']);
					} else if (!!user['active_business_id']) {
						const Setup = models.BusinessRecord.StatusEnum.Setup;
						const PendingBiz = models.BusinessRecord.StatusEnum.Pending;
						const ActiveBiz = models.BusinessRecord.StatusEnum.Active;

						this.dataService.get_business_setup_status(user['active_business_id']).subscribe(
							responseBizRecord => {
								this.currentBusiness = responseBizRecord;
								if (responseBizRecord.status === Setup) {
									this.router.navigate(['/business/setup']);
								} else if (responseBizRecord.status === ActiveBiz || user.status === PendingBiz) {
									this.router.navigate([this.redirectUrl || '/business/search']);
								} else {
									this.logout();
									this.router.navigate(['/user/login']);
								}
							},
							error => {
								console.log('@authService > checkUserStatus [ERROR]:', error);
							}
						);
					}
					else {
						this.router.navigate(['/']);
					}
					break;
				default:
					this.router.navigate(['/']);
			}
		} else {
			this.router.navigate(['user/login']);
		}
	}

	private isStorageSupported(): boolean {
		let test = 'test';
		try {
			localStorage.setItem(test, test);
			localStorage.removeItem(test);
			return true;
		} catch (e) {
			return false;
		}
	}

	public setItem(key?: string, model?: any, storageKey?: string, options?: CookieOptions): void {
		if (!this.isLocalStorageSupported) {
			this.cookieService.put(key, model, {
				expires: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
			});
		} else {
			if (this.rememberMe) {
				localStorage.setItem(storageKey || key, JSON.stringify(model));
				/**
				 * set cross domain & subdomain findable user cookie
				 * welcome.findable.co checks if the cookie name exists,
				 * if it does, will push existing user to user/login
				 */
				this.cookieService.put('findable_user_XD', JSON.stringify(model), {
					expires: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
				});
			}
			sessionStorage.setItem(storageKey || key, JSON.stringify(model));
		}
	}

	public updateItem(key?: string, model?: any, storageKey?: string, options?: CookieOptions): void {
		if (!this.isLocalStorageSupported) {
			this.cookieService.put(key, model, {
				expires: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
			});
		} else {
			if (this.rememberMe) {
				localStorage.setItem(storageKey || key, JSON.stringify(model));
			}
			sessionStorage.setItem(storageKey || key, JSON.stringify(model));
		}
	}

	public getItem(key: string) {
		if (!this.isLocalStorageSupported) {
			return this.cookieService.get(key);
		} else {
			if (!!localStorage.getItem(key)) {
				try {
					return JSON.parse(localStorage.getItem(key));
				} catch (e) {
					return false;
				}
			} else if (!!sessionStorage.getItem(key)) {
				try {
					return JSON.parse(sessionStorage.getItem(key));
				} catch (e) {
					return false;
				}
			} else {
				return false;
			}
		}
	}

	public deleteItem(key?: string): void {
		if (!this.isLocalStorageSupported) {
			if (!key) {
				this.cookieService.removeAll();
			} else {
				this.cookieService.remove(key);
			}
		} else {
			if (!key) {
				localStorage.removeItem('currentUser');
				sessionStorage.removeItem('currentUser');
				localStorage.removeItem('currentProfile');
				sessionStorage.removeItem('currentProfile');
				localStorage.removeItem('tour-ended');
				sessionStorage.removeItem('tour-ended');
				localStorage.removeItem('rememberMe');
				sessionStorage.removeItem('rememberMe');
				// remove cross domain & subdomain cookie, pushing user to welcome page:
				this.cookieService.remove('findable_user_XD');
			} else {
				localStorage.removeItem(key);
				sessionStorage.removeItem(key);
			}
		}
	}
}
