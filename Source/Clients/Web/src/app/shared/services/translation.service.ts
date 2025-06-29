import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private currentLanguageSubject = new BehaviorSubject<string>('hr');
  public currentLanguage$ = this.currentLanguageSubject.asObservable();

  constructor(private translate: TranslateService) {
    // Initialize will be called explicitly by components
  }

  /**
   * Set the current language
   * @param language Language code (hr, en)
   */
  setLanguage(language: string): void {
    this.translate.use(language);
    this.currentLanguageSubject.next(language);
    localStorage.setItem('language', language);
  }

  /**
   * Get the current language
   */
  getCurrentLanguage(): string {
    return this.currentLanguageSubject.value;
  }

  /**
   * Get translation for a key
   * @param key Translation key
   * @param params Optional parameters
   */
  get(key: string, params?: any): Observable<string> {
    return this.translate.get(key, params);
  }

  /**
   * Get instant translation for a key
   * @param key Translation key
   * @param params Optional parameters
   */
  instant(key: string, params?: any): string {
    return this.translate.instant(key, params);
  }

  /**
   * Initialize language from localStorage or default
   */
  initializeLanguage(): void {
    const savedLanguage = localStorage.getItem('language');
    const languageToUse = (savedLanguage && ['hr', 'en'].includes(savedLanguage)) ? savedLanguage : 'hr';
    
    // Set the language and ensure it's loaded
    this.translate.setDefaultLang('hr');
    this.translate.use(languageToUse);
    this.currentLanguageSubject.next(languageToUse);
    localStorage.setItem('language', languageToUse);
  }

  /**
   * Get available languages
   */
  getAvailableLanguages(): { code: string; name: string; flagCode: string }[] {
    return [
      { code: 'hr', name: 'Hrvatski', flagCode: 'hr' },
      { code: 'en', name: 'English', flagCode: 'gb' }
    ];
  }

  /**
   * Toggle between Croatian and English
   */
  toggleLanguage(): void {
    const currentLang = this.getCurrentLanguage();
    const newLang = currentLang === 'hr' ? 'en' : 'hr';
    this.setLanguage(newLang);
  }
} 