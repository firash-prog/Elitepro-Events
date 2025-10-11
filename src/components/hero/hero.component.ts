import { Component, ChangeDetectionStrategy, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-hero',
  templateUrl: './hero.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroComponent {
  platformId = inject(PLATFORM_ID);

  scrollTo(sectionId: string, event: Event): void {
    event.preventDefault();
    if (isPlatformBrowser(this.platformId)) {
      document.querySelector(`#${sectionId}`)?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  }
}
