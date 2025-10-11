import { Component, ChangeDetectionStrategy, signal, effect, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  isMenuOpen = signal(false);
  isScrolled = signal(false);
  platformId = inject(PLATFORM_ID);

  navLinks = [
    { label: 'Home', sectionId: 'home' },
    { label: 'Services', sectionId: 'services' },
    { label: 'Portfolio', sectionId: 'portfolio' },
    { label: 'About Us', sectionId: 'about' },
    { label: 'Contact', sectionId: 'contact' },
  ];

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      effect(() => {
        const onScroll = () => {
          this.isScrolled.set(window.scrollY > 50);
        };
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
      });
    }
  }

  toggleMenu(): void {
    this.isMenuOpen.update(open => !open);
  }

  scrollTo(sectionId: string, event: Event): void {
    event.preventDefault();
    if (isPlatformBrowser(this.platformId)) {
      document.querySelector(`#${sectionId}`)?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
    this.isMenuOpen.set(false);
  }
}
