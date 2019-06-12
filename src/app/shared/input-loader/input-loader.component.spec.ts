import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InputLoaderComponent } from './input-loader.component';

describe('InputLoaderComponent', () => {
  let component: InputLoaderComponent;
  let fixture: ComponentFixture<InputLoaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InputLoaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InputLoaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
