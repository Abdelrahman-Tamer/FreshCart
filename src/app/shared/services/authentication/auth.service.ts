import { HttpClient } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { jwtDecode } from "jwt-decode";
import { CookieService } from 'ngx-cookie-service';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly _HttpClient = inject(HttpClient);
  private readonly _CookieService = inject(CookieService);
  private readonly platformId = inject(PLATFORM_ID);
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

  get userAvatar(): string {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('user_avatar') || '';
    }
    return '';
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
      localStorage.removeItem('user_avatar');
    }
  }

  handleSuccessfulAuth(res: any, avatarUrl?: string) {
    if (res?.token) {
      this._CookieService.set('token', res.token, { path: '/', sameSite: 'Lax' });
      if (isPlatformBrowser(this.platformId) && avatarUrl) {
        localStorage.setItem('user_avatar', avatarUrl);
      }
      this.decodeToken();
      this.updateLoginStatus(true);
    }
  }

  loginWithGoogle(googleUser: { email: string; name: string; picture?: string; sub: string }): Observable<any> {
    // Generate a secure deterministic password for RouteMisr backend authentication
    const deterministicPassword = `GoogleAuth#${googleUser.sub.slice(0, 8)}!2026`;

    return new Observable((observer) => {
      // 1. Try to SignIn first
      this.SignIn({ email: googleUser.email, password: deterministicPassword }).subscribe({
        next: (res) => {
          this.handleSuccessfulAuth(res, googleUser.picture);
          observer.next(res);
          observer.complete();
        },
        error: (signInErr) => {
          // 2. If user doesn't exist yet on RouteMisr backend, automatically SignUp
          const registerData = {
            name: googleUser.name || googleUser.email.split('@')[0],
            email: googleUser.email,
            password: deterministicPassword,
            rePassword: deterministicPassword,
            phone: '01012345678'
          };

          this.SignUp(registerData).subscribe({
            next: (signUpRes) => {
              this.handleSuccessfulAuth(signUpRes, googleUser.picture);
              observer.next(signUpRes);
              observer.complete();
            },
            error: (signUpErr) => {
              observer.error(signUpErr || signInErr);
            }
          });
        }
      });
    });
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
