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
import { PettyCashMaster, RecordWithId } from '../../core/models';
import { ExportColumn, ExportService } from '../../core/export.service';

@Component({
  selector: 'app-pettycash-master',
  imports: [CommonModule, ReactiveFormsModule, ButtonModule, InputTextModule, SelectModule, TableModule, TagModule],
  templateUrl: './pettycash-master.component.html',
  styleUrl: './pettycash-master.component.css'
})
export class PettycashMasterComponent implements OnDestroy {
  private readonly fb = inject(FormBuilder);

  showForm = false;
  issueTypes: RecordWithId<PettyCashMaster>[] = [];
  statusOptions = ['Active', 'Inactive'];
  isSaving = false;
  formMessage = '';
  formError = '';
  readonly tableColumns: ExportColumn<RecordWithId<PettyCashMaster>>[] = [
    { header: 'Issue Type', key: 'issueType' },
    { header: 'Description', key: 'description' },
    { header: 'Status', key: 'status' }
  ];

  readonly form = this.fb.nonNullable.group({
    issueType: ['', Validators.required],
    description: [''],
    status: ['Active' as 'Active' | 'Inactive', Validators.required]
  });

  private readonly sub: Subscription;

  constructor(private readonly data: FirebaseDataService, private readonly exporter: ExportService) {
    this.sub = this.data.list$<PettyCashMaster>('pettyCashMasters').subscribe((items) => (this.issueTypes = items));
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
      await this.data.add<PettyCashMaster>('pettyCashMasters', { ...this.form.getRawValue(), createdAt: new Date().toISOString() });
      this.form.reset({ issueType: '', description: '', status: 'Active' });
      this.showForm = false;
      this.formMessage = 'Issue type saved successfully.';
    } catch (err) {
      console.error(err);
      this.formError = 'Unable to save issue type right now.';
    } finally {
      this.isSaving = false;
    }
  }

  async toggleStatus(item: RecordWithId<PettyCashMaster>) {
    const nextStatus: PettyCashMaster['status'] = item.status === 'Active' ? 'Inactive' : 'Active';
    await this.data.update<PettyCashMaster>('pettyCashMasters', item.id, { status: nextStatus });
  }

  exportExcel() { this.exporter.exportExcel('pettycash-master', this.issueTypes, this.tableColumns); }
  exportPdf() { this.exporter.exportPdf('Petty Cash Master', 'pettycash-master', this.issueTypes, this.tableColumns); }
  printTable() { this.exporter.printTable('Petty Cash Master', this.issueTypes, this.tableColumns); }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
