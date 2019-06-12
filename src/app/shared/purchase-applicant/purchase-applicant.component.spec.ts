import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseApplicantComponent } from './purchase-applicant.component';

describe('PurchaseApplicantComponent', () => {
  let component: PurchaseApplicantComponent;
  let fixture: ComponentFixture<PurchaseApplicantComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PurchaseApplicantComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PurchaseApplicantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
