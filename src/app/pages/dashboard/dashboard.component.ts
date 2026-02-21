import { CommonModule } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { Subscription } from 'rxjs';
import { FirebaseDataService } from '../../core/firebase-data.service';
import { Devotee, DonationEntry, InterestEntry, PaymentEntry, RecordWithId, TaxEntry, Village } from '../../core/models';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterLink, CardModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnDestroy {
  devoteesCount = 0;
  villagesCount = 0;
  taxTotal = 0;
  donationTotal = 0;
  interestTotal = 0;
  expenseTotal = 0;

  readonly stats = [
    { icon: 'pi-users', label: 'Devotees', className: 'primary', value: () => this.devoteesCount.toString() },
    { icon: 'pi-indian-rupee', label: 'Tax Collection', className: 'success', value: () => this.formatCurrency(this.taxTotal) },
    { icon: 'pi-heart', label: 'Donations', className: 'warning', value: () => this.formatCurrency(this.donationTotal) },
    { icon: 'pi-chart-line', label: 'Interest', className: 'info', value: () => this.formatCurrency(this.interestTotal) },
    { icon: 'pi-wallet', label: 'Expenses', className: 'danger', value: () => this.formatCurrency(this.expenseTotal) },
    { icon: 'pi-map-marker', label: 'Villages', className: 'primary', value: () => this.villagesCount.toString() }
  ];

  private readonly subs: Subscription[] = [];

  constructor(private readonly data: FirebaseDataService) {
    this.subs.push(
      this.data.list$<Devotee>('devotees').subscribe((items: RecordWithId<Devotee>[]) => (this.devoteesCount = items.length))
    );
    this.subs.push(
      this.data.list$<Village>('villages').subscribe((items: RecordWithId<Village>[]) => (this.villagesCount = items.length))
    );
    this.subs.push(
      this.data.list$<TaxEntry>('taxEntries').subscribe((items: RecordWithId<TaxEntry>[]) => {
        this.taxTotal = items.filter((x) => x.paid).reduce((sum, x) => sum + x.amount, 0);
      })
    );
    this.subs.push(
      this.data.list$<DonationEntry>('donationEntries').subscribe((items: RecordWithId<DonationEntry>[]) => {
        this.donationTotal = items.reduce((sum, x) => sum + x.amount, 0);
      })
    );
    this.subs.push(
      this.data.list$<InterestEntry>('interestEntries').subscribe((items: RecordWithId<InterestEntry>[]) => {
        this.interestTotal = items.reduce((sum, x) => sum + x.interestAmount, 0);
      })
    );
    this.subs.push(
      this.data.list$<PaymentEntry>('paymentEntries').subscribe((items: RecordWithId<PaymentEntry>[]) => {
        this.expenseTotal = items.reduce((sum, x) => sum + x.amount, 0);
      })
    );
  }

  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
  }

  ngOnDestroy(): void {
    this.subs.forEach((sub) => sub.unsubscribe());
  }
}
