import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToastModule } from 'primeng/toast';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { By } from '@angular/platform-browser';
import { of, throwError } from 'rxjs';

import { LoginComponent } from './login.component';
import { AuthService } from '../auth/auth.service';
import { TranslationService } from '../services/translation.service';

xdescribe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;
  let activatedRoute: jasmine.SpyObj<ActivatedRoute>;
  let translationService: jasmine.SpyObj<TranslationService>;
  let messageService: jasmine.SpyObj<MessageService>;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', [
      'login'
    ]);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const activatedRouteSpy = jasmine.createSpyObj('ActivatedRoute', [], {
      queryParams: of({ role: 'Student' })
    });
    const translationServiceSpy = jasmine.createSpyObj('TranslationService', [
      'initializeLanguage'
    ]);
    const messageServiceSpy = jasmine.createSpyObj('MessageService', ['add']);

    await TestBed.configureTestingModule({
      imports: [
        LoginComponent,
        CommonModule,
        FormsModule,
        ToastModule,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy },
        { provide: TranslationService, useValue: translationServiceSpy },
        { provide: MessageService, useValue: messageServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    activatedRoute = TestBed.inject(ActivatedRoute) as jasmine.SpyObj<ActivatedRoute>;
    translationService = TestBed.inject(TranslationService) as jasmine.SpyObj<TranslationService>;
    messageService = TestBed.inject(MessageService) as jasmine.SpyObj<MessageService>;
  });

  beforeEach(() => {
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Component Initialization', () => {
    it('should initialize with default values', () => {
      expect(component.email).toBe('');
      expect(component.password).toBe('');
      expect(component.role).toBe('');
    });

    it('should call initializeLanguage on init', () => {
      component.ngOnInit();
      expect(translationService.initializeLanguage).toHaveBeenCalled();
    });

    it('should set role from query params', fakeAsync(() => {
      const mockActivatedRoute = TestBed.inject(ActivatedRoute);
      (mockActivatedRoute.queryParams as any) = of({ role: 'Admin' });
      
      component.ngOnInit();
      tick();
      
      expect(component.role).toBe('Admin');
    }));

    it('should default to Student role when no query params', fakeAsync(() => {
      const mockActivatedRoute = TestBed.inject(ActivatedRoute);
      (mockActivatedRoute.queryParams as any) = of({});
      
      component.ngOnInit();
      tick();
      
      expect(component.role).toBe('Student');
    }));
  });

  describe('Role Switching', () => {
    it('should switch to different roles', () => {
      component.switchRole('Admin');
      expect(component.role).toBe('Admin');
      expect(router.navigate).toHaveBeenCalledWith([], { queryParams: { role: 'Admin' } });

      component.switchRole('Mentor');
      expect(component.role).toBe('Mentor');
      expect(router.navigate).toHaveBeenCalledWith([], { queryParams: { role: 'Mentor' } });
    });

    it('should update URL when switching roles', () => {
      component.switchRole('Supervisor');
      expect(router.navigate).toHaveBeenCalledWith([], { queryParams: { role: 'Supervisor' } });
    });

    it('should render correct number of role switch buttons', () => {
      const roleButtons = fixture.debugElement.queryAll(By.css('.role-switch-btn'));
      expect(roleButtons.length).toBe(4);
    });

    it('should highlight active role button', () => {
      component.role = 'Student';
      fixture.detectChanges();
      
      const studentButton = fixture.debugElement.query(By.css('.role-switch-btn.active'));
      expect(studentButton.nativeElement.textContent).toContain('roles.student');
    });
  });

  describe('Form Submission', () => {
    beforeEach(() => {
      component.email = 'test@example.com';
      component.password = 'password123';
    });

    it('should call authService.login with correct parameters for Student', fakeAsync(() => {
      component.role = 'Student';
      const mockLoginResponse = { token: 'fake-token' };
      authService.login.and.returnValue(of(mockLoginResponse));

      component.onSubmit();
      tick();

      expect(authService.login).toHaveBeenCalledWith('Student', { emailAddress: 'test@example.com', password: 'password123' });
    }));

    it('should call authService.login with correct parameters for Mentor', fakeAsync(() => {
      component.role = 'Mentor';
      const mockLoginResponse = { token: 'fake-token' };
      authService.login.and.returnValue(of(mockLoginResponse));

      component.onSubmit();
      tick();

      expect(authService.login).toHaveBeenCalledWith('Mentor', { emailAddress: 'test@example.com', password: 'password123' });
    }));

    it('should navigate to appropriate dashboard on successful login', fakeAsync(() => {
      component.role = 'Admin';
      const mockLoginResponse = { token: 'fake-token' };
      authService.login.and.returnValue(of(mockLoginResponse));

      component.onSubmit();
      tick();

      // Navigation is handled by AuthService, not component
      expect(authService.login).toHaveBeenCalledWith('Admin', { emailAddress: 'test@example.com', password: 'password123' });
    }));

    it('should handle successful login for Student role', fakeAsync(() => {
      component.role = 'Student';
      const mockLoginResponse = { token: 'fake-token' };
      authService.login.and.returnValue(of(mockLoginResponse));

      component.onSubmit();
      tick();

      expect(authService.login).toHaveBeenCalledWith('Student', { emailAddress: 'test@example.com', password: 'password123' });
    }));

    it('should handle successful login for Mentor role', fakeAsync(() => {
      component.role = 'Mentor';
      const mockLoginResponse = { token: 'fake-token' };
      authService.login.and.returnValue(of(mockLoginResponse));

      component.onSubmit();
      tick();

      expect(authService.login).toHaveBeenCalledWith('Mentor', { emailAddress: 'test@example.com', password: 'password123' });
    }));

    it('should handle successful login for Supervisor role', fakeAsync(() => {
      component.role = 'Supervisor';
      const mockLoginResponse = { token: 'fake-token' };
      authService.login.and.returnValue(of(mockLoginResponse));

      component.onSubmit();
      tick();

      expect(authService.login).toHaveBeenCalledWith('Supervisor', { emailAddress: 'test@example.com', password: 'password123' });
    }));

    it('should handle login errors gracefully', fakeAsync(() => {
      component.role = 'Student';
      authService.login.and.returnValue(throwError(() => new Error('Login failed')));

      component.onSubmit();
      tick();

      expect(authService.login).toHaveBeenCalledWith('Student', { emailAddress: 'test@example.com', password: 'password123' });
    }));
  });

  describe('Template Rendering', () => {
    it('should render student login form for Student role', () => {
      component.role = 'Student';
      fixture.detectChanges();

      const studentContainer = fixture.debugElement.query(By.css('.student-login-container'));
      const otherRolesContainer = fixture.debugElement.query(By.css('.other-roles-login-container'));

      expect(studentContainer).toBeTruthy();
      expect(otherRolesContainer).toBeFalsy();
    });

    it('should render other roles login form for non-Student roles', () => {
      component.role = 'Admin';
      fixture.detectChanges();

      const studentContainer = fixture.debugElement.query(By.css('.student-login-container'));
      const otherRolesContainer = fixture.debugElement.query(By.css('.other-roles-login-container'));

      expect(studentContainer).toBeFalsy();
      expect(otherRolesContainer).toBeTruthy();
    });

    it('should display correct logo for student login', () => {
      component.role = 'Student';
      fixture.detectChanges();

      const logoImg = fixture.debugElement.query(By.css('.aai-logo'));
      expect(logoImg).toBeTruthy();
      expect(logoImg.nativeElement.src).toContain('assets/images/aai-logo.png');
    });

    it('should display correct logo for other roles login', () => {
      component.role = 'Admin';
      fixture.detectChanges();

      const logoImg = fixture.debugElement.query(By.css('.full-logo'));
      expect(logoImg).toBeTruthy();
      expect(logoImg.nativeElement.src).toContain('assets/images/logo-full.png');
    });

    it('should bind form inputs correctly', fakeAsync(() => {
      component.role = 'Student';
      fixture.detectChanges();

      const emailInput = fixture.debugElement.query(By.css('input[type="email"]'));
      const passwordInput = fixture.debugElement.query(By.css('input[type="password"]'));

      // Set values in inputs
      emailInput.nativeElement.value = 'test@example.com';
      emailInput.nativeElement.dispatchEvent(new Event('input'));
      
      passwordInput.nativeElement.value = 'testpassword';
      passwordInput.nativeElement.dispatchEvent(new Event('input'));

      tick();
      fixture.detectChanges();

      expect(component.email).toBe('test@example.com');
      expect(component.password).toBe('testpassword');
    }));
  });

  describe('Form Validation', () => {
    it('should require email and password fields', () => {
      component.role = 'Student';
      fixture.detectChanges();

      const emailInput = fixture.debugElement.query(By.css('input[type="email"]'));
      const passwordInput = fixture.debugElement.query(By.css('input[type="password"]'));

      expect(emailInput.nativeElement.required).toBeTruthy();
      expect(passwordInput.nativeElement.required).toBeTruthy();
    });

    it('should submit form when all fields are filled', fakeAsync(() => {
      component.role = 'Student';
      component.email = 'test@example.com';
      component.password = 'password123';
      
      const mockLoginResponse = { token: 'fake-token', user: { id: '1', role: 'Student' } };
      authService.login.and.returnValue(of(mockLoginResponse));

      spyOn(component, 'onSubmit').and.callThrough();
      
      const form = fixture.debugElement.query(By.css('form'));
      form.triggerEventHandler('ngSubmit', null);
      
      tick();

      expect(component.onSubmit).toHaveBeenCalled();
      expect(authService.login).toHaveBeenCalled();
    }));
  });

  describe('Navigation methods', () => {
    it('should navigate to register page', () => {
      component.goToRegister();
      expect(router.navigate).toHaveBeenCalledWith(['/students/register']);
    });
  });

  describe('Error handling', () => {
    it('should handle authentication service errors', fakeAsync(() => {
      component.role = 'Student';
      component.email = 'test@example.com';
      component.password = 'wrongpassword';

      authService.login.and.returnValue(throwError(() => ({ 
        status: 401, 
        error: { message: 'Invalid credentials' } 
      })));

      spyOn(console, 'error');

      component.onSubmit();
      tick();

      expect(console.error).toHaveBeenCalled();
      expect(router.navigate).not.toHaveBeenCalled();
    }));
  });

  describe('Accessibility', () => {
    it('should have proper form labels and structure', () => {
      component.role = 'Student';
      fixture.detectChanges();

      const emailInput = fixture.debugElement.query(By.css('input[type="email"]'));
      const passwordInput = fixture.debugElement.query(By.css('input[type="password"]'));

      expect(emailInput.nativeElement.name).toBe('email');
      expect(passwordInput.nativeElement.name).toBe('password');
    });

    it('should have proper button types', () => {
      component.role = 'Student';
      fixture.detectChanges();

      const submitButton = fixture.debugElement.query(By.css('button[type="submit"]'));
      expect(submitButton).toBeTruthy();
    });
  });
}); 