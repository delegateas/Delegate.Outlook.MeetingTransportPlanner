import { Component, OnInit, EventEmitter, NgZone, ViewChild} from '@angular/core';
import { Observable}     from 'rxjs/Observable';
import {Http, Response} from '@angular/http';
import { Dialog} from './app.dialog';

class Meeting {
    constructor(public start?: Date, public end?: Date) {
    }
}

@Component({
    moduleId: module.id,
    selector: 'read-appointment',
    templateUrl: 'app.readappointment.html',
    directives: [Dialog]
})
export class ReadAppointment implements OnInit {
    subject: string;
    saveInProgress: boolean = false;
    beforeMeeting: boolean = true;
    length: number = 60;
    origin: string;
    meetingLocation: string;
    destination: string;
    recipients: string;
    saveComplete: boolean = false;
    originalMeeting: Meeting;
    estimateDrivingTimeError: boolean = false;

    @ViewChild(Dialog) dialog: Dialog;

    constructor(private ngZone: NgZone, private http: Http) {
        this.originalMeeting = new Meeting();



    }

    ngOnInit() {
        this.recipients = Office.context.mailbox.userProfile.emailAddress;

        var appointment = Office.cast.item.toAppointmentCompose(Office.context.mailbox.item);
        appointment.start.getAsync(res => {
            console.log(res.value);
            this.originalMeeting.start = res.value;
        });
        appointment.end.getAsync(res => {
            this.originalMeeting.end = res.value;
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
        this.estimateDrivingTimeError = false;
        var appendTime = "&departure=" + Math.floor(this.originalMeeting.end.getTime() / 1000);
        if (this.beforeMeeting) {
            appendTime = "&arrival=" + Math.floor(this.originalMeeting.start.getTime() / 1000);
        }

        this.http.get('/api/distance?origin=' + encodeURIComponent(this.origin) + '&destination=' + encodeURIComponent(this.destination) + appendTime).subscribe(res => {            
            var json = res.json();            
            if (json.routes.length == 0) {
                this.estimateDrivingTimeError = true;
                return;
            }
            this.length = Math.round(json.routes[0].legs[0].duration.value / 60);
            this.destination = json.routes[0].legs[0].end_address;
            this.origin = json.routes[0].legs[0].start_address;
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
        var body = "";
        if (this.beforeMeeting) {
            var newStart = new Date(this.originalMeeting.start.getTime());
            newStart.setMinutes(this.originalMeeting.start.getMinutes() - this.length);
            body = this.createAppointment(newStart, this.originalMeeting.start, this.subject);
        } else {
            var newEnd = new Date(this.originalMeeting.end.getTime());
            newEnd.setMinutes(this.originalMeeting.end.getMinutes() + this.length);
            body = this.createAppointment(this.originalMeeting.end, newEnd, this.subject);
        }
        
         
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

        var attendees = '';
        this.recipients.split(/,|;| /).forEach(email => {
            attendees += '<Attendee><Mailbox><EmailAddress>' + email + '</EmailAddress></Mailbox></Attendee>';
        });

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
            '<RequiredAttendees>' + attendees +            
            '</RequiredAttendees>' +
            '</t:CalendarItem>' +
            '</Items>' +
            '</CreateItem>' +
            '</soap:Body>' +
            '</soap:Envelope>';
        return result;
    }
}
