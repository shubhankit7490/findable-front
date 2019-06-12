import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {AuthService} from '../rest/service/auth.service';

declare let jQuery;

@Injectable()
export class TourService {
	defaults = {
		title: 'hello popover',
		width: 300,
		height: 200,
		placement: 'top',
		backdrop: true,
		style: 'popover-component center',
		animation: 'pop',
		keepfocus: false,
		focusdelay: 300,
		type: 'html',
		opentransitionend: function (el) {
			if (!!this.currentSection.scrollTo) {
				jQuery('body, html').animate({scrollTop: jQuery(el).offset().top - 300});
			}
		}.bind(this)
	};
	public label = 'Next';
	public label_exit = 'End Tour';

	public arrowClass = '';

	public tourEnded = false;

	public sections = {
		welcome: false,
		personal: true,
		personal_details: true,
		status: true,
		status_edit: true,
		experience: true,
		experience_edit: true,
		education: true,
		education_edit: true,
		skills: true,
		skills_edit: true,
		languages: true,
		languages_edit: true,
		traits: true,
		traits_edit: true,
		finish: false
	};

	public reported = {
		welcome: false,
		personal: false,
		personal_details: false,
		status: false,
		status_edit: false,
		experience: false,
		experience_edit: false,
		education: false,
		education_edit: false,
		skills: false,
		skills_edit: false,
		languages: false,
		languages_edit: false,
		traits: false,
		traits_edit: false,
		finish: false
	};

	collected = 2;
	step = 0;
	current: any = false;
	shown: any = false;
	currentSection: any = false;
	activeSection: any = false;

