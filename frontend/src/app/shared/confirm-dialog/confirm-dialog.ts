import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { TranslationService } from '../../core/services/translation.service';

export interface ConfirmDialogData {
  titulo: string;
  mensagem: string;
  confirmarLabel?: string;
  cancelarLabel?: string;
}

@Component({
  selector: 'app-confirm-dialog',
  imports: [MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>{{ data.titulo }}</h2>
    <mat-dialog-content>{{ data.mensagem }}</mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="false">{{ data.cancelarLabel ?? i18n.t('common.cancelar') }}</button>
      <button mat-flat-button color="warn" [mat-dialog-close]="true">
        {{ data.confirmarLabel ?? i18n.t('common.excluir') }}
      </button>
    </mat-dialog-actions>
  `
})
export class ConfirmDialogComponent {
  data = inject<ConfirmDialogData>(MAT_DIALOG_DATA);
  protected i18n = inject(TranslationService);
}
