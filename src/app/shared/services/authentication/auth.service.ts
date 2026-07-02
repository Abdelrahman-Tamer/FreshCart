import { HttpClient } from '@angular/common/http';
import { inject, Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { jwtDecode } from "jwt-decode";
import { CookieService } from 'ngx-cookie-service';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly _HttpClient = inject(HttpClient)
  private readonly _CookieService = inject(CookieService)
  private readonly platformId = inject(PLATFORM_ID)
  userInfo: any;

  private loginStatus = new BehaviorSubject<boolean>(false);
  isLoggedIn = this.loginStatus.asObservable();

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const token = this._CookieService.get('token');
      if (token) {
        if (this.isTokenValid(token)) {
          this.loginStatus.next(true);
          this.decodeToken();
        } else {
          this.logOut();
        }
      }
    }
  }

  get userName(): string {
    return this.userInfo?.name || '';
  }

  getUserRole(): string {
    return this.userInfo?.role || '';
  }

  isAuthenticated(): boolean {
    if (!isPlatformBrowser(this.platformId)) return false;
    const token = this._CookieService.get('token');
    return !!token && this.isTokenValid(token);
  }

  private isTokenValid(token: string): boolean {
    try {
      const decoded: any = jwtDecode(token);
      if (decoded.exp && decoded.exp * 1000 < Date.now()) {
        return false;
      }
      return true;
    } catch {
      return false;
    }
  }

  decodeToken() {
    if (!isPlatformBrowser(this.platformId)) return;
    const token = this._CookieService.get('token');
    if (token && this.isTokenValid(token)) {
      this.userInfo = jwtDecode(token);
    } else if (token) {
      this.logOut();
    }
  }

  updateLoginStatus(status: boolean) {
    this.loginStatus.next(status);
  }

  logOut() {
    this._CookieService.delete('token', '/');
    this.userInfo = null;
    this.loginStatus.next(false);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('wishlist');
      localStorage.removeItem('checkout_session');
    }
  }

  SignUp(registerData: object): Observable<any> {
    return this._HttpClient.post(`${environment.baseURL}/api/v1/auth/signup`, registerData);
  }

  SignIn(loginData: object): Observable<any> {
    return this._HttpClient.post(`${environment.baseURL}/api/v1/auth/signin`, loginData);
  }

  forgotPassword(email: object): Observable<any> {
    return this._HttpClient.post(`${environment.baseURL}/api/v1/auth/forgotPasswords`, email);
  }

  verifyResetCode(codeData: object): Observable<any> {
    return this._HttpClient.post(`${environment.baseURL}/api/v1/auth/verifyResetCode`, codeData);
  }

  resetPassword(resetData: object): Observable<any> {
    return this._HttpClient.put(`${environment.baseURL}/api/v1/auth/resetPassword`, resetData);
  }
}
