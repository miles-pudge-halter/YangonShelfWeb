import { Component, OnInit, Output } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { Observable } from 'rxjs/observable';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { FirebaseService } from '../../../Services/firebase.service';
import * as firebase from 'firebase/app';
declare var $: any;

@Component({
  selector: 'app-feed-view',
  templateUrl: './feed-view.component.html',
  styleUrls: ['./feed-view.component.css']
})
export class FeedViewComponent implements OnInit {

  @Output() public cUser:any;
  public user: Observable<firebase.User>;

  constructor(
    public af: AngularFireAuth,
    public router: Router
  ) {
  }

  ngOnInit() {
    this.user = this.af.authState;
    this.user.subscribe(res => {
      this.cUser=res;
      if (!res) this.router.navigate(['/']);
    });
  }

  showAddBook(): void {
    $('#addBookModal').modal('show');
    $('.ui.dropdown').dropdown();
  }
}
