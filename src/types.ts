/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Vendor {
  id?: string; // Firestore id
  pOrg: string;
  d: string;
  vendorCode: string; // Excel Col C - Primary Key
  searchTerm: string; // Excel Col D
  name1: string; // Excel Col E
  name2: string;
  street: string;
  postalCode: string;
  city: string; // Excel Col I
  cty: string; // Excel Col J
  rg: string;
  bankKey: string;
  bankAccount: string;
  taxNumber3: string;
  pan: string;
  industry: string; // Excel Col P (Indus.)
  minorityIndic: string; // Excel Col Q
  sex: string; // Excel Col R
  vendorType: string; // Excel Col S
  regDate: string; // Excel Col T
  validityDate: string; // Excel Col U
  regType: string; // Excel Col V
  phone1: string; // Excel Col W
  phone2: string;
  email: string; // Excel Col Y
  constitution: string;
  addressNotes: string;
  i1_1: string;
  i1_2: string;
  updatedAt: number; // Unix timestamp
}

export interface DashboardStats {
  totalVendors: number;
  validVendors: number;
  expiredVendors: number;
  manufacturers: number;
  traders: number;
  mseManufacturers: number;
  womenMSE: number;
  scstMSE: number;
}

export interface AuthorizedUser {
  id?: string;
  userId: string;
  password: string;
  name?: string;
  updatedAt: number;
}
