import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpenAccountComponent } from './open-account.component';

describe('OpenAccountComponent', () => {
  let component: OpenAccountComponent;
  let fixture: ComponentFixture<OpenAccountComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [OpenAccountComponent]
    });
    fixture = TestBed.createComponent(OpenAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
