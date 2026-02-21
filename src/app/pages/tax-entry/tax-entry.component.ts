import { CommonModule } from '@angular/common';
import { Component, OnDestroy, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { FirebaseDataService } from '../../core/firebase-data.service';
import { Devotee, RecordWithId, TaxEntry, Village } from '../../core/models';
import { ExportColumn, ExportService } from '../../core/export.service';

@Component({
  selector: 'app-tax-entry',
  imports: [CommonModule, ReactiveFormsModule, ButtonModule, InputNumberModule, InputTextModule, SelectModule, TableModule, TagModule],
  templateUrl: './tax-entry.component.html',
  styleUrl: './tax-entry.component.css'
})
export class TaxEntryComponent implements OnDestroy {
  private readonly fb = inject(FormBuilder);

  devotees: RecordWithId<Devotee>[] = [];
  villages: RecordWithId<Village>[] = [];
  filteredDevotees: RecordWithId<Devotee>[] = [];
  entries: RecordWithId<TaxEntry>[] = [];
  taxTypeOptions = ['Full', 'Half'];
  paymentStatusOptions = [
    { label: 'Paid', value: true },
    { label: 'Pending', value: false }
  ];
  isSaving = false;
  formMessage = '';
  formError = '';
  readonly tableColumns: ExportColumn<RecordWithId<TaxEntry>>[] = [
    { header: 'Devotee', key: 'devoteeName' },
    { header: 'Village', key: 'villageName' },
    { header: 'Year', key: 'year' },
    { header: 'Amount', key: 'amount' },
    { header: 'Status', key: 'paid' }
  ];

  readonly form = this.fb.nonNullable.group({
    villageName: ['', Validators.required],
    devoteeName: ['', Validators.required],
    taxType: ['Full' as 'Full' | 'Half', Validators.required],
    year: [new Date().getFullYear(), Validators.required],
    amount: [0, [Validators.required, Validators.min(1)]],
    paymentDate: [new Date().toISOString().slice(0, 10), Validators.required],
    paid: [false, Validators.required]
  });

  private readonly subs: Subscription[] = [];

  constructor(private readonly data: FirebaseDataService, private readonly exporter: ExportService) {
    this.subs.push(this.data.list$<Village>('villages').subscribe((items) => (this.villages = items)));
    this.subs.push(this.data.list$<Devotee>('devotees').subscribe((items) => (this.devotees = items)));
    this.subs.push(this.data.list$<TaxEntry>('taxEntries').subscribe((items) => (this.entries = items)));
  }

  onVillageChange(villageName: string) {
    this.filteredDevotees = this.devotees.filter((item) => item.villageName === villageName);
    this.form.patchValue({ devoteeName: '', taxType: 'Full' });
  }

  onDevoteeChange(name: string) {
    const devotee = this.filteredDevotees.find((item) => item.taxpersonName === name);
    if (devotee) {
      this.form.patchValue({ villageName: devotee.villageName, taxType: devotee.taxType });
    }
  }

  async save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.formError = 'Please fill the required fields.';
      this.formMessage = '';
      return;
    }
    this.isSaving = true;
    this.formError = '';
    this.formMessage = '';
    try {
      await this.data.add<TaxEntry>('taxEntries', { ...this.form.getRawValue(), createdAt: new Date().toISOString() });
      this.form.patchValue({ villageName: '', devoteeName: '', taxType: 'Full', amount: 0, paid: false });
      this.filteredDevotees = [];
      this.formMessage = 'Tax entry saved successfully.';
    } catch (err) {
      console.error(err);
      this.formError = 'Unable to save tax entry right now.';
    } finally {
      this.isSaving = false;
    }
  }

  async deleteItem(item: RecordWithId<TaxEntry>) {
    await this.data.remove('taxEntries', item.id);
  }

  exportExcel() { this.exporter.exportExcel('tax-entry', this.entries, this.tableColumns); }
  exportPdf() { this.exporter.exportPdf('Tax Entries', 'tax-entry', this.entries, this.tableColumns); }
  printTable() { this.exporter.printTable('Tax Entries', this.entries, this.tableColumns); }

  ngOnDestroy(): void {
    this.subs.forEach((sub) => sub.unsubscribe());
  }
}
