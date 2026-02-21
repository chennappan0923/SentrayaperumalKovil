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
import { PaymentEntry, PettyCashMaster, RecordWithId } from '../../core/models';
import { ExportColumn, ExportService } from '../../core/export.service';

@Component({
  selector: 'app-payment',
  imports: [CommonModule, ReactiveFormsModule, ButtonModule, InputNumberModule, InputTextModule, SelectModule, TableModule],
  templateUrl: './payment.component.html',
  styleUrl: './payment.component.css'
})
export class PaymentComponent implements OnDestroy {
  private readonly fb = inject(FormBuilder);

  categories: RecordWithId<PettyCashMaster>[] = [];
  entries: RecordWithId<PaymentEntry>[] = [];
  isSaving = false;
  formMessage = '';
  formError = '';
  readonly tableColumns: ExportColumn<RecordWithId<PaymentEntry>>[] = [
    { header: 'Payee', key: 'payeeName' },
    { header: 'Category', key: 'category' },
    { header: 'Amount', key: 'amount' },
    { header: 'Date', key: 'paymentDate' },
    { header: 'Notes', key: 'notes' }
  ];
  private readonly subs: Subscription[] = [];

  readonly form = this.fb.nonNullable.group({
    payeeName: ['', Validators.required],
    category: ['', Validators.required],
    amount: [0, [Validators.required, Validators.min(1)]],
    paymentDate: [new Date().toISOString().slice(0, 10), Validators.required],
    notes: ['']
  });

  constructor(private readonly data: FirebaseDataService, private readonly exporter: ExportService) {
    this.subs.push(this.data.list$<PettyCashMaster>('pettyCashMasters').subscribe((items) => (this.categories = items)));
    this.subs.push(this.data.list$<PaymentEntry>('paymentEntries').subscribe((items) => (this.entries = items)));
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
      await this.data.add<PaymentEntry>('paymentEntries', { ...this.form.getRawValue(), createdAt: new Date().toISOString() });
      this.form.patchValue({ payeeName: '', amount: 0, notes: '' });
      this.formMessage = 'Payment entry saved successfully.';
    } catch (err) {
      console.error(err);
      this.formError = 'Unable to save payment entry right now.';
    } finally {
      this.isSaving = false;
    }
  }

  async deleteItem(item: RecordWithId<PaymentEntry>) {
    await this.data.remove('paymentEntries', item.id);
  }

  exportExcel() { this.exporter.exportExcel('payment-entry', this.entries, this.tableColumns); }
  exportPdf() { this.exporter.exportPdf('Payment Entries', 'payment-entry', this.entries, this.tableColumns); }
  printTable() { this.exporter.printTable('Payment Entries', this.entries, this.tableColumns); }

  ngOnDestroy(): void {
    this.subs.forEach((sub) => sub.unsubscribe());
  }
}