	public steps = {
		welcome: {
			selector: 'body',
			id: '#welcome_popup',
			hideNext: false,
			arrow: false,
			scrollTo: true,
			options: {
				transition: '0.3s all 0s',
				autoopen: true,
				horizontal: 'center',
				vertical: 'center',
				blur: false,
				escape: false
			}
		},
		personal: {
			selector: '#personal-details-edit-link',
			id: '#personal_popup',
			hideNext: true,
			scrollTo: true,
			arrow: {
				position: 'top',
				align: 'center'
			},
			options: {
				type: 'tooltip',
				transition: '0.3s all 0s',
				autoopen: true,
				horizontal: 'center',
				vertical: 'bottom',
				blur: false,
				escape: false
			}
		},
		personal_details: {
			selector: '#personal-details-save-button',
			id: '#personal_details_popup',
			hideNext: true,
			scrollTo: false,
			arrow: {
				position: 'right',
				align: 'center'
			},
			options: {
				type: 'tooltip',
				transition: '0.3s all 0s',
				autoopen: true,
				horizontal: 'left',
				vertical: 'center',
				blur: false,
				escape: false
			}
		},
		status: {
			selector: '#preferences_edit_section_link',
			id: '#status_popup',
			hideNext: true,
			scrollTo: true,
			arrow: {
				position: 'bottom',
				align: 'center'
			},
			options: {
				type: 'tooltip',
				transition: '0.3s all 0s',
				autoopen: true,
				horizontal: 'center',
				vertical: 'top',
				closeelement: '#status_edit_popup',
				blur: false,
				escape: false,
				onopen: function(){
				}
			}
		},
		status_edit: {
			selector: '#status-experience-dialog-done',
			id: '#status_edit_popup',
			hideNext: true,
			scrollTo: false,
			arrow: {
				position: 'left',
				align: 'center'
			},
			options: {
				type: 'tooltip',
				transition: '0.3s all 0s',
				horizontal: 'right',
				vertical: 'center',
				blur: false,
				escape: false,
				onopen: function () {
					$('#status_edit_popup_wrapper').detach().appendTo('#fnd-pref-submit-container-id');
				}
			}
		},
		experience: {
			selector: '#tour-step-four',
			id: '#experience_popup',
			hideNext: true,
			scrollTo: true,
			arrow: {
				position: 'bottom',
				align: 'center'
			},
			options: {
				type: 'tooltip',
				transition: '0.3s all 0s',
				autoopen: true,
				horizontal: 'center',
				vertical: 'top',
				closeelement: '#experience_edit_popup',
				blur: false,
				escape: false
			}
		},
		experience_edit: {
			selector: '#fnd-experience-dialog-done',
			id: '#experience_edit_popup',
			hideNext: true,
			scrollTo: false,
			arrow: {
				position: 'right',
				align: 'center'
			},
			options: {
				type: 'tooltip',
				transition: '0.3s all 0s',
				horizontal: 'left',
				vertical: 'center',
				blur: false,
				escape: false,
				onopen: function () {
					$('#experience_edit_popup_wrapper').detach().appendTo('#fnd-experience-dialog-done');
				}
			}
		},
		education: {
			selector: '#tour-step-five',
			id: '#education_popup',
			hideNext: true,
			scrollTo: true,
			arrow: {
				position: 'bottom',
				align: 'center'
			},
			options: {
				type: 'tooltip',
				transition: '0.3s all 0s',
				autoopen: true,
				horizontal: 'center',
				vertical: 'top',
				closeelement: '#experience_edit_popup',
				blur: false,
				escape: false
			}
		},
		education_edit: {
			selector: '#fnd-education-dialog-done',
			id: '#education_edit_popup',
			hideNext: true,
			scrollTo: false,
			arrow: {
				position: 'right',
				align: 'center'
			},
			options: {
				type: 'tooltip',
				transition: '0.3s all 0s',
				horizontal: 'left',
				vertical: 'center',
				blur: false,
				escape: false
			}
		},
		skills: {
			selector: '#tour-step-six',
			id: '#skills_popup',
			hideNext: true,
			scrollTo: true,
			arrow: {
				position: 'bottom',
				align: 'center'
			},
			options: {
				type: 'tooltip',
				transition: '0.3s all 0s',
				autoopen: true,
				horizontal: 'center',
				vertical: 'top',
				closeelement: '#skills_edit_popup',
				blur: false,
				escape: false
			}
		},
		skills_edit: {
			selector: '#fnd-form-submit-container-id',
			id: '#skills_edit_popup',
			hideNext: true,
			scrollTo: false,
			arrow: {
				position: 'left',
				align: 'center'
			},
			options: {
				type: 'tooltip',
				transition: '0.3s all 0s',
				horizontal: 'right',
				vertical: 'topedge',
				blur: false,
				escape: false,
				pagecontainer: '.fnd-skills-modal-container',
				onopen: function () {
					$('#skills_edit_popup_wrapper').detach().appendTo('#fnd-form-submit-container-id');
				}
			}
		},
		languages: {
			selector: '#tour-step-seven',
			id: '#languages_popup',
			hideNext: true,
			scrollTo: true,
			arrow: {
				position: 'bottom',
				align: 'center'
			},
			options: {
				type: 'tooltip',
				transition: '0.3s all 0s',
				autoopen: true,
				horizontal: 'center',
				vertical: 'top',
				closeelement: '#languages_edit_popup',
				blur: false,
				escape: false
			}
		},
		languages_edit: {
			selector: '#language_modal_done_button',
			id: '#languages_edit_popup',
			hideNext: true,
			scrollTo: false,
			arrow: {
				position: 'left',
				align: 'center'
			},
			options: {
				type: 'tooltip',
				transition: '0.3s all 0s',
				horizontal: 'right',
				vertical: 'topedge',
				blur: false,
				escape: false,
				onopen: function () {
					$('#languages_edit_popup_wrapper').detach().appendTo('#language_modal_done_button');
				}
			}
		},
		traits: {
			selector: '#tour-step-eight',
			id: '#traits_popup',
			hideNext: true,
			scrollTo: true,
			arrow: {
				position: 'bottom',
				align: 'center'
			},
			options: {
				type: 'tooltip',
				transition: '0.3s all 0s',
				autoopen: true,
				horizontal: 'center',
				vertical: 'top',
				closeelement: '#traits_edit_popup',
				blur: false,
				escape: false
			}
		},
		traits_edit: {
			selector: '#traits_edit_save_button',
			id: '#traits_edit_popup',
			hideNext: true,
			scrollTo: false,
			arrow: {
				position: 'left',
				align: 'center'
			},
			options: {
				type: 'tooltip',
				transition: '0.3s all 0s',
				horizontal: 'right',
				vertical: 'topedge',
				blur: false,
				escape: false,
				onopen: function () {
					$('#traits_edit_popup_wrapper').detach().appendTo('#fnd-traits-submit-container-id');
				}
			}
		},
		finish: {
			selector: 'body',
			id: '#finish_popup',
			hideNext: true,
			arrow: false,
			scrollTo: true,
			options: {
				type: 'html',
				transition: '0.3s all 0s',
				autoopen: true,
				horizontal: 'center',
				vertical: 'center',
				blur: false,
				escape: false
			}
		},
	};

