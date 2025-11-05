import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardPersonalComponent } from './dashboard-personal.component';

describe('DashboardPersonalComponent', () => {
  let component: DashboardPersonalComponent;
  let fixture: ComponentFixture<DashboardPersonalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardPersonalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardPersonalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
