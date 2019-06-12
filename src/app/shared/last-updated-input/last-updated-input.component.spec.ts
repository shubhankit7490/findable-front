import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LastUpdatedInputComponent } from './last-updated-input.component';

describe('LastUpdatedInputComponent', () => {
  let component: LastUpdatedInputComponent;
  let fixture: ComponentFixture<LastUpdatedInputComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LastUpdatedInputComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LastUpdatedInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
