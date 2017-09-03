import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckTradeComponent } from './check-trade.component';

describe('CheckTradeComponent', () => {
  let component: CheckTradeComponent;
  let fixture: ComponentFixture<CheckTradeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CheckTradeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckTradeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
