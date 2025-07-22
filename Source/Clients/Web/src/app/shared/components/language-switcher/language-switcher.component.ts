import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="language-switcher">
      <button 
        *ngFor="let lang of availableLanguages" 
        [class]="'lang-btn ' + (currentLanguage === lang.code ? 'active' : '')"
        (click)="switchLanguage(lang.code)"
        [title]="lang.name">
        <span class="fi" [ngClass]="'fi-'+lang.flagCode"></span>
        <span class="code">{{ lang.code.toUpperCase() }}</span>
      </button>
    </div>
  `,
  styles: [`
    .language-switcher {
      display: flex;
      gap: 4px;
      align-items: center;
    }

    .lang-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 12px 16px;
      border: none;
      border-radius: 10px;
      background: linear-gradient(135deg, var(--primary-color), var(--primary-600));
      color: white;
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 0.875rem;
      font-weight: 600;
      min-width: 70px;
      height: 44px;
      position: relative;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(var(--primary-rgb), 0.2);
    }

    .lang-btn::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
      transition: left 0.5s ease;
    }

    .lang-btn:hover::before {
      left: 100%;
    }

    .lang-btn:hover {
      transform: translateY(-2px) scale(1.05);
      box-shadow: 0 4px 16px rgba(var(--primary-rgb), 0.3);
    }

    .lang-btn.active {
      background: linear-gradient(135deg, var(--primary-700), var(--primary-800));
      transform: scale(0.95);
      box-shadow: inset 0 2px 4px rgba(0,0,0,0.2);
    }

    .lang-btn:not(.active) {
      opacity: 0.8;
    }

    .flag-icon {
      font-size: 18px;
      line-height: 1;
      flex-shrink: 0;
      border-radius: 2px;
      overflow: hidden;
    }

    .fi {
      font-size: 18px;
      line-height: 1;
      flex-shrink: 0;
      border-radius: 2px;
      overflow: hidden;
      margin-right: 2px;
    }

    .code {
      font-size: 0.8rem;
      letter-spacing: 0.5px;
      font-weight: 700;
      position: relative;
      z-index: 1;
    }

    /* Mobile adjustments */
    @media (max-width: 768px) {
      .lang-btn {
        padding: 10px 14px;
        min-width: 60px;
        height: 40px;
        gap: 5px;
        border-radius: 8px;
        font-size: 0.8rem;
      }

      .fi {
        font-size: 16px;
      }

      .code {
        font-size: 0.7rem;
        font-weight: 600;
      }
    }

    @media (max-width: 480px) {
      .lang-btn {
        padding: 8px 12px;
        min-width: 56px;
        height: 36px;
        gap: 4px;
        border-radius: 6px;
        font-size: 0.75rem;
      }

      .fi {
        font-size: 14px;
      }

      .code {
        font-size: 0.65rem;
      }
    }
  `]
})
export class LanguageSwitcherComponent implements OnInit {
  currentLanguage = 'hr';
  availableLanguages: { code: string; name: string; flagCode: string }[] = [];

  constructor(private translationService: TranslationService) {}

  ngOnInit(): void {
    this.availableLanguages = this.translationService.getAvailableLanguages();
    
    // Subscribe to language changes
    this.translationService.currentLanguage$.subscribe(language => {
      this.currentLanguage = language;
    });

    // Initialize language from storage
    this.translationService.initializeLanguage();
  }

  switchLanguage(language: string): void {
    this.translationService.setLanguage(language);
  }
} 