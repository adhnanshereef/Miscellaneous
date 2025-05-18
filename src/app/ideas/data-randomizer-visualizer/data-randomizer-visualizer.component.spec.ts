import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataRandomizerVisualizerComponent } from './data-randomizer-visualizer.component';

describe('DataRandomizerVisualizerComponent', () => {
  let component: DataRandomizerVisualizerComponent;
  let fixture: ComponentFixture<DataRandomizerVisualizerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataRandomizerVisualizerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DataRandomizerVisualizerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
