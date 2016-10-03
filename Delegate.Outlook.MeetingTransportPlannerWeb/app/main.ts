import { bootstrap }    from '@angular/platform-browser-dynamic';
import { HTTP_PROVIDERS } from '@angular/http';

import { AppComponent } from './app.component';

import {enableProdMode, provide, PLATFORM_DIRECTIVES} from '@angular/core';
import { Router, RouterLink} from '@angular/router';

import {appRouterProviders} from './app.routes';

import {LocationStrategy, Location, HashLocationStrategy} from '@angular/common';
import { CustomLocationStrategy } from './customlocationStrategy';

enableProdMode();

Office.initialize = reason => {
    bootstrap(AppComponent, [HTTP_PROVIDERS, appRouterProviders, provide(PLATFORM_DIRECTIVES, { useValue: RouterLink, multi: true }), provide(LocationStrategy, { useClass: CustomLocationStrategy })]);    
};
//APp not opened from outlook
//if (typeof (Office.context.mailbox) === 'undefined') {
//bootstrap(AppComponent, [HTTP_PROVIDERS, appRouterProviders, provide(PLATFORM_DIRECTIVES, { useValue: RouterLink, multi: true }), provide(LocationStrategy, { useClass: CustomLocationStrategy })]);
//}