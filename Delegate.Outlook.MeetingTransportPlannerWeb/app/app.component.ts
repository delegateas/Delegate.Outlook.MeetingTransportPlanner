import { Component } from '@angular/core';
import { ROUTER_DIRECTIVES } from '@angular/router';

@Component({
    moduleId: module.id,
    selector: 'my-app', 
    templateUrl: 'app.component.html',
    directives: [ROUTER_DIRECTIVES]
})
export class AppComponent {

}