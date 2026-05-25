import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { User, VerificationStatus } from '../models/user.model';
import { UserService } from '../services/user.service';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  standalone: false
})
export class DashboardComponent implements OnInit, AfterViewInit {
  currentUser: any = null;
  isLoading = true;
  errorMessage: string | null = null;
  todayDate: Date = new Date();

  // Stats Counters
  stats = {
    total: 0,
    verified: 0,
    pending: 0,
    failed: 0
  };

  // Table Configuration
  displayedColumns: string[] = ['id', 'name', 'email', 'department', 'joinedDate', 'status'];
  dataSource = new MatTableDataSource<User>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private userService: UserService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue;
    this.fetchRecords();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  fetchRecords(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.userService.getUsers().subscribe({
      next: (data) => {
        this.dataSource.data = data;
        this.calculateStats(data);
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error fetching records:', err);
        if (err.status === 401 || err.status === 403) {
          this.errorMessage = 'Session expired or unauthorized. Please re-login.';
        } else {
          this.errorMessage = 'Could not fetch records. Verify the API server is online.';
        }
      }
    });
  }

  calculateStats(users: User[]): void {
    this.stats = users.reduce((acc, user) => {
      acc.total++;
      if (user.status === 'Verified') acc.verified++;
      else if (user.status === 'Pending' || user.status === 'In Progress') acc.pending++;
      else if (user.status === 'Failed Verification') acc.failed++;
      return acc;
    }, { total: 0, verified: 0, pending: 0, failed: 0 });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  getStatusClass(status: VerificationStatus): string {
    switch (status) {
      case 'Verified':
        return 'badge-verified';
      case 'In Progress':
        return 'badge-progress';
      case 'Pending':
        return 'badge-pending';
      case 'Failed Verification':
        return 'badge-failed';
      default:
        return 'badge-pending';
    }
  }
}
