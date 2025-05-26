import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector   : 'app-change-password',
  templateUrl: './change-password.component.html',
  standalone : true,
  imports    : [CommonModule, ReactiveFormsModule]
})
export class ChangePasswordComponent implements OnInit {

  form!: FormGroup;
  success: string | null = null;
  error  : string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group(
      {
        oldPassword    : ['', Validators.required],
        newPassword    : ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', Validators.required]
      },
      { validators: this.passwordMatchValidator }
    );
  }

  /** Custom validator to make sure the two new-password fields agree */
  private passwordMatchValidator(group: FormGroup) {
    const newPwd  = group.get('newPassword')?.value;
    const confirm = group.get('confirmPassword')?.value;
    return newPwd === confirm ? null : { mismatch: true };
  }

  submit(): void {
    if (this.form.invalid) { return; }

    const { oldPassword, newPassword } = this.form.value;

    this.authService.changePassword(oldPassword, newPassword).subscribe({
      next: () => {
        this.success = 'Password changed successfully!';
        this.error   = null;

        /* brief toast-like delay, then bounce home */
        setTimeout(() => this.router.navigate(['/']), 1500);
      },

      /* ---------- PRIMARY FIX ---------- */
      error: (err: HttpErrorResponse) => {
        /**
         *  err.error can be…
         *    • a plain string       → "Current password is incorrect"
         *    • an object            → { error: "Current password is incorrect" }
         *    • something else (network, CORS, etc.)
         */
        if (typeof err.error === 'string') {
          this.error = err.error;

        } else if (err.error?.error) {
          this.error = err.error.error;        // our backend’s { error: … }

        } else if (err.error?.message) {
          this.error = err.error.message;      // Spring default { message: … }

        } else {
          this.error = 'Failed to change password';
        }

        this.success = null;                   // clear any previous success msg
      }
      /* ---------------------------------- */
    });
  }
}
