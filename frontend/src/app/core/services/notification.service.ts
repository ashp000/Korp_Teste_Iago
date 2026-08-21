import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private snackBar = inject(MatSnackBar);

  success(mensagem: string): void {
    this.snackBar.open(mensagem, 'Fechar', { duration: 4000, panelClass: 'snackbar-success' });
  }

  error(mensagem: string): void {
    this.snackBar.open(mensagem, 'Fechar', { duration: 6000, panelClass: 'snackbar-error' });
  }
}
