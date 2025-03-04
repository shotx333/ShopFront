import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  imports:[CommonModule, ReactiveFormsModule]
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  error: string = '';
  redirectUrl: string | null = null;
info: any;

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
      this.handleRedirect();
    }
    
    // Check if we have a redirect URL stored
    this.redirectUrl = localStorage.getItem('redirectUrl');
  }

  login(): void {
    const { username, password } = this.loginForm.value;
    this.authService.login(username, password).subscribe({
      next: () => {
        this.handleRedirect();
      },
      error: () => this.error = 'Login failed'
    });
  }
  
  private handleRedirect(): void {
    // Check if we have a stored redirect URL
    const redirectUrl = localStorage.getItem('redirectUrl');
    if (redirectUrl) {
      // Clear the stored URL
      localStorage.removeItem('redirectUrl');
      // Redirect to the stored URL
      this.router.navigateByUrl(redirectUrl);
    } else {
      // Default redirect to products page
      this.router.navigate(['/products']);
    }
  }
}