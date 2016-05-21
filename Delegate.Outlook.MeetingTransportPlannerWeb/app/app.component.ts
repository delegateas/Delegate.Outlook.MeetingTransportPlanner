import { Component } from '@angular/core';
import { ReadAppointment } from './app.readappointment';

@Component({
    selector: 'my-app',
    templateUrl: 'app/app.component.html',
    directives: [ReadAppointment]
})
export class AppComponent {

}