import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PartnerSearchResultComponent } from './partner-search-result.component';

describe('PartnerSearchResultComponent', () => {
  let component: PartnerSearchResultComponent;
  let fixture: ComponentFixture<PartnerSearchResultComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PartnerSearchResultComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PartnerSearchResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
