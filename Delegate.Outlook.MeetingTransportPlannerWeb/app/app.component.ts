import { Component } from '@angular/core';
import { ReadAppointment } from './app.readappointment';

@Component({
    selector: 'my-app',
    template: `<h1>Delegate Outlook Meeting Tranport Planner 1</h1>
    <read-appointment></read-appointment>`,
    directives: [ReadAppointment]
})
export class AppComponent {

}