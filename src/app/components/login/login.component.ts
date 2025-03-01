import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
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
  info: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder,
    private route: ActivatedRoute
  ) {
    this.loginForm = this.fb.group({
      username: [''],
      password: ['']
    });
  }

  ngOnInit(): void {
    // If already logged in, redirect to home
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/']);
    }

    // Check if user was just registered
    this.route.queryParams.subscribe(params => {
      if (params['registered'] === 'true') {
        this.info = 'Registration successful, please log in';
      }
    });
  }

  login(): void {
    const { username, password } = this.loginForm.value;
    this.authService.login(username, password).subscribe({
      next: () => this.router.navigate(['/']),
      error: () => this.error = 'Login failed'
    });
  }
}
