import { Injectable, Injector } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MessageService } from 'primeng/api';
import { TranslationService } from '../../shared/services/translation.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  private translationService?: TranslationService;

  constructor(
    private messageService: MessageService,
    private injector: Injector
  ) { }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorCode = 'UnknownError';
        let fallbackMessage = 'An unknown error occurred!';
        
        if (error.error && error.error.errors && error.error.errors.length > 0) {
          const firstError = error.error.errors[0];
          
          if (firstError.code) {
            errorCode = firstError.code;
            fallbackMessage = firstError.message || 'An unknown error occurred!';
          } else {
            // No error code, use the message as fallback
            fallbackMessage = firstError.message || 'An unknown error occurred!';
          }
        } else if (error.message) {
          fallbackMessage = error.message;
        }

        // Lazy inject TranslationService to avoid circular dependency
        if (!this.translationService) {
          try {
            this.translationService = this.injector.get(TranslationService);
          } catch (e) {
            // TranslationService not available, use fallback
          }
        }

        let finalMessage = fallbackMessage;
        let finalSummary = 'Error';

        // Try to translate if TranslationService is available
        if (this.translationService) {
          const translatedMessage = this.translationService.instant(`errors.${errorCode}`);
          if (translatedMessage && translatedMessage !== `errors.${errorCode}`) {
            finalMessage = translatedMessage;
          }
          
          const translatedSummary = this.translationService.instant('common.error');
          if (translatedSummary && translatedSummary !== 'common.error') {
            finalSummary = translatedSummary;
          }
        }

        this.messageService.add({
          severity: 'error',
          summary: finalSummary,
          detail: finalMessage
        });

        return throwError(() => error);
      })
    );
  }
} 