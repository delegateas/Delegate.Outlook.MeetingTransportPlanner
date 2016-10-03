import { provideRouter, RouterConfig } from '@angular/router';
import { Welcome } from './app.welcome';
import { ReadAppointment } from './app.readappointment';

const routes: RouterConfig = [
    
    { path: 'welcome', component: Welcome },
    { path: 'book', component: ReadAppointment },
    {
        path: '**',
        redirectTo: '/welcome'
    }
];

export const appRouterProviders = [
    provideRouter(routes)
];