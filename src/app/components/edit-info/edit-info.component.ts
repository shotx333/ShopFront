import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';
import { CommonModule } from '@angular/common';
import { switchMap } from 'rxjs';

@Component({
  standalone : true,
  selector   : 'app-edit-info',
  templateUrl: './edit-info.component.html',
  styleUrls  : ['./edit-info.component.css'],
  imports    : [CommonModule, ReactiveFormsModule]
})
export class EditInfoComponent implements OnInit {

  form!: FormGroup;
  avatarPreview?: string;
  user?: User;
  private pendingAvatarFile: File | null = null;
  saved = false;

  constructor(private fb: FormBuilder, private userService: UserService) {}

  ngOnInit(): void {
    this.userService.me().subscribe(u => {
      this.user = u;
      this.avatarPreview = u.avatarUrl || 'default-avatar.jpg';
      this.form = this.fb.group({
        email       : [u.email],
        firstName   : [u.firstName],
        lastName    : [u.lastName],
        birthYear   : [u.birthYear],
        phoneNumber : [u.phoneNumber],
        gender      : [u.gender],
      });
    });
  }

  onFileSelected(ev: Event): void {
    const input = ev.target as HTMLInputElement;
    const file  = input.files?.[0];
    if (!file) { return; }

    this.pendingAvatarFile = file;              // stash it

    const reader = new FileReader();
    reader.onload = e => this.avatarPreview = e.target?.result as string;
    reader.readAsDataURL(file);                 // local preview only
  }

  save(): void {
    if (!this.form.valid) { return; }
    this.saved = false;

    const profile$ = this.userService.update(this.form.value);

    /* If the user picked a new avatar → upload first, then update profile */
    const flow$ = this.pendingAvatarFile
      ? this.userService.uploadAvatar(this.pendingAvatarFile).pipe(
          switchMap(() => profile$)     // avatar done → now profile
        )
      : profile$;                       // no avatar change → just profile

    flow$.subscribe({
      next: u => {
        this.user   = u;
        this.saved  = true;
        this.pendingAvatarFile = null;  // clear the stash
        setTimeout(() => this.saved = false, 2000);
      },
      error: err => alert(err.error ?? 'Save failed')
    });
  }
}

