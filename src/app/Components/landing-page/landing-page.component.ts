import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { Observable } from 'rxjs/observable';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { FirebaseService } from '../../Services/firebase.service';
import * as firebase from 'firebase/app';
declare var $: any;

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.css']
})
export class LandingPageComponent implements OnInit {
  public sampleBooks: any = [];
  public loggingIn: boolean;
  public user: Observable<firebase.User>;
  public currentUser: any;

  constructor(
    public af: AngularFireAuth,
    public firebaseService: FirebaseService,
    public router: Router
  ) {
    this.user = this.af.authState;
    this.user.subscribe(res => {
      if (res) this.router.navigate(['/feed']);
    });
  }

  ngOnInit() {
    this.user.subscribe(result => this.currentUser = result);
    this.firebaseService.getAllBooks().subscribe(res=>{
      // if(res.bookCover) 
      res.forEach(book=>{
        if(book.bookCover)this.sampleBooks.push(book);
      });
    });
  }

  login() {
    this.loggingIn = true;
    this.af.auth.signInWithPopup
      (new firebase.auth.FacebookAuthProvider).then(
      res => {
        this.firebaseService.registerUser(res.user);
        this.router.navigate(['/feed']);
      }
      );
  }
  logout() {
    this.af.auth.signOut();
  }
  enableDimmer(){
    $('.sample.dimmer').dimmer({ on: 'hover' });
  }

}
