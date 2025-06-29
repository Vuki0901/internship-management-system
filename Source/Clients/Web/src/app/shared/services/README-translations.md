# Translation System (ngx-translate)

This project uses `@ngx-translate/core` for internationalization with JSON-based translations.

## Available Languages

- Croatian (hr) - Default language
- English (en)

## Translation Files

Translation files are located in `src/assets/i18n/`:
- `hr.json` - Croatian translations
- `en.json` - English translations

## Usage in Components

### 1. Import TranslateModule

```typescript
import { TranslateModule } from '@ngx-translate/core';

@Component({
  // ...
  imports: [TranslateModule, /* other imports */],
  // ...
})
```

### 2. Use Translation Pipe in Templates

```html
<!-- Simple translation -->
<h1>{{ 'app.title' | translate }}</h1>

<!-- With parameters -->
<p>{{ 'welcome.message' | translate:{ name: userName } }}</p>

<!-- For attributes -->
<input [placeholder]="'common.search' | translate">
```

### 3. Use Translation Service in Component Logic

```typescript
import { TranslationService } from '../services/translation.service';

constructor(private translationService: TranslationService) {}

// Get translation with observable
this.translationService.get('error.message').subscribe(text => {
  console.log(text);
});

// Get instant translation
const text = this.translationService.instant('common.save');
```

## Language Switching

### Using Language Switcher Component

```html
<app-language-switcher></app-language-switcher>
```

### Programmatic Language Switching

```typescript
// Switch to specific language
this.translationService.setLanguage('en');

// Toggle between Croatian and English
this.translationService.toggleLanguage();

// Get current language
const currentLang = this.translationService.getCurrentLanguage();
```

## Translation Key Structure

The translation keys follow a hierarchical structure:

```json
{
  "app": {
    "title": "Application Title"
  },
  "common": {
    "save": "Save",
    "cancel": "Cancel"
  },
  "auth": {
    "login": {
      "title": "Login",
      "email_label": "Email"
    }
  },
  "navigation": {
    "dashboard": "Dashboard",
    "users": "Users"
  }
}
```

## Adding New Translations

1. Add the key-value pair to both `hr.json` and `en.json`
2. Use the translation key in your component template or code
3. The translation will be automatically loaded and cached

## Features

- **Automatic language detection** from localStorage
- **Language persistence** across browser sessions
- **Lazy loading** of translation files
- **Real-time language switching** without page refresh
- **Hierarchical key structure** for better organization
- **Parameter support** for dynamic translations

## Examples

### Layout Component
```html
<h2>{{ 'app.title' | translate }}</h2>
<input [placeholder]="'common.search' | translate">
<span>{{ 'navigation.dashboard' | translate }}</span>
```

### Form Component
```html
<label>{{ 'auth.login.email_label' | translate }}</label>
<button>{{ 'auth.login.login_button' | translate }}</button>
```

### Service Usage
```typescript
// In component
showSuccessMessage() {
  const message = this.translationService.instant('messages.save_success');
  this.messageService.add({ summary: message });
}
```

## Error Message Translation

The application automatically translates error messages from the API using error codes. When the API returns an error response like this:

```json
{
    "result": null,
    "errors": [
        {
            "code": "StudentHasNoActiveInternshipAtTheMoment",
            "message": "Student has no active internship at the moment."
        }
    ],
    "hasErrors": true
}
```

The `ErrorInterceptor` will:
1. Extract the error code from the response
2. Look up the translation using `errors.{errorCode}` key
3. Fall back to the original message if no translation exists
4. Display the translated error message to the user

### Error Translation Keys
All error translations are stored under the `errors` section in the translation files:

```json
{
  "errors": {
    "StudentHasNoActiveInternshipAtTheMoment": "Student trenutno nema aktivnu praksu.",
    "UserDoesNotExist": "Korisnik ne postoji.",
    "EmailIsRequired": "Email je obavezan."
  }
}
```

### Adding New Error Translations
When adding new error codes to `ErrorDefinitions.cs`:
1. Add the error code to both `en.json` and `hr.json` in the `errors` section
2. The error will be automatically translated when returned by the API

### Error Handling Flow
1. API returns error with `code` and `message`
2. `ErrorInterceptor` catches the HTTP error
3. Attempts to translate using `translateService.instant('errors.' + errorCode)`
4. If translation exists, uses translated message
5. If no translation, falls back to original API message
6. Displays error to user via `MessageService` 