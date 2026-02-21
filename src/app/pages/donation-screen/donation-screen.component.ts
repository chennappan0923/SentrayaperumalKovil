import { CommonModule } from '@angular/common';
import { Component, OnDestroy, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { FirebaseDataService } from '../../core/firebase-data.service';
import { Devotee, DonationEntry, DonationMaster, RecordWithId } from '../../core/models';
import { ExportColumn, ExportService } from '../../core/export.service';

@Component({
  selector: 'app-donation-screen',
  imports: [CommonModule, ReactiveFormsModule, ButtonModule, InputNumberModule, InputTextModule, SelectModule, TableModule],
  templateUrl: './donation-screen.component.html',
  styleUrl: './donation-screen.component.css'
})
export class DonationScreenComponent implements OnDestroy {
  private readonly fb = inject(FormBuilder);

  devotees: RecordWithId<Devotee>[] = [];
  donationTypes: RecordWithId<DonationMaster>[] = [];
  entries: RecordWithId<DonationEntry>[] = [];
  isSaving = false;
  formMessage = '';
  formError = '';
  readonly tableColumns: ExportColumn<RecordWithId<DonationEntry>>[] = [
    { header: 'Devotee', key: 'devoteeName' },
    { header: 'Donation Type', key: 'donationType' },
    { header: 'Amount', key: 'amount' },
    { header: 'Date', key: 'paymentDate' },
    { header: 'Notes', key: 'notes' }
  ];
  private readonly subs: Subscription[] = [];

  readonly form = this.fb.nonNullable.group({
    devoteeName: ['', Validators.required],
    donationType: ['', Validators.required],
    amount: [0, [Validators.required, Validators.min(1)]],
    paymentDate: [new Date().toISOString().slice(0, 10), Validators.required],
    notes: ['']
  });

  constructor(private readonly data: FirebaseDataService, private readonly exporter: ExportService) {
    this.subs.push(this.data.list$<Devotee>('devotees').subscribe((items) => (this.devotees = items)));
    this.subs.push(this.data.list$<DonationMaster>('donationMasters').subscribe((items) => (this.donationTypes = items)));
    this.subs.push(this.data.list$<DonationEntry>('donationEntries').subscribe((items) => (this.entries = items)));
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
      await this.data.add<DonationEntry>('donationEntries', { ...this.form.getRawValue(), createdAt: new Date().toISOString() });
      this.form.patchValue({ devoteeName: '', amount: 0, notes: '' });
      this.formMessage = 'Donation entry saved successfully.';
    } catch (err) {
      console.error(err);
      this.formError = 'Unable to save donation entry right now.';
    } finally {
      this.isSaving = false;
    }
  }

  async deleteItem(item: RecordWithId<DonationEntry>) {
    await this.data.remove('donationEntries', item.id);
  }

  exportExcel() { this.exporter.exportExcel('donation-entry', this.entries, this.tableColumns); }
  exportPdf() { this.exporter.exportPdf('Donation Entries', 'donation-entry', this.entries, this.tableColumns); }
  printTable() { this.exporter.printTable('Donation Entries', this.entries, this.tableColumns); }

  ngOnDestroy(): void {
    this.subs.forEach((sub) => sub.unsubscribe());
  }
}
