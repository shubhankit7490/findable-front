import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplicantSearchResultComponent } from './applicant-search-result.component';

describe('ApplicantSearchResultComponent', () => {
  let component: ApplicantSearchResultComponent;
  let fixture: ComponentFixture<ApplicantSearchResultComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ApplicantSearchResultComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplicantSearchResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
