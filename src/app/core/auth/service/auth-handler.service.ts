import { Subject, Observable } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class AuthHandler {
    private subject = new Subject<any>();

    notifyAll() {
        this.subject.next();
    }

    onAuthenticationSuccess(): Observable<any> {
        return this.subject.asObservable();
    }
}
