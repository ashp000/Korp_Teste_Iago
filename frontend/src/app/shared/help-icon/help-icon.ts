import { Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

// Ícone de "?" com tooltip, usado ao lado de campos de formulário pra explicar o que
// preencher — pode ser usado como matSuffix/matPrefix de um mat-form-field ou solto.
@Component({
  selector: 'app-help-icon',
  imports: [MatIconModule, MatTooltipModule],
  template: `
    <mat-icon class="help-icon" [matTooltip]="text()" matTooltipPosition="above" tabindex="0">
      help_outline
    </mat-icon>
  `,
  styles: `
    .help-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: #94a3b8;
      cursor: help;
      margin: 0 4px 0 6px;
      vertical-align: middle;
    }
  `
})
export class HelpIconComponent {
  text = input.required<string>();
}
