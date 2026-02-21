export type RecordWithId<T> = T & { id: string };

export interface Village {
  name: string;
  post: string;
  taluk: string;
  district: string;
  representative: string;
  createdAt: string;
}

export interface Devotee {
  villageName: string;
  taxpersonName: string;
  fatherName: string;
  taxType: 'Full' | 'Half';
  status: 'Active' | 'Inactive';
  splName: string;
  currentLocation: string;
  createdAt: string;
}

export interface TaxMaster {
  taxAmount: number;
  type: 'Full' | 'Half';
  interestPercentage: number;
  status: 'Active' | 'Inactive';
  createdAt: string;
}

export interface DonationMaster {
  donationType: string;
  description: string;
  status: 'Active' | 'Inactive';
  createdAt: string;
}

export interface PettyCashMaster {
  issueType: string;
  description: string;
  status: 'Active' | 'Inactive';
  createdAt: string;
}

export interface TaxEntry {
  devoteeName: string;
  villageName: string;
  taxType: 'Full' | 'Half';
  year: number;
  amount: number;
  paymentDate: string;
  paid: boolean;
  createdAt: string;
}

export interface DonationEntry {
  devoteeName: string;
  donationType: string;
  amount: number;
  paymentDate: string;
  notes: string;
  createdAt: string;
}

export interface InterestEntry {
  devoteeName: string;
  principalAmount: number;
  interestAmount: number;
  paymentDate: string;
  notes: string;
  createdAt: string;
}

export interface PaymentEntry {
  payeeName: string;
  category: string;
  amount: number;
  paymentDate: string;
  notes: string;
  createdAt: string;
}
