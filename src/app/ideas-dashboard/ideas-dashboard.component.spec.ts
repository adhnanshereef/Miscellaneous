import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IdeasDashboardComponent } from './ideas-dashboard.component';

describe('IdeasDashboardComponent', () => {
  let component: IdeasDashboardComponent;
  let fixture: ComponentFixture<IdeasDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IdeasDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IdeasDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
