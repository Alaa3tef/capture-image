import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideToastr } from 'ngx-toastr';

import { routes } from './app.routes';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
     provideRouter(routes),
     provideToastr({
      positionClass: 'toast-top-center',
      timeOut: 5000,
      closeButton: true,
      preventDuplicates: true,
      progressBar: true,
    }),
    provideHttpClient(),
    provideHttpClient(withFetch()),
    provideAnimations(),

  ]
};
