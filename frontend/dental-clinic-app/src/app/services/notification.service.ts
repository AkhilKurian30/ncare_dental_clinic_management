import { Injectable, inject } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private snackBar = inject(MatSnackBar);

  private defaultConfig: MatSnackBarConfig = {
    duration: 4000,
    horizontalPosition: 'end',
    verticalPosition: 'top',
  };

  success(message: string, duration: number = 4000): void {
    this.snackBar.open(message, '✓', {
      ...this.defaultConfig,
      duration,
      panelClass: ['toast-success']
    });
  }

  error(message: string, duration: number = 5000): void {
    this.snackBar.open(message, '✕', {
      ...this.defaultConfig,
      duration,
      panelClass: ['toast-error']
    });
  }

  warning(message: string, duration: number = 4500): void {
    this.snackBar.open(message, '⚠', {
      ...this.defaultConfig,
      duration,
      panelClass: ['toast-warning']
    });
  }

  info(message: string, duration: number = 4000): void {
    this.snackBar.open(message, 'ℹ', {
      ...this.defaultConfig,
      duration,
      panelClass: ['toast-info']
    });
  }

  custom(message: string, action: string = 'Close', config?: MatSnackBarConfig): void {
    this.snackBar.open(message, action, {
      ...this.defaultConfig,
      ...config
    });
  }
}
