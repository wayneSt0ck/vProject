import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthData } from './auth-data.model';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';

import { environment } from "../../environments/environment";

@Injectable({ providedIn: "root" })

export class AuthService {

  private token: string;
  private authStatusListener = new Subject<boolean>();
  private isAuthenticated = false;
  private isAdmin = false;
  private tokenTimer: NodeJS.Timer;

  constructor(private http: HttpClient, private router: Router, private _snackBar: MatSnackBar) {}

  openSnackBar(message: string, action: string) {
    var classType = "";
    console.log(message);
    if (message.includes("Error")) {
      classType = 'red-snackbar';
    } else if (message.includes("Saved")) {
      classType = 'green-snackbar';
    }
    this._snackBar.open(message, action, {
      duration: 4000,
      panelClass: [classType]
    });
  }

  getAuthStatusListener() {
    return this.authStatusListener.asObservable();
  }

  getIsAuth() {
    return this.isAuthenticated;
  }

  getUser() {
    return this.isAdmin;
  }

  createUser(email: string, password: string) {
    console.log("Trying to Create New User");
    const authData: AuthData = {email: email, password: password};
    console.log(authData);
    this.http.post(environment.apiUrl + "/signup", authData)
      .subscribe(response => {
        console.log(response);
      });
  }

  login(email: string, password: string) {

    const authData: AuthData = {email: email, password: password};
    this.http.post<{token: string, expiresIn: number}>(environment.apiUrl + "/login", authData)
    .subscribe(response => {
      //console.log(response);
      //console.log(response);
      var abChar = "";
      const token = response.token;
      this.token = token;
      if (token) {
        const expiresInDuration = response.expiresIn;

        if (expiresInDuration == 3600) {
          this.setAuthTimer(expiresInDuration);
          console.log("Normal User - Timeout - 1Hr");
          this.isAdmin = false;
          abChar = "F";
        }
        else {
          console.log("Admin User Logged In - No Timeout");
          this.isAdmin = true;
          abChar = "T";
        }
        this.isAuthenticated = true;
        this.authStatusListener.next(true);
        const now = new Date();
        const expirationDate = new Date(now.getTime() + expiresInDuration * 1000);
        this.saveAuthData(token, expirationDate, abChar);
        this.router.navigate(['/']);
      } else {
        console.log("Test");
        this.openSnackBar("Login Information is Wrong", "Close")
      }
    })
  }

  getToken() {
    return this.token;
  }

  autoAuthUser() {
    const authInformation = this.getAuthData();

    if (!authInformation) {
      return;
    }

    //console.log(authInformation);

    const now = new Date();
    const expiresIn = authInformation.expirationDate.getTime() - now.getTime();
    const aBool = authInformation.aB;

    if (expiresIn > 0) {
      this.token = authInformation.token;
      this.isAuthenticated = true;
      console.log("Refreshed Here");
      console.log(authInformation.expirationDate);
      //I need to check who is logged in here to check for admin status
      //Remove for now - Include in release build
      //this.setAuthTimer(expiresIn / 1000);
      this.authStatusListener.next(true);
      if (aBool == "T") {
        this.isAdmin = true;
      } else {
        this.isAdmin = false;
      }
      //this.isAdmin = true;
    }

  }

  private setAuthTimer(duration: number) {
    console.log("Setting Timer: " + duration);
    this.tokenTimer = setTimeout(() => {
      this.logout();
    }, duration * 1000);
  }

  logout() {
    console.log("Logging Out = Token: " + this.isAuthenticated);
    this.token = null;
    this.isAuthenticated = false;
    this.authStatusListener.next(false);
    this.isAdmin = false;
    clearTimeout(this.tokenTimer);
    this.clearAuthData();
    this.router.navigate(['login']);
  }

  private saveAuthData(token: string, expirationDate: Date, aBool: string) {
    localStorage.setItem('token', token);
    localStorage.setItem('expirationDate', expirationDate.toISOString());
    localStorage.setItem('ab', aBool);
  }

  private clearAuthData() {
    localStorage.removeItem("token");
    localStorage.removeItem("expirationDate");
    localStorage.removeItem("ab");
  }

  private getAuthData() {
    const token = localStorage.getItem("token");
    const expirationDate = localStorage.getItem("expirationDate");
    const aB = localStorage.getItem("ab");

    if (!token || !expirationDate) {
      return;
    }

    return {
      token: token,
      expirationDate: new Date(expirationDate),
      aB: aB
    }
  }

}
