import { CommonModule } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { TableModule } from 'primeng/table';
import { FirebaseDataService } from '../../core/firebase-data.service';
import { DonationEntry, PaymentEntry, RecordWithId, TaxEntry } from '../../core/models';
import { ExportColumn, ExportService } from '../../core/export.service';

@Component({
  selector: 'app-overall-report',
  imports: [CommonModule, TableModule],
  templateUrl: './overall-report.component.html',
  styleUrl: './overall-report.component.css'
})
export class OverallReportComponent implements OnDestroy {
  totalTax = 0;
  totalDonations = 0;
  totalPayments = 0;
  net = 0;

  transactions: Array<{ date: string; type: string; name: string; amount: number }> = [];
  readonly tableColumns: ExportColumn<{ date: string; type: string; name: string; amount: number }>[] = [
    { header: 'Date', key: 'date' },
    { header: 'Type', key: 'type' },
    { header: 'Name', key: 'name' },
    { header: 'Amount', key: 'amount' }
  ];
  private taxEntries: RecordWithId<TaxEntry>[] = [];
  private donationEntries: RecordWithId<DonationEntry>[] = [];
  private paymentEntries: RecordWithId<PaymentEntry>[] = [];

  private readonly subs: Subscription[] = [];

  constructor(private readonly data: FirebaseDataService, private readonly exporter: ExportService) {
    this.subs.push(
      this.data.list$<TaxEntry>('taxEntries').subscribe((items) => {
        this.taxEntries = items;
        this.totalTax = items.filter((x) => x.paid).reduce((sum, x) => sum + x.amount, 0);
        this.recomputeNet();
        this.buildTransactions();
      })
    );

    this.subs.push(
      this.data.list$<DonationEntry>('donationEntries').subscribe((items) => {
        this.donationEntries = items;
        this.totalDonations = items.reduce((sum, x) => sum + x.amount, 0);
        this.recomputeNet();
        this.buildTransactions();
      })
    );

    this.subs.push(
      this.data.list$<PaymentEntry>('paymentEntries').subscribe((items) => {
        this.paymentEntries = items;
        this.totalPayments = items.reduce((sum, x) => sum + x.amount, 0);
        this.recomputeNet();
        this.buildTransactions();
      })
    );
  }

  private recomputeNet() {
    this.net = this.totalTax + this.totalDonations - this.totalPayments;
  }

  private buildTransactions() {
    const tax = this.taxEntries.map((item) => ({ date: item.paymentDate, type: 'Tax', name: item.devoteeName, amount: item.amount }));
    const donation = this.donationEntries.map((item) => ({ date: item.paymentDate, type: 'Donation', name: item.devoteeName, amount: item.amount }));
    const payments = this.paymentEntries.map((item) => ({ date: item.paymentDate, type: 'Payment', name: item.payeeName, amount: -Math.abs(item.amount) }));
    this.transactions = [...tax, ...donation, ...payments].sort((a, b) => b.date.localeCompare(a.date));
  }

  exportExcel() { this.exporter.exportExcel('overall-report', this.transactions, this.tableColumns); }
  exportPdf() { this.exporter.exportPdf('Overall Transactions', 'overall-report', this.transactions, this.tableColumns); }
  printTable() { this.exporter.printTable('Overall Transactions', this.transactions, this.tableColumns); }

  ngOnDestroy(): void { this.subs.forEach((sub) => sub.unsubscribe()); }
}

