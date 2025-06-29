import { Component, OnInit } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { TranslationService } from '../../../shared/services/translation.service';

@Component({
    selector: 'app-empty',
    standalone: true,
    imports: [TranslateModule],
    template: ` <div class="card">
        <div class="font-semibold text-xl mb-4">{{ 'pages.empty_page' | translate }}</div>
        <p>{{ 'pages.empty_page_subtitle' | translate }}</p>
    </div>`
})
export class Empty implements OnInit {
    constructor(private translationService: TranslationService) {}

    ngOnInit(): void {
        this.translationService.initializeLanguage();
    }
}
