import { bootstrap }    from '@angular/platform-browser-dynamic';
import { HTTP_PROVIDERS } from '@angular/http';

import { AppComponent } from './app.component';

Office.initialize = reason => {
    bootstrap(AppComponent, [HTTP_PROVIDERS]);
};
//APp not opened from outlook
//if (typeof (Office.context.mailbox) === 'undefined') {
//    bootstrap(AppComponent);
//}