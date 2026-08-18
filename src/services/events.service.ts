import EventEmitter, { getEventListeners } from "events";

class EventService {
    notifications_event = new EventEmitter();

    constructor() {}

    sendNotificationsEvent() {
        return this.notifications_event.on('successful login', (stream: any) => {
            console.log(stream);
        });
    }
    
}

export default new EventService;