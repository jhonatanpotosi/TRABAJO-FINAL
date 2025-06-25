import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LevelSelectorComponent } from './level-selector.component';

describe('LevelSelectorComponent', () => {
  let component: LevelSelectorComponent;
  let fixture: ComponentFixture<LevelSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LevelSelectorComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(LevelSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit level when onChangeLevel is called', () => {
  spyOn(component.levelChosen, 'emit');
  component.selectedLevel = 'facil';
  component.onChangeLevel();
  expect(component.levelChosen.emit).toHaveBeenCalledWith('facil');
});
});
