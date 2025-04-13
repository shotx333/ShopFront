import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
    imports: [ReactiveFormsModule, CommonModule]
})
export class RegisterComponent {
  registerForm: FormGroup;
  error: string = '';

  constructor(private authService: AuthService, private router: Router, private fb: FormBuilder) {
    this.registerForm = this.fb.group({
      username: [''],
      password: [''],
    });
  }

register() {
  const { username, password } = this.registerForm.value;
  this.authService.register(username, password).subscribe({
    next: () => {
      this.authService.login(username, password).subscribe({
        next: () => this.router.navigate(['/']),
        error: () => this.error = 'Login failed after registration'
      });
    },
    error: (err) => this.error = err.error || 'Registration failed'
  });
}

}