	public tourStepsList: { id: string, congratesMessage: string, currentTask: string }[] = [
		{
			id: 'welcome',
			congratesMessage: 'Congratulation, your Findable Account has been created successfuly.',
			currentTask: 'Now, lets build your virtual resume and become Findable.',
		},
		{
			id: 'personal',
			congratesMessage: 'Lets start by updating your Personal Info.',
			currentTask: 'Click on “Edit Section” to continue.',
		},
		{
			id: 'status',
			congratesMessage: 'Lets add your current Status & Preferences.',
			currentTask: 'Click on ”Edit Section” to open the current Status and Preferences settings.',
		},
		{
			id: 'status_edit',
			congratesMessage: 'Click on “Done” to save and exit edit mode.',
			currentTask: 'Take your time, I will wait here.',
		},
		{
			id: 'experience',
			congratesMessage: 'Lets add a work Experience.',
			currentTask: 'Click on ”Edit Section” to open the Experience settings.',
		},
		{
			id: 'experience_edit',
			congratesMessage: 'Click on “Done” once you"re done.',
			currentTask: 'Take your time, I will wait here.',
		},
		{
			id: 'education',
			congratesMessage: 'Lets add an Education experience.',
			currentTask: 'Click on “Edit Section” to open Education settings.',
		},
		{
			id: 'education_edit',
			congratesMessage: 'Click on “Done” once you"re done.',
			currentTask: 'Take your time, I will wait here.',
		},

		{
			id: 'skills',
			congratesMessage: 'Lets add some personal Skills',
			currentTask: 'Click on “Edit Section” to open Skills settings.',
		},
		{
			id: 'skills_edit',
			congratesMessage: 'Click on “Done” once you"re done.',
			currentTask: 'Take your time, I will wait here.',
		},
		{
			id: 'languages',
			congratesMessage: 'Lets add  details about languages you speak, read or write in.',
			currentTask: 'Click on ”Edit Section” to open the Language settings.',
		},
		{
			id: 'languages_edit',
			congratesMessage: 'Click on “Done” once you"re done.',
			currentTask: 'Take your time, I will wait here.',
		},
		{
			id: 'traits',
			congratesMessage: 'Lets add some personal Traits.',
			currentTask: 'Click on ”Edit Section” to open the personal Traits settings.',
		},
		{
			id: 'traits_edit',
			congratesMessage: 'Click on “Done” once you"re done.',
			currentTask: 'Take your time, I will wait here.',
		}
	];

	constructor(public router: Router, public authService: AuthService) {
		this.tourEnded = this.authService.getItem('tour-ended');
	}

	resetCollection() {
		this.reported = {
			welcome: false,
			personal: false,
			personal_details: false,
			status: false,
			status_edit: false,
			experience: false,
			experience_edit: false,
			education: false,
			education_edit: false,
			skills: false,
			skills_edit: false,
			languages: false,
			languages_edit: false,
			traits: false,
			traits_edit: false,
			finish: false
		};

		this.collected = 2;
	}

	public collect(section, status) {
		if (!this.reported[section]) {
			this.reported[section] = true;
			this.sections[section] = status;
			if (status == true && !this.sections.welcome) {
				this.sections.welcome = true;
				this.sections.finish = true;
			}
			this.collected++;
			if (this.collected === Object.keys(this.sections).length) {
				if (!this.tourEnded) {
					this.initSection();
				}
			}
		}
	}

	public closeAll() {
		for (let step in this.steps) {
			if (this.steps.hasOwnProperty(step)) {
				if (!!jQuery(this.steps[step].id).length) {
					jQuery(this.steps[step].id).popup('hide');
				}
			}
		}
	}

	public sleep(step = '') {
		if (this.shown && !this.tourEnded && this.activeSection !== step) {
			this.closeAll();
			this.shown = false;
			this.tourEnded = true;

			for (let section in this.sections) {
				if (this.sections.hasOwnProperty(section)) {
					this.sections[section] = false;
				}
			}
		}
	}

	public doNext(node = '') {
		switch (node) {
			case 'personal':
				this.router.navigate(['/user/personal-details']);
				break;
			case 'personal_details':
				this.router.navigate(['/dashboard']);
				break;
			case 'experience_edit_form':
				jQuery('.fnd-exp-modal .close').click();
				break;
			case 'education_edit_form':
				jQuery('.fnd-pref-modal .close').click();
				break;
			case 'skills_edit_form':
				jQuery('.fnd-pref-modal .close').click();
				break;
			case 'languages_edit_form':
				jQuery('.fnd-languages-modal .close').click();
				break;
			case 'traits_edit_form':
				jQuery('.fnd-traits-modal .close').click();
				break;
		}
	}

