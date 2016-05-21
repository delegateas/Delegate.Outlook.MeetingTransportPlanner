import { Component, OnInit, EventEmitter, NgZone} from '@angular/core';
import { Observable}     from 'rxjs/Observable';
import {Http, Response} from '@angular/http';

@Component({
    selector: 'read-appointment',
    templateUrl: 'app/app.readappointment.html'
})
export class ReadAppointment implements OnInit {
    subject: string;
    saveInProgress: boolean = false;
    start: Date;
    beforeMeeting: boolean = true;
    length: number = 60;
    origin: string;
    meetingLocation: string;
    destination: string;
    recipients: string;
    saveComplete: boolean = false;
    constructor(private ngZone: NgZone, private http: Http) {




    }

    ngOnInit() {
        this.recipients = Office.context.mailbox.userProfile.emailAddress;

        var appointment = Office.cast.item.toAppointmentCompose(Office.context.mailbox.item);
        appointment.start.getAsync(res => {
            console.log(res.value);
            this.start = res.value;
        });
        appointment.subject.getAsync((res) => {
            this.ngZone.run(() => this.subject = 'Transport for ' + res.value);

        });

        appointment.location.getAsync((res) => {
            this.ngZone.run(() => {
                this.meetingLocation = res.value;
                this.toggleMeetingLocation(this.beforeMeeting);
            });
        });
        

    }

    search() {
        console.log(this.origin);
        this.http.get('/api/distance?origin=' + encodeURIComponent(this.origin) + '&destination=' + encodeURIComponent(this.destination)).subscribe(res => {            
            var json = res.json();            
            if (json.rows[0].elements[0].status == "NOT_FOUND")
                return;
            this.length = Math.round(json.rows[0].elements[0].duration.value / 60);
            this.destination = json.destination_addresses[0];
            this.origin = json.origin_addresses[0];
        });
    }

    onChangeBeforeMeeting(event) {
        this.toggleMeetingLocation(event.currentTarget.checked);
    }

    toggleMeetingLocation(b) {
        console.log("beforeMeeting: " + b);
        if (b) {
            this.origin = this.destination;
            this.destination = this.meetingLocation;
            
        } else {
            this.destination = this.origin;
            this.origin = this.meetingLocation;            
        }
    }

    create() {
        this.saveInProgress = true;
        console.log('create');
        var newStart = new Date(this.start.getTime());     
        newStart.setMinutes(this.start.getMinutes() - this.length);
        var body = this.createAppointment(newStart, this.start, this.subject);
        console.log(body);
        Office.context.mailbox.makeEwsRequestAsync(body, res => {
            console.log(res);
            this.ngZone.run(() => {
                this.saveComplete = true;
                this.saveInProgress = false;
            });
        });
    }

    dismissSaveComplete() {
        this.saveComplete = false;
    }

    createAppointment(start: Date, end: Date, subject: string) {
        var location = (this.beforeMeeting ? this.origin : this.destination);
        if (typeof (location) == 'undefined') {
            location = "";
        }

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
            '<Body BodyType="Text"></Body>' +
            '<ReminderIsSet>true</ReminderIsSet>' +
            '<ReminderMinutesBeforeStart>60</ReminderMinutesBeforeStart>' +
            '<Start>' + start.toISOString() + '</Start>' +
            '<End>' + end.toISOString() + '</End>' +
            '<IsAllDayEvent>false</IsAllDayEvent>' +
            '<LegacyFreeBusyStatus>Busy</LegacyFreeBusyStatus>' +
            '<Location>' + location + '</Location>' +
            '<RequiredAttendees>' +
            '<Attendee>' +
            '<Mailbox>' +
            '<EmailAddress>' + this.recipients + '</EmailAddress>' +
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
