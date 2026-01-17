import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from '../../../services/auth.service';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
  adminOnly?: boolean;
}

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule
  ],
  templateUrl: './main-layout.html',
  styleUrls: ['./main-layout.scss']
})
export class MainLayoutComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  isSidenavOpened = signal(true);
  currentUser = this.authService.currentUser;

  menuItems: MenuItem[] = [
    { label: 'Dashboard', icon: 'home', route: '/dashboard' },
    { label: 'Patients', icon: 'people', route: '/patients' },
    { label: 'Appointments', icon: 'calendar_today', route: '/appointments' },
    { label: 'Treatments', icon: 'medical_services', route: '/treatments' },
    { label: 'Medicines', icon: 'medication', route: '/medicines' },
    { label: 'Invoices', icon: 'receipt', route: '/invoices' },
    { label: 'Expenses', icon: 'attach_money', route: '/expenses' },
    { label: 'Reports', icon: 'bar_chart', route: '/reports' },
    { label: 'Users', icon: 'admin_panel_settings', route: '/users', adminOnly: true }
  ];

  get filteredMenuItems(): MenuItem[] {
    const user = this.currentUser();
    if (!user) return [];
    
    return this.menuItems.filter(item => {
      if (item.adminOnly) {
        return user.role === 'ADMIN';
      }
      return true;
    });
  }

  toggleSidenav(): void {
    this.isSidenavOpened.update(value => !value);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  getUserDisplayName(): string {
    const user = this.currentUser();
    return user ? `${user.firstName} ${user.lastName}` : 'User';
  }

  getUserRole(): string {
    return this.currentUser()?.role || '';
  }
}
