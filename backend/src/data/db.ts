import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { User } from '../models/user.model';

const DB_FILE = path.join(__dirname, 'users.json');

// Initial seed data if the database doesn't exist
const getSeedData = (): User[] => {
  const adminHash = bcrypt.hashSync('admin123', 10);
  const userHash = bcrypt.hashSync('user123', 10);

  return [
    {
      id: 1,
      userId: 'admin',
      name: 'Raj Kumar',
      role: 'Admin',
      status: 'Verified',
      password: adminHash,
      email: 'raj.kumar@verification.com',
      phone: '+91 98765 43210',
      department: 'Compliance',
      joinedDate: '2025-01-15',
      comments: 'Background verification check passed. All documents verified successfully.'
    },
    {
      id: 2,
      userId: 'user',
      name: 'John Doe',
      role: 'General User',
      status: 'Verified',
      password: userHash,
      email: 'john.doe@enterprise.com',
      phone: '+1 (555) 019-2834',
      department: 'Operations',
      joinedDate: '2025-03-20',
      comments: 'ID & criminal check cleared. Academic background check completed.'
    },
    {
      id: 3,
      userId: 'alice_smith',
      name: 'Alice Smith',
      role: 'General User',
      status: 'In Progress',
      password: userHash,
      email: 'alice.smith@finance.co',
      phone: '+1 (555) 014-9988',
      department: 'Finance',
      joinedDate: '2026-05-10',
      comments: 'Awaiting reference check verification responses from previous employer.'
    },
    {
      id: 4,
      userId: 'bob_johnson',
      name: 'Bob Johnson',
      role: 'General User',
      status: 'Pending',
      password: userHash,
      email: 'bob.johnson@tech.io',
      phone: '+1 (555) 017-4829',
      department: 'Engineering',
      joinedDate: '2026-05-24',
      comments: 'Fresh signup. Address verification documents submitted.'
    },
    {
      id: 5,
      userId: 'david_lee',
      name: 'David Lee',
      role: 'General User',
      status: 'Failed Verification',
      password: userHash,
      email: 'david.lee@consulting.org',
      phone: '+852 9123 4567',
      department: 'Marketing',
      joinedDate: '2025-11-02',
      comments: 'Discrepancy found in employment dates. Verification failed.'
    },
    {
      id: 6,
      userId: 'sarah_connor',
      name: 'Sarah Connor',
      role: 'Admin',
      status: 'Verified',
      password: adminHash,
      email: 'sarah.connor@defense.gov',
      phone: '+1 (555) 909-0012',
      department: 'Security',
      joinedDate: '2024-08-12',
      comments: 'Full security clearance verified by third-party vendor.'
    },
    {
      id: 7,
      userId: 'emily_watson',
      name: 'Emily Watson',
      role: 'General User',
      status: 'In Progress',
      password: userHash,
      email: 'emily.w@designstudio.com',
      phone: '+44 20 7946 0958',
      department: 'Design',
      joinedDate: '2026-04-18',
      comments: 'Education check verified. Criminal record check still pending.'
    }
  ];
};

export class Database {
  private static ensureDbExists() {
    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(getSeedData(), null, 2), 'utf-8');
    }
  }

  static getUsers(): User[] {
    this.ensureDbExists();
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(data);
  }

  static saveUsers(users: User[]) {
    this.ensureDbExists();
    fs.writeFileSync(DB_FILE, JSON.stringify(users, null, 2), 'utf-8');
  }

  static getUserById(id: number): User | undefined {
    const users = this.getUsers();
    return users.find(u => u.id === id);
  }

  static getUserByUserId(userId: string): User | undefined {
    const users = this.getUsers();
    return users.find(u => u.userId.toLowerCase() === userId.toLowerCase());
  }

  static createUser(user: Omit<User, 'id'>): User {
    const users = this.getUsers();
    const nextId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
    
    // Hash password if provided
    let hashedPassword = bcrypt.hashSync('user123', 10); // default password
    if (user.password) {
      hashedPassword = bcrypt.hashSync(user.password, 10);
    }

    const newUser: User = {
      ...user,
      id: nextId,
      password: hashedPassword
    };

    users.push(newUser);
    this.saveUsers(users);
    return newUser;
  }

  static updateUser(id: number, updatedFields: Partial<User>): User | null {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === id);
    if (index === -1) return null;

    const existingUser = users[index];
    
    // Check if password needs to be updated and hashed
    let password = existingUser.password;
    if (updatedFields.password && !updatedFields.password.startsWith('$2a$')) {
      password = bcrypt.hashSync(updatedFields.password, 10);
    }

    users[index] = {
      ...existingUser,
      ...updatedFields,
      id, // ensure ID doesn't change
      password
    };

    this.saveUsers(users);
    return users[index];
  }

  static deleteUser(id: number): boolean {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === id);
    if (index === -1) return false;

    users.splice(index, 1);
    this.saveUsers(users);
    return true;
  }
}
