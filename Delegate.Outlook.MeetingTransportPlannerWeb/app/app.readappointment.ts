import { Component, OnInit, EventEmitter, NgZone} from '@angular/core';
import { Observable}     from 'rxjs/Observable';
import {Http, Response} from '@angular/http';

@Component({
    selector: 'read-appointment',
    template: `<h1>Appointment </h1> 
    {{subject}} 
        <input [(ngModel)]="origin"/> 
        <input [(ngModel)]="destination"/> 
    <button (click)=search()>Find driving time</button>


    <input [(ngModel)]="length"/> <button (click)=create()>Create Transport</button>`
})
export class ReadAppointment implements OnInit {
    subject: string;
    start: Date;
    length: number = 60;
    origin: string;
    destination: string;
    constructor(private ngZone: NgZone, private http: Http) {




    }

    ngOnInit() {
        this.subject = "HHLLO"

        var appointment = Office.cast.item.toAppointmentCompose(Office.context.mailbox.item);
        appointment.start.getAsync(res => {
            console.log(res.value);
            this.start = res.value;
        });
        appointment.subject.getAsync((res) => {
            console.log('as7cc');
            this.ngZone.run(() => this.subject = res.value);

        });

        

    }

    search() {
        this.http.get('/api/distance?origin=' + this.origin + '&destination=' + this.destination).subscribe(res => {
            debugger;
            var json = res.json();
            this.length = Math.round(json.rows[0].elements[0].duration.value / 60);
            this.destination = json.destination_addresses[0];
            this.origin = json.origin_addresses[0];
        });
    }

    create() {
        console.log('create');
        var newStart = new Date(this.start.getTime());     
        newStart.setMinutes(this.start.getMinutes() - this.length);
        Office.context.mailbox.makeEwsRequestAsync(this.createAppointment(newStart, this.start, 'Transport for ' + this.subject), res => {
            console.log(res);
        });
    }

    createAppointment(start: Date, end: Date, subject: string) {
        var result = '<?xml version="1.0" encoding="utf-8"?>' +
            '<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"' +
            ' xmlns:xsd="http://www.w3.org/2001/XMLSchema"' +
            ' xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"' +
            ' xmlns:t="http://schemas.microsoft.com/exchange/services/2006/types">' +
            '  <soap:Header>' +
            '    <RequestServerVersion Version="Exchange2013" xmlns="http://schemas.microsoft.com/exchange/services/2006/types" soap:mustUnderstand="0" />' +
            '  </soap:Header>' +
            '<soap:Body>' +
            '<CreateItem xmlns="http://schemas.microsoft.com/exchange/services/2006/messages"' +
            ' xmlns:t="http://schemas.microsoft.com/exchange/services/2006/types"' +
            ' SendMeetingInvitations="SendToAllAndSaveCopy" >' +
            '<SavedItemFolderId>' +
            '<t:DistinguishedFolderId Id="calendar"/>' +
            '</SavedItemFolderId>' +
            '<Items>' +
            '<t:CalendarItem xmlns="http://schemas.microsoft.com/exchange/services/2006/types">' +
            '<Subject>' + subject + '</Subject>' +
            '<Body BodyType="Text">Business meeting about new customers.</Body>' +
            '<ReminderIsSet>true</ReminderIsSet>' +
            '<ReminderMinutesBeforeStart>60</ReminderMinutesBeforeStart>' +
            '<Start>' + start.toISOString() + '</Start>' +
            '<End>' + end.toISOString() + '</End>' +
            '<IsAllDayEvent>false</IsAllDayEvent>' +
            '<LegacyFreeBusyStatus>Busy</LegacyFreeBusyStatus>' +
            '<Location>Meeting Room A</Location>' +
            '<RequiredAttendees>' +
            '<Attendee>' +
            '<Mailbox>' +
            '<EmailAddress>mail@sjkp.dk</EmailAddress>' +
            '</Mailbox>' +
            '</Attendee>' +
            '</RequiredAttendees>' +
            '</t:CalendarItem>' +
            '</Items>' +
            '</CreateItem>' +
            '</soap:Body>' +
            '</soap:Envelope>';
        return result;
    }
}
