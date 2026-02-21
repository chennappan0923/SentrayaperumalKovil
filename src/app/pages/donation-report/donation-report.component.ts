import { CommonModule } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { TableModule } from 'primeng/table';
import { FirebaseDataService } from '../../core/firebase-data.service';
import { DonationEntry, RecordWithId } from '../../core/models';
import { ExportColumn, ExportService } from '../../core/export.service';

@Component({
  selector: 'app-donation-report',
  imports: [CommonModule, TableModule],
  templateUrl: './donation-report.component.html',
  styleUrl: './donation-report.component.css'
})
export class DonationReportComponent implements OnDestroy {
  entries: RecordWithId<DonationEntry>[] = [];
  total = 0;
  readonly tableColumns: ExportColumn<RecordWithId<DonationEntry>>[] = [
    { header: 'Devotee', key: 'devoteeName' },
    { header: 'Donation Type', key: 'donationType' },
    { header: 'Amount', key: 'amount' },
    { header: 'Date', key: 'paymentDate' },
    { header: 'Notes', key: 'notes' }
  ];
  private readonly sub: Subscription;

  constructor(private readonly data: FirebaseDataService, private readonly exporter: ExportService) {
    this.sub = this.data.list$<DonationEntry>('donationEntries').subscribe((items) => {
      this.entries = items;
      this.total = items.reduce((sum, item) => sum + item.amount, 0);
    });
  }

  exportExcel() { this.exporter.exportExcel('donation-report', this.entries, this.tableColumns); }
  exportPdf() { this.exporter.exportPdf('Donation Report', 'donation-report', this.entries, this.tableColumns); }
  printTable() { this.exporter.printTable('Donation Report', this.entries, this.tableColumns); }

  ngOnDestroy(): void { this.sub.unsubscribe(); }
}

