import { CommonModule } from '@angular/common';
import { Component, OnDestroy, inject } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter, map, Subscription } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/auth.service';
import { LanguageCode, LanguageService } from '../../core/language.service';

interface NavItem {
  labelKey: string;
  icon: string;
  route: string;
}

interface NavSection {
  titleKey: string;
  items: NavItem[];
}

@Component({
  selector: 'app-app-shell',
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, ButtonModule, FormsModule],
  templateUrl: './app-shell.component.html',
  styleUrl: './app-shell.component.css'
})
export class AppShellComponent implements OnDestroy {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly authService = inject(AuthService);
  readonly lang = inject(LanguageService);

  pageTitleKey = 'route.dashboard';
  sidebarOpen = false;

  readonly navSections: NavSection[] = [
    {
      titleKey: 'nav.main',
      items: [{ labelKey: 'nav.dashboard', icon: 'pi pi-chart-bar', route: '/dashboard' }]
    },
    {
      titleKey: 'nav.masters',
      items: [
        { labelKey: 'nav.villageMaster', icon: 'pi pi-map-marker', route: '/village-master' },
        { labelKey: 'nav.devotees', icon: 'pi pi-users', route: '/devotees' },
        { labelKey: 'nav.taxMaster', icon: 'pi pi-percentage', route: '/tax-master' },
        { labelKey: 'nav.donationMaster', icon: 'pi pi-heart', route: '/donation-master' },
        { labelKey: 'nav.pettyCashMaster', icon: 'pi pi-wallet', route: '/pettycash-master' }
      ]
    },
    {
      titleKey: 'nav.transactions',
      items: [
        { labelKey: 'nav.taxEntry', icon: 'pi pi-file', route: '/tax-entry' },
        { labelKey: 'nav.donationScreen', icon: 'pi pi-gift', route: '/donation-screen' },
        { labelKey: 'nav.interest', icon: 'pi pi-chart-line', route: '/interest' },
        { labelKey: 'nav.payment', icon: 'pi pi-money-bill', route: '/payment' }
      ]
    },
    {
      titleKey: 'nav.reports',
      items: [
        { labelKey: 'nav.taxReport', icon: 'pi pi-file-pdf', route: '/tax-report' },
        { labelKey: 'nav.donationReport', icon: 'pi pi-file-o', route: '/donation-report' },
        { labelKey: 'nav.paymentReport', icon: 'pi pi-receipt', route: '/payment-report' },
        { labelKey: 'nav.overallReport', icon: 'pi pi-chart-pie', route: '/overall-report' }
      ]
    }
  ];

  private readonly routeSub: Subscription;

  constructor() {
    this.routeSub = this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        map(() => {
          let activeRoute = this.route;
          while (activeRoute.firstChild) {
            activeRoute = activeRoute.firstChild;
          }
          return activeRoute.snapshot.data['titleKey'] as string | undefined;
        })
      )
      .subscribe((titleKey) => {
        this.pageTitleKey = titleKey ?? 'route.dashboard';
        this.sidebarOpen = false;
      });
  }

  get currentDate(): string {
    const locale = this.lang.currentLanguage() === 'ta' ? 'ta-IN' : 'en-IN';
    return new Date().toLocaleDateString(locale, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  get selectedLanguage(): LanguageCode {
    return this.lang.currentLanguage();
  }

  set selectedLanguage(value: LanguageCode) {
    this.lang.setLanguage(value);
  }

  async logout() {
    await this.authService.logout();
    await this.router.navigate(['/login']);
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeSidebar() {
    this.sidebarOpen = false;
  }

  ngOnDestroy(): void {
    this.routeSub.unsubscribe();
  }
}
