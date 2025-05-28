import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ChangePasswordComponent } from '../change-password/change-password.component';
import { EditInfoComponent } from '../edit-info/edit-info.component';

@Component({
  standalone : true,
  selector   : 'app-edit-account',
  templateUrl: './edit-account.component.html',
  styleUrls  : ['./edit-account.component.css'],
  imports: [CommonModule, RouterModule, EditInfoComponent, ChangePasswordComponent]
})
export class EditAccountComponent implements OnInit {

  tab: 'info' | 'password' = 'info';
  ngOnInit(): void {}
}
