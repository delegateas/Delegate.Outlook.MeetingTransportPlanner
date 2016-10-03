import { Component, Input } from '@angular/core';


@Component({
    moduleId: module.id,
    selector: 'app-dialog',
    templateUrl: 'app.dialog.html',
})
export class Dialog {
    visible: boolean = false;

    constructor() {
    }

    public show() {
        this.visible = true;
    }

    public hide() {
        this.visible = false;
    }
}