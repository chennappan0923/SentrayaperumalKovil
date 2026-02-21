import { CommonModule } from '@angular/common';
import { Component, OnDestroy, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { FirebaseDataService } from '../../core/firebase-data.service';
import { DonationMaster, RecordWithId } from '../../core/models';
import { ExportColumn, ExportService } from '../../core/export.service';

@Component({
  selector: 'app-donation-master',
  imports: [CommonModule, ReactiveFormsModule, ButtonModule, InputTextModule, SelectModule, TableModule, TagModule],
  templateUrl: './donation-master.component.html',
  styleUrl: './donation-master.component.css'
})
export class DonationMasterComponent implements OnDestroy {
  private readonly fb = inject(FormBuilder);

  showForm = false;
  donationTypes: RecordWithId<DonationMaster>[] = [];
  statusOptions = ['Active', 'Inactive'];
  isSaving = false;
  formMessage = '';
  formError = '';
  readonly tableColumns: ExportColumn<RecordWithId<DonationMaster>>[] = [
    { header: 'Donation Type', key: 'donationType' },
    { header: 'Description', key: 'description' },
    { header: 'Status', key: 'status' }
  ];

  readonly form = this.fb.nonNullable.group({
    donationType: ['', Validators.required],
    description: [''],
    status: ['Active' as 'Active' | 'Inactive', Validators.required]
  });

  private readonly sub: Subscription;

  constructor(private readonly data: FirebaseDataService, private readonly exporter: ExportService) {
    this.sub = this.data.list$<DonationMaster>('donationMasters').subscribe((items) => (this.donationTypes = items));
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
      await this.data.add<DonationMaster>('donationMasters', { ...this.form.getRawValue(), createdAt: new Date().toISOString() });
      this.form.reset({ donationType: '', description: '', status: 'Active' });
      this.showForm = false;
      this.formMessage = 'Donation type saved successfully.';
    } catch (err) {
      console.error(err);
      this.formError = 'Unable to save donation type right now.';
    } finally {
      this.isSaving = false;
    }
  }

  async toggleStatus(item: RecordWithId<DonationMaster>) {
    const nextStatus: DonationMaster['status'] = item.status === 'Active' ? 'Inactive' : 'Active';
    await this.data.update<DonationMaster>('donationMasters', item.id, { status: nextStatus });
  }

  exportExcel() { this.exporter.exportExcel('donation-master', this.donationTypes, this.tableColumns); }
  exportPdf() { this.exporter.exportPdf('Donation Master', 'donation-master', this.donationTypes, this.tableColumns); }
  printTable() { this.exporter.printTable('Donation Master', this.donationTypes, this.tableColumns); }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
