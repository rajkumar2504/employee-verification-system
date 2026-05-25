import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { AuthService } from './auth/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.css',
})
export class App implements OnInit {
  isLoggedIn = false;
  sidenavOpened = true;
  sidenavMode: 'side' | 'over' = 'side';

  @ViewChild('sidenav') sidenav!: MatSidenav;

  private authService = inject(AuthService);

  ngOnInit(): void {
    // Watch authentication state to show/hide menus
    this.authService.currentUser$.subscribe(user => {
      this.isLoggedIn = !!user;
      this.sidenavOpened = this.isLoggedIn && window.innerWidth >= 992;
      this.updateResponsiveLayout();
    });

    // Listen to resize events
    window.addEventListener('resize', () => {
      this.updateResponsiveLayout();
    });
  }

  updateResponsiveLayout(): void {
    if (window.innerWidth < 992) {
      this.sidenavMode = 'over';
      if (!this.isLoggedIn) {
        this.sidenavOpened = false;
      }
    } else {
      this.sidenavMode = 'side';
      this.sidenavOpened = this.isLoggedIn;
    }
  }

  toggleSidenav(): void {
    this.sidenavOpened = !this.sidenavOpened;
  }

  onNavItemClicked(): void {
    if (this.sidenavMode === 'over') {
      this.sidenavOpened = false;
    }
  }
}
