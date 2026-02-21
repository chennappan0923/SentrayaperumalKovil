import { CommonModule } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { SelectModule } from 'primeng/select';
import { FirebaseDataService } from '../../core/firebase-data.service';
import { Devotee, RecordWithId, TaxEntry } from '../../core/models';
import { ExportColumn, ExportService } from '../../core/export.service';

@Component({
  selector: 'app-tax-report',
  imports: [CommonModule, FormsModule, TableModule, TagModule, SelectModule],
  templateUrl: './tax-report.component.html',
  styleUrl: './tax-report.component.css'
})
export class TaxReportComponent implements OnDestroy {
  entries: RecordWithId<TaxEntry>[] = [];
  allEntries: RecordWithId<TaxEntry>[] = [];
  activeDevoteeNames = new Set<string>();
  totalPaid = 0;
  totalPending = 0;
  selectedYear: number | null = null;
  yearOptions: Array<{ label: string; value: number | null }> = [{ label: 'All Years', value: null }];
  readonly tableColumns: ExportColumn<RecordWithId<TaxEntry>>[] = [
    { header: 'Devotee', key: 'devoteeName' },
    { header: 'Village', key: 'villageName' },
    { header: 'Year', key: 'year' },
    { header: 'Amount', key: 'amount' },
    { header: 'Paid', key: 'paid' }
  ];
  private readonly subs: Subscription[] = [];

  constructor(private readonly data: FirebaseDataService, private readonly exporter: ExportService) {
    this.subs.push(
      this.data.list$<Devotee>('devotees').subscribe((devotees) => {
        this.activeDevoteeNames = new Set(devotees.filter((x) => x.status === 'Active').map((x) => x.taxpersonName));
        this.recompute();
      })
    );
    this.subs.push(
      this.data.list$<TaxEntry>('taxEntries').subscribe((items) => {
        this.allEntries = items;
        this.yearOptions = [
          { label: 'All Years', value: null },
          ...Array.from(new Set(items.map((x) => x.year)))
            .sort((a, b) => b - a)
            .map((year) => ({ label: String(year), value: year }))
        ];
        this.recompute();
      })
    );
  }

  onYearChange(year: number | null) {
    this.selectedYear = year;
    this.recompute();
  }

  exportExcel() { this.exporter.exportExcel('tax-report', this.entries, this.tableColumns); }
  exportPdf() { this.exporter.exportPdf('Tax Report', 'tax-report', this.entries, this.tableColumns); }
  printTable() { this.exporter.printTable('Tax Report', this.entries, this.tableColumns); }

  private recompute() {
    this.entries = this.allEntries.filter((item) => {
      const matchesYear = this.selectedYear === null || item.year === this.selectedYear;
      const activeOnly = this.activeDevoteeNames.has(item.devoteeName);
      return matchesYear && activeOnly;
    });
    this.totalPaid = this.entries.filter((x) => x.paid).reduce((sum, x) => sum + x.amount, 0);
    this.totalPending = this.entries.filter((x) => !x.paid).reduce((sum, x) => sum + x.amount, 0);
  }

  ngOnDestroy(): void { this.subs.forEach((sub) => sub.unsubscribe()); }
}

