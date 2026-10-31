import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../../environments/environment';
import { jwtDecode } from 'jwt-decode';

export interface GoogleUserProfile {
  sub: string;
  name: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  email: string;
  email_verified?: boolean;
}

declare const google: any;

@Injectable({
  providedIn: 'root'
})
export class GoogleAuthService {
  private readonly platformId = inject(PLATFORM_ID);
  private scriptLoaded = false;

  get isConfigured(): boolean {
    return !!(environment.googleClientId && environment.googleClientId.trim() !== '');
  }

  loadGoogleScript(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) {
      return Promise.resolve();
    }

    if (this.scriptLoaded || (typeof google !== 'undefined' && google?.accounts?.id)) {
      this.scriptLoaded = true;
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const existingScript = document.getElementById('google-gsi-client');
      if (existingScript) {
        this.scriptLoaded = true;
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.id = 'google-gsi-client';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        this.scriptLoaded = true;
        resolve();
      };
      script.onerror = (err) => reject(err);
      document.head.appendChild(script);
    });
  }

  initGoogleId(callback: (credentialResponse: any) => void): void {
    if (!isPlatformBrowser(this.platformId) || !this.isConfigured) return;

    this.loadGoogleScript().then(() => {
      if (typeof google !== 'undefined' && google?.accounts?.id) {
        google.accounts.id.initialize({
          client_id: environment.googleClientId,
          callback: callback,
          auto_select: false,
          cancel_on_tap_outside: true
        });
      }
    }).catch(err => {
      console.warn('Google Identity Services script failed to load:', err);
    });
  }

  renderGoogleButton(
    container: HTMLElement,
    callback: (credentialResponse: any) => void,
    textType: 'continue_with' | 'signup_with' | 'signin_with' = 'continue_with'
  ): void {
    if (!isPlatformBrowser(this.platformId) || !this.isConfigured) return;

    this.loadGoogleScript().then(() => {
      if (typeof google !== 'undefined' && google?.accounts?.id) {
        google.accounts.id.initialize({
          client_id: environment.googleClientId,
          callback: callback,
          auto_select: false,
          cancel_on_tap_outside: true
        });
        google.accounts.id.renderButton(container, {
          theme: 'outline',
          size: 'large',
          type: 'standard',
          shape: 'rectangular',
          text: textType,
          logo_alignment: 'left',
          width: 360
        });
      }
    }).catch(err => {
      console.warn('Error initializing Google Sign-In button:', err);
    });
  }

  decodeGoogleCredential(credential: string): GoogleUserProfile | null {
    try {
      return jwtDecode<GoogleUserProfile>(credential);
    } catch {
      return null;
    }
  }
}
