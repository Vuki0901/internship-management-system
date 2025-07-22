import 'zone.js/testing';
import { TestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

// Initialize the Angular testing environment
TestBed.initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting()
);

// Global test configuration
declare global {
  namespace jasmine {
    interface Matchers<T> {
      toHaveBeenCalledWithError(errorMessage?: string): boolean;
      toHaveValidFormStructure(): boolean;
      toHaveTranslationKey(key: string): boolean;
    }
  }
}

// Custom matchers
beforeEach(() => {
  jasmine.addMatchers({
    toHaveBeenCalledWithError: () => ({
      compare: (actual: jasmine.Spy, errorMessage?: string) => {
        const calls = actual.calls.all();
        const hasErrorCall = calls.some(call => 
          call.args[0] && call.args[0].severity === 'error'
        );
        
        if (errorMessage) {
          const hasSpecificError = calls.some(call => 
            call.args[0] && 
            call.args[0].severity === 'error' && 
            call.args[0].detail && 
            call.args[0].detail.includes(errorMessage)
          );
          return {
            pass: hasSpecificError,
            message: `Expected ${actual.and.identity} to have been called with error message containing "${errorMessage}"`
          };
        }
        
        return {
          pass: hasErrorCall,
          message: `Expected ${actual.and.identity} to have been called with an error`
        };
      }
    }),
    
    toHaveValidFormStructure: () => ({
      compare: (actual: any) => {
        const hasFormElement = actual.querySelector('form') !== null;
        const hasSubmitButton = actual.querySelector('button[type="submit"]') !== null;
        const hasRequiredInputs = actual.querySelectorAll('input[required]').length > 0;
        
        const isValid = hasFormElement && hasSubmitButton && hasRequiredInputs;
        
        return {
          pass: isValid,
          message: `Expected element to have valid form structure (form, submit button, required inputs)`
        };
      }
    }),

    toHaveTranslationKey: () => ({
      compare: (actual: any, expectedKey: string) => {
        const hasTranslateDirective = actual.textContent && 
          (actual.textContent.includes('translate') || 
           actual.hasAttribute('translate') ||
           actual.querySelector('[translate]'));
        
        return {
          pass: hasTranslateDirective,
          message: `Expected element to have translation key "${expectedKey}"`
        };
      }
    })
  });
});

// Global test utilities
export class TestUtils {
  /**
   * Creates a mock TranslateService with common methods
   */
  static createMockTranslateService(): jasmine.SpyObj<TranslateService> {
    const spy = jasmine.createSpyObj('TranslateService', [
      'get', 'instant', 'use', 'setDefaultLang', 'getDefaultLang'
    ]);
    
    spy.get.and.returnValue(Promise.resolve('Translated text'));
    spy.instant.and.returnValue('Translated text');
    spy.use.and.returnValue(Promise.resolve('Translated text'));
    spy.setDefaultLang.and.returnValue();
    spy.getDefaultLang.and.returnValue('en');
    
    return spy;
  }

  /**
   * Creates a mock MessageService for PrimeNG toasts
   */
  static createMockMessageService(): jasmine.SpyObj<MessageService> {
    return jasmine.createSpyObj('MessageService', ['add', 'clear']);
  }

  /**
   * Creates a mock file for testing file uploads
   */
  static createMockFile(name: string, content: string, type: string = 'text/plain'): File {
    return new File([content], name, { type });
  }

  /**
   * Creates a mock HTTP error response
   */
  static createMockHttpError(status: number, message: string = 'Error') {
    return {
      status,
      statusText: message,
      error: {
        errors: [{ message }]
      }
    };
  }

  /**
   * Creates a mock user object for testing
   */
  static createMockUser(role: string = 'Student', id: string = '1') {
    return {
      id,
      role,
      email: `test-${role.toLowerCase()}@example.com`,
      firstName: 'Test',
      lastName: 'User'
    };
  }

  /**
   * Creates a mock login response
   */
  static createMockLoginResponse(role: string = 'Student') {
    return {
      token: 'mock-jwt-token',
      user: this.createMockUser(role)
    };
  }

  /**
   * Creates a mock internship object
   */
  static createMockInternship(id: string = '1') {
    return {
      id,
      startDate: '2024-01-01',
      endDate: '2024-06-30',
      status: 1, // InternshipStatus.Pending
      studyLevel: 1, // StudyLevel.Undergraduate
      createdOn: '2023-12-01',
      internshipProvider: {
        id: 'provider-1',
        name: 'Test Company',
        address: '123 Test St',
        contactEmailAddress: 'contact@test.com',
        contactPhoneNumber: '+1234567890'
      }
    };
  }

  /**
   * Creates a mock document object
   */
  static createMockDocument(id: string = '1') {
    return {
      id,
      name: `Document ${id}.pdf`,
      size: 1024,
      uploadedOn: '2024-01-01T00:00:00.000Z',
      uploadedBy: 'user1'
    };
  }

  /**
   * Waits for async operations to complete
   */
  static async waitForAsync(): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, 0));
  }

  /**
   * Triggers input change event for form testing
   */
  static triggerInputChange(element: HTMLInputElement, value: string): void {
    element.value = value;
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
    element.dispatchEvent(new Event('blur', { bubbles: true }));
  }

  /**
   * Common testing module imports
   */
  static getCommonTestingModules() {
    return [
      HttpClientTestingModule,
      RouterTestingModule,
      NoopAnimationsModule,
      TranslateModule.forRoot()
    ];
  }

  /**
   * Common testing providers
   */
  static getCommonTestingProviders() {
    return [
      { provide: TranslateService, useValue: this.createMockTranslateService() },
      { provide: MessageService, useValue: this.createMockMessageService() }
    ];
  }

  /**
   * Setup component testing with common configuration
   */
  static setupComponentTest<T>(component: any, additionalImports: any[] = [], additionalProviders: any[] = []) {
    return TestBed.configureTestingModule({
      imports: [
        component,
        ...this.getCommonTestingModules(),
        ...additionalImports
      ],
      providers: [
        ...this.getCommonTestingProviders(),
        ...additionalProviders
      ]
    });
  }
}

// Mock localStorage for testing
export class MockLocalStorage {
  private store: { [key: string]: string } = {};

  getItem(key: string): string | null {
    return this.store[key] || null;
  }

  setItem(key: string, value: string): void {
    this.store[key] = value;
  }

  removeItem(key: string): void {
    delete this.store[key];
  }

  clear(): void {
    this.store = {};
  }
}

// Replace localStorage with mock in tests
Object.defineProperty(window, 'localStorage', {
  value: new MockLocalStorage(),
  writable: true
});

// Suppress console warnings in tests
const originalConsoleWarn = console.warn;
const originalConsoleError = console.error;

beforeEach(() => {
  console.warn = jasmine.createSpy('console.warn');
  console.error = jasmine.createSpy('console.error');
});

afterEach(() => {
  console.warn = originalConsoleWarn;
  console.error = originalConsoleError;
});

// Global test configuration for coverage
declare global {
  interface Window {
    __coverage__: any;
  }
}

// Performance timing for tests
let testStartTime: number;

beforeEach(() => {
  testStartTime = performance.now();
});

afterEach(() => {
  const testEndTime = performance.now();
  const testDuration = testEndTime - testStartTime;
  
  // Log slow tests (over 100ms)
  if (testDuration > 100) {
    console.warn(`Slow test detected: ${testDuration.toFixed(2)}ms`);
  }
});

// Export testing utilities
export { TestUtils as default }; 