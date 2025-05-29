import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  standalone : true,
  selector   : 'app-register',
  templateUrl: './register.component.html',
  styleUrls  : ['./register.component.css'],
  imports    : [CommonModule, ReactiveFormsModule]
})
export class RegisterComponent implements OnInit {

  form!: FormGroup;
  error: string|null = null;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      username    : ['', Validators.required],
      email       : ['', [Validators.required, Validators.email]],
      password    : ['', [Validators.required, Validators.minLength(8)]],

      firstName   : ['', Validators.required],
      lastName    : ['', Validators.required],
      phoneNumber : ['', Validators.required],
      gender      : ['MALE', Validators.required],
      birthYear   : ['', [Validators.required, Validators.min(1900), Validators.max(2100)]]
    });
  }

  submit(): void {
    if (this.form.invalid){ return; }

    this.auth.register(this.form.value).subscribe({
      next : () => this.router.navigate(['/login']),
      error: err => this.error = err.error ?? 'Registration failed'
    });
  }
}
