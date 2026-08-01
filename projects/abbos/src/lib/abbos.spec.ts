import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Abbos } from './abbos';

describe('Abbos', () => {
  let component: Abbos;
  let fixture: ComponentFixture<Abbos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Abbos],
    }).compileComponents();

    fixture = TestBed.createComponent(Abbos);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
