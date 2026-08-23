import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Produto, AtualizarProdutoPayload } from '../../core/models/produto.model';
import { HelpIconComponent } from '../../shared/help-icon/help-icon';
import { TranslationService } from '../../core/services/translation.service';

@Component({
  selector: 'app-produto-edit-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    HelpIconComponent
  ],
  templateUrl: './produto-edit-dialog.html',
  styleUrl: './produto-edit-dialog.scss'
})
export class ProdutoEditDialogComponent {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<ProdutoEditDialogComponent>);
  protected i18n = inject(TranslationService);
  produto = inject<Produto>(MAT_DIALOG_DATA);

  form = this.fb.nonNullable.group({
    descricao: [this.produto.descricao, [Validators.required, Validators.maxLength(200)]],
    saldo: [this.produto.saldo, [Validators.required, Validators.min(0)]]
  });

  salvar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload: AtualizarProdutoPayload = this.form.getRawValue();
    this.dialogRef.close(payload);
  }
}
