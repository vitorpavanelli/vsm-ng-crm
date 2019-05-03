import { ErrorHandler, Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CustomErrorHandler implements ErrorHandler {
  constructor() {}

  handleError(error) {
    if (error instanceof HttpErrorResponse) {
      console.error('There was an HTTP error.', error.message, 'Status code:', (<HttpErrorResponse>error).status);

    } else if (error instanceof TypeError) {
      console.error('There was a Type error.', error.message);

    } else if (error instanceof Error) {
      console.error('There was a general error.', error.message);

    } else {
      console.error('Nobody threw an error but something happened!', error);
    }
  }
}
