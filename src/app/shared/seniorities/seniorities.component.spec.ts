import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SenioritiesComponent } from './seniorities.component';

describe('SenioritiesComponent', () => {
  let component: SenioritiesComponent;
  let fixture: ComponentFixture<SenioritiesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SenioritiesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SenioritiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
