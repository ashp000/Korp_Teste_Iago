import { Component, inject } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { SettingsService, TamanhoFonte, Tema } from '../../core/services/settings.service';
import { TranslationService } from '../../core/services/translation.service';
import { Idioma } from '../../core/i18n/translations';

@Component({
  selector: 'app-settings-dialog',
  imports: [MatDialogModule, MatButtonModule, MatButtonToggleModule, MatIconModule],
  templateUrl: './settings-dialog.html',
  styleUrl: './settings-dialog.scss'
})
export class SettingsDialogComponent {
  protected settings = inject(SettingsService);
  protected i18n = inject(TranslationService);

  onFontSizeChange(valor: TamanhoFonte): void {
    this.settings.setFontSize(valor);
  }

  onTemaChange(valor: Tema): void {
    this.settings.setTema(valor);
  }

  onIdiomaChange(valor: Idioma): void {
    this.i18n.setIdioma(valor);
  }
}
