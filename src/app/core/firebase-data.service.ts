import { Injectable, inject } from '@angular/core';
import { Firestore, addDoc, collection, collectionData, deleteDoc, doc, updateDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FirebaseDataService {
  private readonly firestore = inject(Firestore);

  list$<T>(path: string): Observable<(T & { id: string })[]> {
    const ref = collection(this.firestore, path);
    return collectionData(ref, { idField: 'id' }) as Observable<(T & { id: string })[]>;
  }

  add<T>(path: string, data: T) {
    const ref = collection(this.firestore, path);
    return addDoc(ref, data as object);
  }

  update<T>(path: string, id: string, data: Partial<T>) {
    const ref = doc(this.firestore, `${path}/${id}`);
    return updateDoc(ref, data as object);
  }

  remove(path: string, id: string) {
    const ref = doc(this.firestore, `${path}/${id}`);
    return deleteDoc(ref);
  }
}
