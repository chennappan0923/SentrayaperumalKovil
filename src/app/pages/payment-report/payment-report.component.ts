import { CommonModule } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { TableModule } from 'primeng/table';
import { FirebaseDataService } from '../../core/firebase-data.service';
import { PaymentEntry, RecordWithId } from '../../core/models';
import { ExportColumn, ExportService } from '../../core/export.service';

@Component({
  selector: 'app-payment-report',
  imports: [CommonModule, TableModule],
  templateUrl: './payment-report.component.html',
  styleUrl: './payment-report.component.css'
})
export class PaymentReportComponent implements OnDestroy {
  entries: RecordWithId<PaymentEntry>[] = [];
  total = 0;
  readonly tableColumns: ExportColumn<RecordWithId<PaymentEntry>>[] = [
    { header: 'Payee', key: 'payeeName' },
    { header: 'Category', key: 'category' },
    { header: 'Amount', key: 'amount' },
    { header: 'Date', key: 'paymentDate' },
    { header: 'Notes', key: 'notes' }
  ];
  private readonly sub: Subscription;

  constructor(private readonly data: FirebaseDataService, private readonly exporter: ExportService) {
    this.sub = this.data.list$<PaymentEntry>('paymentEntries').subscribe((items) => {
      this.entries = items;
      this.total = items.reduce((sum, item) => sum + item.amount, 0);
    });
  }

  exportExcel() { this.exporter.exportExcel('payment-report', this.entries, this.tableColumns); }
  exportPdf() { this.exporter.exportPdf('Payment Report', 'payment-report', this.entries, this.tableColumns); }
  printTable() { this.exporter.printTable('Payment Report', this.entries, this.tableColumns); }

  ngOnDestroy(): void { this.sub.unsubscribe(); }
}

