import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  imports:[CommonModule,ReactiveFormsModule]
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  error: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.loginForm = this.fb.group({
      username: [''],
      password: ['']
    });
  }

  ngOnInit(): void {
    // If user is already logged in, redirect them away from the login page.
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/']);
    }
  }

  login(): void {
    const { username, password } = this.loginForm.value;
    this.authService.login(username, password).subscribe({
      next: () => this.router.navigate(['/']),
      error: () => this.error = 'Login failed'
    });
  }
}
