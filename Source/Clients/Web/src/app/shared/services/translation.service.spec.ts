import { TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TranslationService } from './translation.service';
import { of } from 'rxjs';

describe('TranslationService', () => {
  let service: TranslationService;
  let translateService: jasmine.SpyObj<TranslateService>;
  
  const mockTranslateService = jasmine.createSpyObj('TranslateService', [
    'use', 
    'get', 
    'instant', 
    'setDefaultLang'
  ]);

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [
        TranslationService,
        { provide: TranslateService, useValue: mockTranslateService }
      ]
    });
    
    service = TestBed.inject(TranslationService);
    translateService = TestBed.inject(TranslateService) as jasmine.SpyObj<TranslateService>;
    
    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('setLanguage', () => {
    it('should set language and update localStorage', () => {
      const language = 'en';
      
      service.setLanguage(language);
      
      expect(translateService.use).toHaveBeenCalledWith(language);
      expect(localStorage.getItem('language')).toBe(language);
    });

    it('should emit new language through currentLanguage$', (done) => {
      const language = 'en';
      
      service.currentLanguage$.subscribe(lang => {
        if (lang === language) {
          expect(lang).toBe(language);
          done();
        }
      });
      
      service.setLanguage(language);
    });
  });

  describe('getCurrentLanguage', () => {
    it('should return current language', () => {
      service.setLanguage('en');
      expect(service.getCurrentLanguage()).toBe('en');
    });

    it('should return default language initially', () => {
      expect(service.getCurrentLanguage()).toBe('hr');
    });
  });

  describe('get', () => {
    it('should return translation observable', () => {
      const key = 'test.key';
      const expectedTranslation = 'Test Translation';
      translateService.get.and.returnValue(of(expectedTranslation));
      
      service.get(key).subscribe(result => {
        expect(result).toBe(expectedTranslation);
      });
      
      expect(translateService.get).toHaveBeenCalledWith(key, undefined);
    });

    it('should pass parameters to translate service', () => {
      const key = 'test.key';
      const params = { name: 'John' };
      translateService.get.and.returnValue(of('Hello John'));
      
      service.get(key, params).subscribe();
      
      expect(translateService.get).toHaveBeenCalledWith(key, params);
    });
  });

  describe('instant', () => {
    it('should return instant translation', () => {
      const key = 'test.key';
      const expectedTranslation = 'Test Translation';
      translateService.instant.and.returnValue(expectedTranslation);
      
      const result = service.instant(key);
      
      expect(result).toBe(expectedTranslation);
      expect(translateService.instant).toHaveBeenCalledWith(key, undefined);
    });

    it('should pass parameters to translate service', () => {
      const key = 'test.key';
      const params = { name: 'John' };
      translateService.instant.and.returnValue('Hello John');
      
      service.instant(key, params);
      
      expect(translateService.instant).toHaveBeenCalledWith(key, params);
    });
  });

  describe('initializeLanguage', () => {
    it('should use saved language from localStorage', () => {
      localStorage.setItem('language', 'en');
      
      service.initializeLanguage();
      
      expect(translateService.setDefaultLang).toHaveBeenCalledWith('hr');
      expect(translateService.use).toHaveBeenCalledWith('en');
    });

    it('should use default language when no saved language exists', () => {
      service.initializeLanguage();
      
      expect(translateService.setDefaultLang).toHaveBeenCalledWith('hr');
      expect(translateService.use).toHaveBeenCalledWith('hr');
    });

    it('should use default language when saved language is invalid', () => {
      localStorage.setItem('language', 'invalid');
      
      service.initializeLanguage();
      
      expect(translateService.use).toHaveBeenCalledWith('hr');
    });

    it('should save language to localStorage after initialization', () => {
      service.initializeLanguage();
      
      expect(localStorage.getItem('language')).toBe('hr');
    });
  });

  describe('getAvailableLanguages', () => {
    it('should return available languages with correct structure', () => {
      const languages = service.getAvailableLanguages();
      
      expect(languages).toEqual([
        { code: 'hr', name: 'Hrvatski', flagCode: 'hr' },
        { code: 'en', name: 'English', flagCode: 'gb' }
      ]);
    });
  });

  describe('toggleLanguage', () => {
    it('should toggle from Croatian to English', () => {
      service.setLanguage('hr');
      spyOn(service, 'setLanguage');
      
      service.toggleLanguage();
      
      expect(service.setLanguage).toHaveBeenCalledWith('en');
    });

    it('should toggle from English to Croatian', () => {
      service.setLanguage('en');
      spyOn(service, 'setLanguage');
      
      service.toggleLanguage();
      
      expect(service.setLanguage).toHaveBeenCalledWith('hr');
    });
  });

  describe('currentLanguage$ observable', () => {
    it('should emit initial language', (done) => {
      service.currentLanguage$.subscribe(lang => {
        expect(lang).toBe('hr');
        done();
      });
    });

    it('should emit language changes', (done) => {
      let callCount = 0;
      const expectedLanguages = ['hr', 'en'];
      
      service.currentLanguage$.subscribe(lang => {
        expect(lang).toBe(expectedLanguages[callCount]);
        callCount++;
        
        if (callCount === 2) {
          done();
        }
      });
      
      service.setLanguage('en');
    });
  });
}); 