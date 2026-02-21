import { CommonModule } from '@angular/common';
import { Component, OnDestroy, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { FirebaseDataService } from '../../core/firebase-data.service';
import { RecordWithId, Village } from '../../core/models';
import { ExportColumn, ExportService } from '../../core/export.service';

@Component({
  selector: 'app-village-master',
  imports: [CommonModule, ReactiveFormsModule, ButtonModule, InputTextModule, TableModule],
  templateUrl: './village-master.component.html',
  styleUrl: './village-master.component.css'
})
export class VillageMasterComponent implements OnDestroy {
  private readonly fb = inject(FormBuilder);

  showForm = false;
  villages: RecordWithId<Village>[] = [];
  isSaving = false;
  formMessage = '';
  formError = '';
  readonly tableColumns: ExportColumn<RecordWithId<Village>>[] = [
    { header: 'Village Name', key: 'name' },
    { header: 'Post', key: 'post' },
    { header: 'Taluk', key: 'taluk' },
    { header: 'District', key: 'district' },
    { header: 'Representative', key: 'representative' }
  ];

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    post: [''],
    taluk: [''],
    district: [''],
    representative: ['']
  });

  private readonly sub: Subscription;

  constructor(private readonly data: FirebaseDataService, private readonly exporter: ExportService) {
    this.sub = this.data.list$<Village>('villages').subscribe((items) => (this.villages = items));
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
      await this.data.add<Village>('villages', {
        ...this.form.getRawValue(),
        createdAt: new Date().toISOString()
      });

      this.form.reset({ name: '', post: '', taluk: '', district: '', representative: '' });
      this.showForm = false;
      this.formMessage = 'Village saved successfully.';
    } catch (err) {
      console.error(err);
      this.formError = 'Unable to save village right now.';
    } finally {
      this.isSaving = false;
    }
  }

  async deleteVillage(item: RecordWithId<Village>) {
    await this.data.remove('villages', item.id);
  }

  exportExcel() { this.exporter.exportExcel('village-list', this.villages, this.tableColumns); }
  exportPdf() { this.exporter.exportPdf('Village List', 'village-list', this.villages, this.tableColumns); }
  printTable() { this.exporter.printTable('Village List', this.villages, this.tableColumns); }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
