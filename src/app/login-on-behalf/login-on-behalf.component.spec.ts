import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginOnBehalfComponent } from './login-on-behalf.component';

describe('LoginOnBehalfComponent', () => {
  let component: LoginOnBehalfComponent;
  let fixture: ComponentFixture<LoginOnBehalfComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoginOnBehalfComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginOnBehalfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