	private validateStep(e?: any) {
		if (!e) {
			return true;
		} else if (e && 'srcElement' in e) {
			let clickedID = e.srcElement.id;
			switch (this.activeSection) {
				case 'welcome':
				case 'finish':
					return true;
				case 'personal':
					return clickedID === 'personal-details-edit-link';
				case 'status':
					return clickedID === 'preferences_edit_section_link';
				case 'traits':
					return clickedID === 'tour-step-eight';
				case 'languages':
					return clickedID === 'tour-step-seven';
				case 'skills':
					return clickedID === 'tour-step-six' || clickedID === 'skl-chart-item-bg-icon' || clickedID === 'skl-chart-item-bg-text';
				case 'education':
					return clickedID === 'tour-step-five' || clickedID === 'edu-chart-item-bg-icon' || clickedID === 'edu-chart-item-bg-text';
				case 'experience':
					return clickedID === 'tour-step-four' || clickedID === 'exp-chart-item-bg-icon' || clickedID === 'exp-chart-item-bg-text' || clickedID === 'rsp-chart-item-bg-icon' || clickedID === 'rsp-chart-item-bg-text';
				case 'experience_edit':
					return clickedID === 'fnd-experience-dialog-done-button';
				case 'education_edit':
					return clickedID === 'fnd-education-dialog-done-button';
				case 'skills_edit':
					return clickedID === 'fnd-skills-dialog-done-button';
				case 'languages_edit':
					return clickedID === 'fnd-languages-dialog-done-button';
				case 'traits_edit':
					return clickedID === 'traits-dialog-form';
			}
		}

		return false;
	}

	public initSection(e?: Event) {
		if (this.authService.currentUser.role !== 'applicant') {
			this.sleep();
			return false;
		}
		if (!this.validateStep(e)) {
			this.sleep();
			return false;
		}
		if (this.tourEnded) {
			return false;
		}

		if (this.currentSection !== false) {
			jQuery(this.currentSection.id).popup('hide');
		}
		if (e) {
			e.preventDefault();
		}

		if (e) {
			let parentId = e.srcElement.parentElement.id.replace('_popup', '');
			this.doNext(parentId);
		}

		this.shown = false;
		let filtered = {};

		for (let section in this.sections) {
			if (this.sections.hasOwnProperty(section)) {
				if (!!this.sections[section] && !this.shown && !this.tourEnded) {
					this.sections[section] = !this.sections[section];
					this.shown = true;

					filtered = this.filter(this.sections, function (item) {
						return item === false;
					});

					if (Object.keys(filtered).length === 0) {
						this.label_exit = 'Finish';
					}

					if (!jQuery(this.steps[section].id).length || !jQuery(this.steps[section].selector).length) {
						this.wait(this.steps[section].id, this.steps[section].selector, function () {
							this.closeAll();
							this.steps[section].options.tooltipanchor = jQuery(this.steps[section].selector);

							if (this.steps[section].arrow !== false) {
								this.arrowClass = 'arrow ' + this.steps[section].arrow.position + '-' + this.steps[section].arrow.align;
							} else {
								this.arrowClass = '';
							}

							this.currentSection = this.steps[section];
							this.activeSection = section;
							jQuery(this.steps[section].id).popup(Object.assign(this.defaults, this.steps[section].options));
						}.bind(this));
					} else {
						this.closeAll();
						this.steps[section].options.tooltipanchor = jQuery(this.steps[section].selector);

						if (this.steps[section].arrow !== false) {
							this.arrowClass = 'arrow ' + this.steps[section].arrow.position + '-' + this.steps[section].arrow.align;
						} else {
							this.arrowClass = '';
						}

						this.currentSection = this.steps[section];
						this.activeSection = section;
						jQuery(this.steps[section].id).popup(Object.assign(this.defaults, this.steps[section].options));
					}
				}
			}
		}

		if (!this.shown) {
			this.neverAgain();
		}
	}

	public neverAgain(e?: Event) {
		if (e) {
			e.preventDefault();
			e.stopPropagation();
		}
		this.closeAll();
		this.authService.setItem('tour-ended', true);
		this.tourEnded = true;
	}

	public wait(id = '', tooltip = '', callback: Function = function () {
	}) {
		if (!!jQuery(id).length && !!jQuery(tooltip).length) {
			setTimeout(() => {
				callback.call(this);
			}, 1500);
		} else {
			setTimeout(() => {
				this.wait(id, tooltip, callback);
			}, 50);
		}
	}

	public pop(step = '') {
		if (this.authService.currentUser.role !== 'applicant') {
			this.sleep();
			return false;
		}

		if (!this.tourEnded) {
			this.shown = true;
			this.sections[step] = false;
			this.activeSection = step;
			this.currentSection = this.steps[step];
			this.steps[step].options.tooltipanchor = jQuery(this.steps[step].selector);

			if (this.steps[step].arrow !== false) {
				this.arrowClass = 'arrow ' + this.steps[step].arrow.position + '-' + this.steps[step].arrow.align;
			} else {
				this.arrowClass = '';
			}

			jQuery(this.steps[step].id).popup(Object.assign(this.defaults, this.steps[step].options));
		}
	}

	public markAsOpened(step = '') {
		this.reported[step] = true;
		this.sections[step] = false;
	}

	private filter = function (obj, predicate) {
		let result = {}, key;
		for (key in obj) {
			if (obj.hasOwnProperty(key) && !predicate(obj[key])) {
				result[key] = obj[key];
			}
		}

		return result;
	};
}
