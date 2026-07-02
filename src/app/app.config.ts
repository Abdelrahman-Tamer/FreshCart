import { ApplicationConfig, importProvidersFrom, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withViewTransitions } from '@angular/router';
import { provideAnimations } from "@angular/platform-browser/animations"
import {CookieService} from 'ngx-cookie-service';
import { provideToastr } from 'ngx-toastr';
import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { headerInterceptor } from './core/interceptors/Header/header-interceptor';
import { errorInterceptor } from './core/interceptors/Error/error-interceptor';
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes , withViewTransitions()),
    provideHttpClient( withFetch() , withInterceptors([headerInterceptor , errorInterceptor]) ),
    provideClientHydration(withEventReplay()),
    provideAnimations(),
    importProvidersFrom(CookieService),
    provideToastr({
      positionClass: 'toast-top-right',
      timeOut: 3000,
      closeButton: true,
      progressBar: true,
      easeTime: 300,
      newestOnTop: true,
      preventDuplicates: true,
      toastClass: 'ngx-toastr freshcart-toast',
    }),
  ]
};
