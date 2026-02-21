import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';
import { AppShellComponent } from './layout/app-shell/app-shell.component';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { VillageMasterComponent } from './pages/village-master/village-master.component';
import { DevoteesComponent } from './pages/devotees/devotees.component';
import { TaxMasterComponent } from './pages/tax-master/tax-master.component';
import { DonationMasterComponent } from './pages/donation-master/donation-master.component';
import { PettycashMasterComponent } from './pages/pettycash-master/pettycash-master.component';
import { TaxEntryComponent } from './pages/tax-entry/tax-entry.component';
import { DonationScreenComponent } from './pages/donation-screen/donation-screen.component';
import { InterestComponent } from './pages/interest/interest.component';
import { PaymentComponent } from './pages/payment/payment.component';
import { TaxReportComponent } from './pages/tax-report/tax-report.component';
import { DonationReportComponent } from './pages/donation-report/donation-report.component';
import { PaymentReportComponent } from './pages/payment-report/payment-report.component';
import { OverallReportComponent } from './pages/overall-report/overall-report.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: AppShellComponent,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent, data: { titleKey: 'route.dashboard' } },
      { path: 'village-master', component: VillageMasterComponent, data: { titleKey: 'route.villageMaster' } },
      { path: 'devotees', component: DevoteesComponent, data: { titleKey: 'route.devotees' } },
      { path: 'tax-master', component: TaxMasterComponent, data: { titleKey: 'route.taxMaster' } },
      { path: 'donation-master', component: DonationMasterComponent, data: { titleKey: 'route.donationMaster' } },
      { path: 'pettycash-master', component: PettycashMasterComponent, data: { titleKey: 'route.pettyCashMaster' } },
      { path: 'tax-entry', component: TaxEntryComponent, data: { titleKey: 'route.taxEntry' } },
      { path: 'donation-screen', component: DonationScreenComponent, data: { titleKey: 'route.donationScreen' } },
      { path: 'interest', component: InterestComponent, data: { titleKey: 'route.interest' } },
      { path: 'payment', component: PaymentComponent, data: { titleKey: 'route.payment' } },
      { path: 'tax-report', component: TaxReportComponent, data: { titleKey: 'route.taxReport' } },
      { path: 'donation-report', component: DonationReportComponent, data: { titleKey: 'route.donationReport' } },
      { path: 'payment-report', component: PaymentReportComponent, data: { titleKey: 'route.paymentReport' } },
      { path: 'overall-report', component: OverallReportComponent, data: { titleKey: 'route.overallReport' } },
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' }
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];
