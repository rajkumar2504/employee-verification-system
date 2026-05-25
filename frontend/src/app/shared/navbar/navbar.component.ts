import { Component, EventEmitter, Output, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { ThemeService } from '../../services/theme.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  standalone: false
})
export class NavbarComponent implements OnInit, OnDestroy {
  @Output() toggleSidebar = new EventEmitter<void>();
  
  currentUser: any = null;
  isDark = false;
  currentTime = '';
  private clockSub!: Subscription;

  constructor(
    private authService: AuthService,
    private themeService: ThemeService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });

    this.themeService.isDarkMode$.subscribe(dark => {
      this.isDark = dark;
    });

    this.updateTime();
    this.clockSub = interval(1000).subscribe(() => {
      this.updateTime();
    });
  }

  ngOnDestroy(): void {
    if (this.clockSub) {
      this.clockSub.unsubscribe();
    }
  }

  updateTime(): void {
    const now = new Date();
    this.currentTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }

  onToggleSidebar(): void {
    this.toggleSidebar.emit();
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
    const mode = this.isDark ? 'Dark Mode' : 'Light Mode';
    this.snackBar.open(`${mode} activated.`, 'Dismiss', {
      duration: 2000,
      horizontalPosition: 'right',
      verticalPosition: 'bottom'
    });
  }

  viewProfile(): void {
    this.snackBar.open('User profile information is managed by Active Directory.', 'Dismiss', {
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'bottom'
    });
  }

  openSettings(): void {
    this.snackBar.open('Security settings are locked by administrator policies.', 'Dismiss', {
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'bottom'
    });
  }

  logout(): void {
    this.authService.logout();
    this.snackBar.open('Logged out successfully.', 'Dismiss', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
    this.router.navigate(['/login']);
  }
}
