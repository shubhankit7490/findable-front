import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ArraySelectorComponent } from './array-selector.component';

describe('ArraySelectorComponent', () => {
  let component: ArraySelectorComponent;
  let fixture: ComponentFixture<ArraySelectorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ArraySelectorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ArraySelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
