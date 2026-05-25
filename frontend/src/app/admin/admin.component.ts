import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatSnackBar } from '@angular/material/snack-bar';
import { User, UserRole, VerificationStatus } from '../models/user.model';
import { UserService } from '../services/user.service';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css'],
  standalone: false
})
export class AdminComponent implements OnInit, AfterViewInit {
  currentUser: any = null;
  users: User[] = [];
  isLoading = true;
  isSaving = false;
  errorMessage: string | null = null;
  isMobile = false;

  // Form State
  showForm = false;
  isEditing = false;
  selectedUserId: number | null = null;
  userForm!: FormGroup;

  // Table Configuration
  displayedColumns: string[] = ['id', 'name', 'userId', 'role', 'status', 'email', 'actions'];
  dataSource = new MatTableDataSource<User>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  roles: UserRole[] = ['Admin', 'General User'];
  statuses: VerificationStatus[] = ['Verified', 'Pending', 'In Progress', 'Failed Verification'];

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue;
    this.checkScreenSize();
    this.initForm();
    this.fetchUsers();
    window.addEventListener('resize', () => this.checkScreenSize());
  }

  checkScreenSize(): void {
    this.isMobile = window.innerWidth < 768;
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  initForm(): void {
    this.userForm = this.fb.group({
      userId: ['', [Validators.required, Validators.minLength(3)]],
      name: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', this.isEditing ? [] : [Validators.minLength(6)]], // password optional when editing
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      department: [''],
      role: ['General User', Validators.required],
      status: ['Pending', Validators.required],
      comments: ['']
    });
  }

  fetchUsers(): void {
    this.isLoading = true;
    this.userService.getUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.dataSource.data = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error fetching users:', err);
        this.snackBar.open('Failed to load user list.', 'Close', { duration: 4000 });
      }
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  openAddForm(): void {
    this.isEditing = false;
    this.selectedUserId = null;
    this.showForm = true;
    this.initForm();
  }

  openEditForm(user: User): void {
    this.isEditing = true;
    this.selectedUserId = user.id;
    this.showForm = true;
    
    // Setup form values
    this.userForm = this.fb.group({
      userId: [user.userId, [Validators.required, Validators.minLength(3)]],
      name: [user.name, [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.minLength(6)]], // optional for edit
      email: [user.email, [Validators.required, Validators.email]],
      phone: [user.phone || ''],
      department: [user.department || ''],
      role: [user.role, Validators.required],
      status: [user.status, Validators.required],
      comments: [user.comments || '']
    });
  }

  cancelForm(): void {
    this.showForm = false;
    this.isEditing = false;
    this.selectedUserId = null;
  }

  onSubmit(): void {
    if (this.userForm.invalid) return;

    this.isSaving = true;
    const formData = { ...this.userForm.value };

    // Remove empty password field on edit
    if (this.isEditing && !formData.password) {
      delete formData.password;
    }

    if (this.isEditing && this.selectedUserId !== null) {
      // Update
      this.userService.updateUser(this.selectedUserId, formData).subscribe({
        next: (updatedUser) => {
          this.isSaving = false;
          this.showForm = false;
          this.snackBar.open('User verification record updated successfully.', 'Dismiss', { duration: 3000 });
          this.fetchUsers();
        },
        error: (err) => {
          this.isSaving = false;
          const msg = err.error?.message || 'Error updating user.';
          this.snackBar.open(msg, 'Dismiss', { duration: 5000 });
        }
      });
    } else {
      // Create
      this.userService.createUser(formData).subscribe({
        next: (newUser) => {
          this.isSaving = false;
          this.showForm = false;
          this.snackBar.open('New user record registered successfully.', 'Dismiss', { duration: 3000 });
          this.fetchUsers();
        },
        error: (err) => {
          this.isSaving = false;
          const msg = err.error?.message || 'Error creating user.';
          this.snackBar.open(msg, 'Dismiss', { duration: 5000 });
        }
      });
    }
  }

  deleteUser(user: User): void {
    if (this.currentUser && this.currentUser.id === user.id) {
      this.snackBar.open('Self-deletion is forbidden. You cannot delete your own admin account.', 'Dismiss', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    if (confirm(`Are you sure you want to permanently delete user "${user.name}" (#${user.id})?`)) {
      this.isLoading = true;
      this.userService.deleteUser(user.id).subscribe({
        next: () => {
          this.snackBar.open('User record deleted successfully.', 'Dismiss', { duration: 3000 });
          this.fetchUsers();
        },
        error: (err) => {
          this.isLoading = false;
          const msg = err.error?.message || 'Error deleting user.';
          this.snackBar.open(msg, 'Dismiss', { duration: 5000 });
        }
      });
    }
  }

  getStatusClass(status: VerificationStatus): string {
    switch (status) {
      case 'Verified': return 'badge-verified';
      case 'In Progress': return 'badge-progress';
      case 'Pending': return 'badge-pending';
      case 'Failed Verification': return 'badge-failed';
      default: return 'badge-pending';
    }
  }
}
