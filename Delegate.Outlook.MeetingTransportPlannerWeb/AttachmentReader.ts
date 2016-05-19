module Delegate.Outlook.TransportPlanner {

    export class AttachmentReader {


        startTime = () => {
            var a = Office.cast.item.toAppointmentRead(Office.context.mailbox.item);

            a.location
        }
    }   
}