import { Component, OnInit, EventEmitter, NgZone, ViewChild} from '@angular/core';
import { Router, RouterLink, ROUTER_DIRECTIVES} from '@angular/router';


@Component({
    moduleId: module.id,
    selector: 'read-appointment',
    templateUrl: 'app.welcome.html',
    directives: [ROUTER_DIRECTIVES]
})
export class Welcome {
    showmore: boolean  = false
    constructor(private router: Router, private ngZone: NgZone) {
        var value = Office.context.roamingSettings.get('showWelcomeV1');
        if (value === false) {
            this.router.navigateByUrl('/book');
        }

    }

    next() {
        Office.context.roamingSettings.set('showWelcomeV1', false);
        Office.context.roamingSettings.saveAsync((res) => {
            this.router.navigateByUrl('/book');
        });
    }

    more() {
        this.showmore = true;
    }
}