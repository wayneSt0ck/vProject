import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgForm } from "@angular/forms";
import { AuthService } from '../auth.service';

@Component({
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})

export class SignupComponent {

  isLoading = false;

  passwordInput = "";
  emailInput = "";

  constructor(public authService: AuthService, private _snackBar: MatSnackBar) {}


  onSignup(form: NgForm) {
    if (form.invalid) {
      console.log("test");
      return;
    }

    this.authService.createUser(form.value.nameEmail, form.value.password);

  }



}
