import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateCloseAccountComponent } from './update-close-account.component';

describe('UpdateCloseAccountComponent', () => {
  let component: UpdateCloseAccountComponent;
  let fixture: ComponentFixture<UpdateCloseAccountComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UpdateCloseAccountComponent]
    });
    fixture = TestBed.createComponent(UpdateCloseAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
