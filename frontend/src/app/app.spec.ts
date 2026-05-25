// @vitest-environment jsdom

import { TestBed } from '@angular/core/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';
import { RouterModule } from '@angular/router';
import { Component } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { App } from './app';
import { AuthService } from './auth/auth.service';
import { describe, it, expect, beforeEach } from 'vitest';

// Initialize the Angular testing environment dynamically for Vitest
try {
  TestBed.initTestEnvironment(
    BrowserTestingModule,
    platformBrowserTesting()
  );
} catch (e) {
  // Already initialized
}

@Component({
  selector: 'app-navbar',
  template: '',
  standalone: false
})
class MockNavbarComponent {}

@Component({
  selector: 'app-sidebar',
  template: '',
  standalone: false
})
class MockSidebarComponent {}

class MockAuthService {
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  isLoggedIn() {
    return false;
  }
}

describe('App', () => {
  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [RouterModule.forRoot([])],
      declarations: [
        App,
        MockNavbarComponent,
        MockSidebarComponent
      ],
      providers: [
        { provide: AuthService, useClass: MockAuthService }
      ]
    });

    // Override the component to use inline template/styles to bypass ResourceLoader
    TestBed.overrideComponent(App, {
      set: {
        templateUrl: undefined,
        template: '<app-navbar></app-navbar><router-outlet></router-outlet>',
        styleUrls: [],
        styleUrl: undefined
      }
    });

    await TestBed.compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
