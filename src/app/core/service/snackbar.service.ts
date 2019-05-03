import { Subject, Observable } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class SnackBarService {
    private subject = new Subject<any>();

    notifyAll(message: string) {
        this.subject.next(message);
    }

    onMessageReceived(): Observable<any> {
        return this.subject.asObservable();
    }
}
