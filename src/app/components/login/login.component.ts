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
    if (this.authService.isLoggedIn()) {
      this.handleRedirect();
    }
    
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
    const redirectUrl = localStorage.getItem('redirectUrl');
    if (redirectUrl) {
      localStorage.removeItem('redirectUrl');
      this.router.navigateByUrl(redirectUrl);
    } else {
      this.router.navigate(['/products']);
    }
  }
}