import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
declare var $: any;
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  user: any;

  constructor(public af: AngularFireAuth) {
    this.af.authState.subscribe(res => {
      this.user = res;
    });
  }
  showAddBook(): void {
    $('#addBookModal').modal('show');
    $('.ui.dropdown').dropdown();
  }

}
