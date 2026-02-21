import { CommonModule } from '@angular/common';
import { Component, OnDestroy, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { FirebaseDataService } from '../../core/firebase-data.service';
import { RecordWithId, TaxMaster } from '../../core/models';
import { ExportColumn, ExportService } from '../../core/export.service';

@Component({
  selector: 'app-tax-master',
  imports: [CommonModule, ReactiveFormsModule, ButtonModule, InputNumberModule, SelectModule, TableModule, TagModule],
  templateUrl: './tax-master.component.html',
  styleUrl: './tax-master.component.css'
})
export class TaxMasterComponent implements OnDestroy {
  private readonly fb = inject(FormBuilder);

  showForm = false;
  taxes: RecordWithId<TaxMaster>[] = [];
  typeOptions = ['Full', 'Half'];
  statusOptions = ['Active', 'Inactive'];
  isSaving = false;
  formMessage = '';
  formError = '';
  readonly tableColumns: ExportColumn<RecordWithId<TaxMaster>>[] = [
    { header: 'Tax Amount', key: 'taxAmount' },
    { header: 'Type', key: 'type' },
    { header: 'Interest Percentage', key: 'interestPercentage' },
    { header: 'Status', key: 'status' }
  ];

  readonly form = this.fb.nonNullable.group({
    taxAmount: [0, [Validators.required, Validators.min(1)]],
    type: ['Full' as 'Full' | 'Half', Validators.required],
    interestPercentage: [0],
    status: ['Active' as 'Active' | 'Inactive', Validators.required]
  });

  private readonly sub: Subscription;

  constructor(private readonly data: FirebaseDataService, private readonly exporter: ExportService) {
    this.sub = this.data.list$<TaxMaster>('taxMasters').subscribe((items) => (this.taxes = items));
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
      await this.data.add<TaxMaster>('taxMasters', {
        ...this.form.getRawValue(),
        createdAt: new Date().toISOString()
      });

      this.form.reset({ taxAmount: 0, type: 'Full', interestPercentage: 0, status: 'Active' });
      this.showForm = false;
      this.formMessage = 'Tax configuration saved successfully.';
    } catch (err) {
      console.error(err);
      this.formError = 'Unable to save tax configuration right now.';
    } finally {
      this.isSaving = false;
    }
  }

  async toggleStatus(item: RecordWithId<TaxMaster>) {
    const nextStatus: TaxMaster['status'] = item.status === 'Active' ? 'Inactive' : 'Active';
    await this.data.update<TaxMaster>('taxMasters', item.id, { status: nextStatus });
  }

  exportExcel() { this.exporter.exportExcel('tax-master', this.taxes, this.tableColumns); }
  exportPdf() { this.exporter.exportPdf('Tax Master', 'tax-master', this.taxes, this.tableColumns); }
  printTable() { this.exporter.printTable('Tax Master', this.taxes, this.tableColumns); }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
