import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface UserAddress {
  _id?: string;
  name: string;
  details: string;
  phone: string;
  city: string;
}

export interface UserProfileData {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  active?: boolean;
  addresses?: UserAddress[];
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private readonly _HttpClient = inject(HttpClient);

  getUserProfile(): Observable<{ data: UserProfileData }> {
    return this._HttpClient.get<{ data: UserProfileData }>(`${environment.baseURL}/api/v1/users/getMe`);
  }

  updateUserProfile(data: { name: string; phone?: string }): Observable<any> {
    return this._HttpClient.put(`${environment.baseURL}/api/v1/users/updateMe/`, data);
  }

  changePassword(data: { currentPassword: string; password: string; rePassword: string }): Observable<any> {
    return this._HttpClient.put(`${environment.baseURL}/api/v1/users/changeMyPassword`, data);
  }

  getUserAddresses(): Observable<{ status: string; results: number; data: UserAddress[] }> {
    return this._HttpClient.get<{ status: string; results: number; data: UserAddress[] }>(`${environment.baseURL}/api/v1/addresses`);
  }

  addAddress(address: UserAddress): Observable<{ status: string; message: string; data: UserAddress[] }> {
    return this._HttpClient.post<{ status: string; message: string; data: UserAddress[] }>(`${environment.baseURL}/api/v1/addresses`, address);
  }

  deleteAddress(addressId: string): Observable<{ status: string; message: string; data: UserAddress[] }> {
    return this._HttpClient.delete<{ status: string; message: string; data: UserAddress[] }>(`${environment.baseURL}/api/v1/addresses/${addressId}`);
  }
}
