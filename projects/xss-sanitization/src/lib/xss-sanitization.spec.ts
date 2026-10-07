import { ComponentFixture, TestBed } from '@angular/core/testing';

import { XssSanitization } from './xss-sanitization';

describe('XssSanitization', () => {
  let component: XssSanitization;
  let fixture: ComponentFixture<XssSanitization>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [XssSanitization],
    }).compileComponents();

    fixture = TestBed.createComponent(XssSanitization);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
