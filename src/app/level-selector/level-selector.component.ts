import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-level-selector',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './level-selector.component.html',
  styleUrls: ['./level-selector.component.css'],
})
export class LevelSelectorComponent {
  selectedLevel: string = '';

  @Output() levelChosen = new EventEmitter<string>();

  onChangeLevel(): void {
    if (this.selectedLevel) {
      this.levelChosen.emit(this.selectedLevel);
    }
  }
}
