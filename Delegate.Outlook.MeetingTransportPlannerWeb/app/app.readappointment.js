"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require('@angular/core');
var http_1 = require('@angular/http');
var app_dialog_1 = require('./app.dialog');
var Meeting = (function () {
    function Meeting(start, end) {
        this.start = start;
        this.end = end;
    }
    return Meeting;
}());
var ReadAppointment = (function () {
    function ReadAppointment(ngZone, http) {
        this.ngZone = ngZone;
        this.http = http;
        this.saveInProgress = false;
        this.beforeMeeting = true;
        this.length = 60;
        this.saveComplete = false;
        this.estimateDrivingTimeError = false;
        this.originalMeeting = new Meeting();
    }
    ReadAppointment.prototype.ngOnInit = function () {
        var _this = this;
        this.recipients = Office.context.mailbox.userProfile.emailAddress;
        var appointment = Office.cast.item.toAppointmentCompose(Office.context.mailbox.item);
        appointment.start.getAsync(function (res) {
            console.log(res.value);
            _this.originalMeeting.start = res.value;
        });
        appointment.end.getAsync(function (res) {
            _this.originalMeeting.end = res.value;
        });
        appointment.subject.getAsync(function (res) {
            _this.ngZone.run(function () { return _this.subject = 'Transport for ' + res.value; });
        });
        appointment.location.getAsync(function (res) {
            _this.ngZone.run(function () {
                _this.meetingLocation = res.value;
                _this.toggleMeetingLocation(_this.beforeMeeting);
            });
        });
    };
    ReadAppointment.prototype.search = function () {
        var _this = this;
        console.log(this.origin);
        this.estimateDrivingTimeError = false;
        var appendTime = "&departure=" + Math.floor(this.originalMeeting.end.getTime() / 1000);
        if (this.beforeMeeting) {
            appendTime = "&arrival=" + Math.floor(this.originalMeeting.start.getTime() / 1000);
        }
        this.http.get('/api/distance?origin=' + encodeURIComponent(this.origin) + '&destination=' + encodeURIComponent(this.destination) + appendTime).subscribe(function (res) {
            var json = res.json();
            if (json.routes.length == 0) {
                _this.estimateDrivingTimeError = true;
                return;
            }
            _this.length = Math.round(json.routes[0].legs[0].duration.value / 60);
            _this.destination = json.routes[0].legs[0].end_address;
            _this.origin = json.routes[0].legs[0].start_address;
        });
    };
    ReadAppointment.prototype.onChangeBeforeMeeting = function (event) {
        this.toggleMeetingLocation(event.currentTarget.checked);
    };
    ReadAppointment.prototype.toggleMeetingLocation = function (b) {
        console.log("beforeMeeting: " + b);
        if (b) {
            this.origin = this.destination;
            this.destination = this.meetingLocation;
        }
        else {
            this.destination = this.origin;
            this.origin = this.meetingLocation;
        }
    };
    ReadAppointment.prototype.create = function () {
        var _this = this;
        this.saveInProgress = true;
        console.log('create');
        var body = "";
        if (this.beforeMeeting) {
            var newStart = new Date(this.originalMeeting.start.getTime());
            newStart.setMinutes(this.originalMeeting.start.getMinutes() - this.length);
            body = this.createAppointment(newStart, this.originalMeeting.start, this.subject);
        }
        else {
            var newEnd = new Date(this.originalMeeting.end.getTime());
            newEnd.setMinutes(this.originalMeeting.end.getMinutes() + this.length);
            body = this.createAppointment(this.originalMeeting.end, newEnd, this.subject);
        }
        console.log(body);
        Office.context.mailbox.makeEwsRequestAsync(body, function (res) {
            console.log(res);
            _this.ngZone.run(function () {
                _this.saveComplete = true;
                _this.saveInProgress = false;
            });
        });
    };
    ReadAppointment.prototype.dismissSaveComplete = function () {
        this.saveComplete = false;
    };
    ReadAppointment.prototype.createAppointment = function (start, end, subject) {
        var location = (this.beforeMeeting ? this.origin : this.destination);
        if (typeof (location) == 'undefined') {
            location = "";
        }
        var attendees = '';
        this.recipients.split(/,|;| /).forEach(function (email) {
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
    };
    __decorate([
        core_1.ViewChild(app_dialog_1.Dialog), 
        __metadata('design:type', app_dialog_1.Dialog)
    ], ReadAppointment.prototype, "dialog", void 0);
    ReadAppointment = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: 'read-appointment',
            templateUrl: 'app.readappointment.html',
            directives: [app_dialog_1.Dialog]
        }), 
        __metadata('design:paramtypes', [core_1.NgZone, http_1.Http])
    ], ReadAppointment);
    return ReadAppointment;
}());
exports.ReadAppointment = ReadAppointment;
//# sourceMappingURL=app.readappointment.js.map