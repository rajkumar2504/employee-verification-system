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
  selectedCandidate: User | null = null;

  recentActivities = [
    { type: 'verified', text: 'Verification approved for Raj Kumar', time: '12 mins ago', icon: 'check_circle' },
    { type: 'progress', text: 'Identity documents uploaded for Alice Smith', time: '2 hours ago', icon: 'cloud_upload' },
    { type: 'failed', text: 'Screening discrepancy flagged for David Lee', time: '1 day ago', icon: 'warning' },
    { type: 'progress', text: 'Past references check completed for John Doe', time: '1 day ago', icon: 'business' },
    { type: 'verified', text: 'Verification certified clear for Sarah Connor', time: '3 days ago', icon: 'verified' }
  ];

  // Stats Counters
  stats = {
    total: 0,
    verified: 0,
    pending: 0,
    failed: 0,
    admin: 0
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
    this.selectedCandidate = null;

    this.userService.getUsers().subscribe({
      next: (data) => {
        this.dataSource.data = data;
        this.calculateStats(data);
        this.isLoading = false;
        // Auto-select the first candidate in the list if available
        if (data.length > 0) {
          this.selectedCandidate = data[0];
        }
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
      
      if (user.role === 'Admin') acc.admin++;
      return acc;
    }, { total: 0, verified: 0, pending: 0, failed: 0, admin: 0 });
  }

  selectCandidate(candidate: User): void {
    this.selectedCandidate = candidate;
  }

  getStepStatus(stepIndex: number): 'completed' | 'active' | 'pending' | 'failed' {
    if (!this.selectedCandidate) {
      return 'pending';
    }

    const status = this.selectedCandidate.status;

    switch (stepIndex) {
      case 1: // Application Submitted
        return 'completed'; // Always completed

      case 2: // Document Verification
        if (status === 'Pending') {
          return 'active';
        }
        return 'completed'; // Done for In Progress, Verified, Failed

      case 3: // Employment Verification
        if (status === 'Pending') {
          return 'pending';
        }
        if (status === 'In Progress') {
          return 'active';
        }
        return 'completed'; // Done for Verified, Failed

      case 4: // Background Check
        if (status === 'Pending' || status === 'In Progress') {
          return 'pending';
        }
        if (status === 'Failed Verification') {
          return 'failed';
        }
        return 'completed'; // Done for Verified

      case 5: // Final Approval
        if (status === 'Pending' || status === 'In Progress') {
          return 'pending';
        }
        if (status === 'Failed Verification') {
          return 'failed';
        }
        return 'completed'; // Done for Verified

      default:
        return 'pending';
    }
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
