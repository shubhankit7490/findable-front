import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SchoolNameComponent } from './school-name.component';

describe('SchoolNameComponent', () => {
  let component: SchoolNameComponent;
  let fixture: ComponentFixture<SchoolNameComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SchoolNameComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SchoolNameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
