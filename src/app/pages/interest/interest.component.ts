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
import { Devotee, InterestEntry, RecordWithId } from '../../core/models';
import { ExportColumn, ExportService } from '../../core/export.service';

@Component({
  selector: 'app-interest',
  imports: [CommonModule, ReactiveFormsModule, ButtonModule, InputNumberModule, InputTextModule, SelectModule, TableModule],
  templateUrl: './interest.component.html',
  styleUrl: './interest.component.css'
})
export class InterestComponent implements OnDestroy {
  private readonly fb = inject(FormBuilder);

  devotees: RecordWithId<Devotee>[] = [];
  entries: RecordWithId<InterestEntry>[] = [];
  isSaving = false;
  formMessage = '';
  formError = '';
  readonly tableColumns: ExportColumn<RecordWithId<InterestEntry>>[] = [
    { header: 'Devotee', key: 'devoteeName' },
    { header: 'Principal Amount', key: 'principalAmount' },
    { header: 'Interest Amount', key: 'interestAmount' },
    { header: 'Date', key: 'paymentDate' },
    { header: 'Notes', key: 'notes' }
  ];
  private readonly subs: Subscription[] = [];

  readonly form = this.fb.nonNullable.group({
    devoteeName: ['', Validators.required],
    principalAmount: [0, [Validators.required, Validators.min(1)]],
    interestAmount: [0, [Validators.required, Validators.min(1)]],
    paymentDate: [new Date().toISOString().slice(0, 10), Validators.required],
    notes: ['']
  });

  constructor(private readonly data: FirebaseDataService, private readonly exporter: ExportService) {
    this.subs.push(this.data.list$<Devotee>('devotees').subscribe((items) => (this.devotees = items)));
    this.subs.push(this.data.list$<InterestEntry>('interestEntries').subscribe((items) => (this.entries = items)));
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
      await this.data.add<InterestEntry>('interestEntries', { ...this.form.getRawValue(), createdAt: new Date().toISOString() });
      this.form.patchValue({ devoteeName: '', principalAmount: 0, interestAmount: 0, notes: '' });
      this.formMessage = 'Interest entry saved successfully.';
    } catch (err) {
      console.error(err);
      this.formError = 'Unable to save interest entry right now.';
    } finally {
      this.isSaving = false;
    }
  }

  async deleteItem(item: RecordWithId<InterestEntry>) {
    await this.data.remove('interestEntries', item.id);
  }

  exportExcel() { this.exporter.exportExcel('interest-entry', this.entries, this.tableColumns); }
  exportPdf() { this.exporter.exportPdf('Interest Entries', 'interest-entry', this.entries, this.tableColumns); }
  printTable() { this.exporter.printTable('Interest Entries', this.entries, this.tableColumns); }

  ngOnDestroy(): void {
    this.subs.forEach((sub) => sub.unsubscribe());
  }
}
