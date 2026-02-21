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
import { Devotee, RecordWithId, Village } from '../../core/models';
import { ExportColumn, ExportService } from '../../core/export.service';

@Component({
  selector: 'app-devotees',
  imports: [CommonModule, ReactiveFormsModule, ButtonModule, InputTextModule, SelectModule, TableModule, TagModule],
  templateUrl: './devotees.component.html',
  styleUrl: './devotees.component.css'
})
export class DevoteesComponent implements OnDestroy {
  private readonly fb = inject(FormBuilder);

  showForm = false;
  villages: RecordWithId<Village>[] = [];
  devotees: RecordWithId<Devotee>[] = [];
  taxTypeOptions = ['Full', 'Half'];
  statusOptions = ['Active', 'Inactive'];
  isSaving = false;
  formMessage = '';
  formError = '';
  readonly tableColumns: ExportColumn<RecordWithId<Devotee>>[] = [
    { header: 'Village', key: 'villageName' },
    { header: 'Taxperson', key: 'taxpersonName' },
    { header: 'Father', key: 'fatherName' },
    { header: 'Tax Type', key: 'taxType' },
    { header: 'SPL', key: 'splName' },
    { header: 'Location', key: 'currentLocation' },
    { header: 'Status', key: 'status' }
  ];

  readonly form = this.fb.nonNullable.group({
    villageName: ['', Validators.required],
    taxpersonName: ['', Validators.required],
    fatherName: [''],
    taxType: ['Full' as 'Full' | 'Half', Validators.required],
    status: ['Active' as 'Active' | 'Inactive', Validators.required],
    splName: [''],
    currentLocation: ['']
  });

  private readonly subs: Subscription[] = [];

  constructor(private readonly data: FirebaseDataService, private readonly exporter: ExportService) {
    this.subs.push(this.data.list$<Village>('villages').subscribe((items) => (this.villages = items)));
    this.subs.push(this.data.list$<Devotee>('devotees').subscribe((items) => (this.devotees = items)));
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
      await this.data.add<Devotee>('devotees', {
        ...this.form.getRawValue(),
        createdAt: new Date().toISOString()
      });

      this.form.reset({
        villageName: '',
        taxpersonName: '',
        fatherName: '',
        taxType: 'Full',
        status: 'Active',
        splName: '',
        currentLocation: ''
      });

      this.showForm = false;
      this.formMessage = 'Devotee saved successfully.';
    } catch (err) {
      console.error(err);
      this.formError = 'Unable to save devotee right now.';
    } finally {
      this.isSaving = false;
    }
  }

  async toggleStatus(item: RecordWithId<Devotee>) {
    const nextStatus: Devotee['status'] = item.status === 'Active' ? 'Inactive' : 'Active';
    await this.data.update<Devotee>('devotees', item.id, { status: nextStatus });
  }

  exportExcel() { this.exporter.exportExcel('devotees', this.devotees, this.tableColumns); }
  exportPdf() { this.exporter.exportPdf('Devotees List', 'devotees', this.devotees, this.tableColumns); }
  printTable() { this.exporter.printTable('Devotees List', this.devotees, this.tableColumns); }

  ngOnDestroy(): void {
    this.subs.forEach((sub) => sub.unsubscribe());
  }
}
