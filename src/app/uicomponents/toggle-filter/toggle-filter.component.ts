import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-toggle-filter',
  standalone: true,
  imports: [CommonModule, FormsModule],   // 👈 AGGIUNGI QUESTO
  templateUrl: './toggle-filter.component.html',
  styleUrls: ['./toggle-filter.component.scss']
})
export class ToggleFilterComponent {
  isEffortMode = false;

  @Output() filterChange = new EventEmitter<'storyPoints' | 'effortEstimation'>();

  emitChange() {
    const type = this.isEffortMode ? 'effortEstimation' : 'storyPoints';
    this.filterChange.emit(type);
  }
}
