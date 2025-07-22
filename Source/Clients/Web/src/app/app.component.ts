import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslationService } from './shared/services/translation.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <router-outlet></router-outlet>
  `,
  styles: []
})
export class AppComponent implements OnInit {
  title = 'internship-management-system';

  constructor(private translationService: TranslationService) {}

  ngOnInit(): void {
    // Initialize translations at app level
    this.translationService.initializeLanguage();
  }
}
