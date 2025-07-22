import { TestBed } from '@angular/core/testing';
import { HttpInterceptorFn, HttpRequest, HttpHandler, HttpErrorResponse, HttpEvent } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { TranslationService } from '../../shared/services/translation.service';
import { ErrorInterceptor } from './error.interceptor';
import { throwError, of } from 'rxjs';
import { Injector } from '@angular/core';

xdescribe('ErrorInterceptor', () => {
  let interceptor: ErrorInterceptor;
  let messageService: jasmine.SpyObj<MessageService>;
  let translationService: jasmine.SpyObj<TranslationService>;
  let injector: jasmine.SpyObj<Injector>;
  let httpHandler: jasmine.SpyObj<HttpHandler>;

  beforeEach(() => {
    const messageServiceSpy = jasmine.createSpyObj('MessageService', ['add']);
    const translationServiceSpy = jasmine.createSpyObj('TranslationService', ['instant']);
    const injectorSpy = jasmine.createSpyObj('Injector', ['get']);
    const httpHandlerSpy = jasmine.createSpyObj('HttpHandler', ['handle']);

    TestBed.configureTestingModule({
      providers: [
        ErrorInterceptor,
        { provide: MessageService, useValue: messageServiceSpy },
        { provide: TranslationService, useValue: translationServiceSpy },
        { provide: Injector, useValue: injectorSpy }
      ]
    });

    interceptor = TestBed.inject(ErrorInterceptor);
    messageService = TestBed.inject(MessageService) as jasmine.SpyObj<MessageService>;
    translationService = TestBed.inject(TranslationService) as jasmine.SpyObj<TranslationService>;
    injector = TestBed.inject(Injector) as jasmine.SpyObj<Injector>;
    httpHandler = httpHandlerSpy;
  });

  it('should be created', () => {
    expect(interceptor).toBeTruthy();
  });

  describe('intercept', () => {
    let mockRequest: HttpRequest<any>;

    beforeEach(() => {
      mockRequest = new HttpRequest('GET', '/test');
    });

    it('should pass through successful requests', () => {
      const mockResponse = 'success';
      httpHandler.handle.and.returnValue(of(mockResponse as any));

      interceptor.intercept(mockRequest, httpHandler).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      expect(httpHandler.handle).toHaveBeenCalledWith(mockRequest);
      expect(messageService.add).not.toHaveBeenCalled();
    });

    it('should handle error with structured error response', () => {
      const errorResponse = new HttpErrorResponse({
        status: 400,
        statusText: 'Bad Request',
        error: {
          errors: [
            { code: 'ValidationError', message: 'Invalid input data' }
          ]
        }
      });

      injector.get.and.returnValue(translationService);
      translationService.instant.and.returnValues(
        'Translated validation error', // Error message translation
        'Greška' // Error summary translation
      );

      httpHandler.handle.and.returnValue(throwError(() => errorResponse));

      interceptor.intercept(mockRequest, httpHandler).subscribe({
        next: () => fail('Expected error'),
        error: (error) => {
          expect(error).toBe(errorResponse);
        }
      });

      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Greška',
        detail: 'Translated validation error'
      });
      expect(translationService.instant).toHaveBeenCalledWith('errors.ValidationError');
      expect(translationService.instant).toHaveBeenCalledWith('common.error');
    });

    it('should handle error without error code', () => {
      const errorResponse = new HttpErrorResponse({
        status: 500,
        statusText: 'Internal Server Error',
        error: {
          errors: [
            { message: 'Something went wrong' }
          ]
        }
      });

      injector.get.and.returnValue(translationService);
      translationService.instant.and.returnValues(
        'Something went wrong', // Fallback message
        'Error' // Default summary
      );

      httpHandler.handle.and.returnValue(throwError(() => errorResponse));

      interceptor.intercept(mockRequest, httpHandler).subscribe({
        next: () => fail('Expected error'),
        error: (error) => {
          expect(error).toBe(errorResponse);
        }
      });

      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Something went wrong'
      });
    });

    it('should handle error with only error message', () => {
      const errorResponse = new HttpErrorResponse({
        status: 404,
        statusText: 'Not Found',
        error: 'Resource not found'
      });

      injector.get.and.returnValue(translationService);
      translationService.instant.and.returnValues(
        'Resource not found', // Fallback to error message
        'Error'
      );

      httpHandler.handle.and.returnValue(throwError(() => errorResponse));

      interceptor.intercept(mockRequest, httpHandler).subscribe({
        next: () => fail('Expected error'),
        error: (error) => {
          expect(error).toBe(errorResponse);
        }
      });

      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Resource not found'
      });
    });

    it('should handle error without translation service', () => {
      const errorResponse = new HttpErrorResponse({
        status: 400,
        statusText: 'Bad Request',
        error: {
          errors: [
            { code: 'ValidationError', message: 'Invalid input' }
          ]
        }
      });

      injector.get.and.throwError('TranslationService not available');

      httpHandler.handle.and.returnValue(throwError(() => errorResponse));

      interceptor.intercept(mockRequest, httpHandler).subscribe({
        next: () => fail('Expected error'),
        error: (error) => {
          expect(error).toBe(errorResponse);
        }
      });

      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Invalid input'
      });
    });

    it('should use fallback message when translation is not found', () => {
      const errorResponse = new HttpErrorResponse({
        status: 400,
        statusText: 'Bad Request',
        error: {
          errors: [
            { code: 'CustomError', message: 'Custom error message' }
          ]
        }
      });

      injector.get.and.returnValue(translationService);
      translationService.instant.and.returnValues(
        'errors.CustomError', // Translation not found, returns key
        'common.error' // Translation not found, returns key
      );

      httpHandler.handle.and.returnValue(throwError(() => errorResponse));

      interceptor.intercept(mockRequest, httpHandler).subscribe({
        next: () => fail('Expected error'),
        error: (error) => {
          expect(error).toBe(errorResponse);
        }
      });

      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Custom error message'
      });
    });

    it('should handle error with empty errors array', () => {
      const errorResponse = new HttpErrorResponse({
        status: 500,
        statusText: 'Internal Server Error',
        error: {
          errors: []
        }
      });

      injector.get.and.returnValue(translationService);
      translationService.instant.and.returnValues(
        'An unknown error occurred!',
        'Error'
      );

      httpHandler.handle.and.returnValue(throwError(() => errorResponse));

      interceptor.intercept(mockRequest, httpHandler).subscribe({
        next: () => fail('Expected error'),
        error: (error) => {
          expect(error).toBe(errorResponse);
        }
      });

      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'An unknown error occurred!'
      });
    });

    it('should handle error with no structured error object', () => {
      const errorResponse = new HttpErrorResponse({
        status: 0,
        statusText: 'Unknown Error',
        error: 'Network error'
      });

      injector.get.and.returnValue(translationService);
      translationService.instant.and.returnValues(
        'Network error',
        'Error'
      );

      httpHandler.handle.and.returnValue(throwError(() => errorResponse));

      interceptor.intercept(mockRequest, httpHandler).subscribe({
        next: () => fail('Expected error'),
        error: (error) => {
          expect(error).toBe(errorResponse);
        }
      });

      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Network error'
      });
    });

    it('should use default fallback message when no message is available', () => {
      const errorResponse = new HttpErrorResponse({
        status: 500,
        statusText: 'Internal Server Error'
      });

      injector.get.and.returnValue(translationService);
      translationService.instant.and.returnValues(
        'An unknown error occurred!',
        'Error'
      );

      httpHandler.handle.and.returnValue(throwError(() => errorResponse));

      interceptor.intercept(mockRequest, httpHandler).subscribe({
        next: () => fail('Expected error'),
        error: (error) => {
          expect(error).toBe(errorResponse);
        }
      });

      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'An unknown error occurred!'
      });
    });

    it('should lazy load translation service only once', () => {
      const errorResponse1 = new HttpErrorResponse({
        status: 400,
        error: { errors: [{ code: 'Error1', message: 'First error' }] }
      });
      
      const errorResponse2 = new HttpErrorResponse({
        status: 400,
        error: { errors: [{ code: 'Error2', message: 'Second error' }] }
      });

      injector.get.and.returnValue(translationService);
      translationService.instant.and.returnValue('Translated error');

      httpHandler.handle.and.returnValues(
        throwError(() => errorResponse1),
        throwError(() => errorResponse2)
      );

      // First error
      interceptor.intercept(mockRequest, httpHandler).subscribe({
        error: () => {}
      });

      // Second error
      interceptor.intercept(mockRequest, httpHandler).subscribe({
        error: () => {}
      });

      expect(injector.get).toHaveBeenCalledTimes(1);
      expect(messageService.add).toHaveBeenCalledTimes(2);
    });
  });
}); 