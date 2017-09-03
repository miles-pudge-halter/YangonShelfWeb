import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { FirebaseService } from '../../Services/firebase.service';
import { Observable } from 'rxjs/observable';
import { Router, Params } from '@angular/router';
import * as firebase from 'firebase/app';
declare var $: any;

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.css']
})
export class NavBarComponent implements OnInit {

  public seenNotis: any;
  public unseenNotis: any;
  public userName: string = "Loading";
  public userProfileUrl;
  public user: Observable<firebase.User>;
  public currentUser: any;
  constructor(
    public router: Router,
    public firebaseService: FirebaseService,
    public af: AngularFireAuth
  ) {

  }

  ngOnInit() {
    this.user = this.af.authState;
    this.user.subscribe(res => {
      this.currentUser = res;
      this.userName = res.displayName;
      this.firebaseService.getUser(res.uid).subscribe(
        fuser => {
          this.userProfileUrl = `http://graph.facebook.com/${fuser.fbID}/picture?type=square`;
        }
      );

      this.getNotis(this.currentUser.uid);
    });
    $('#noti')
      .popup({
        popup: $('.noti.popup'),
        on: 'click'
      })
      ;
  }
  logout() {
    $('.ui.labeled.icon.sidebar').sidebar('hide');
    this.firebaseService.logout();
  }
  showSideBar() {
    $('.ui.labeled.icon.sidebar')
      .sidebar('setting', 'transition', 'overlay')
      .sidebar('toggle');
  }
  showRightSideBar() {
    $('#noti-menu').sidebar('setting', 'transition', 'overlay').sidebar('toggle');
  }
  goToProfile() {
    $('.ui.labeled.icon.sidebar').sidebar('hide');
    this.router.navigate(['/profile'],
      {
        queryParams:
        { reqProfile: this.currentUser.uid }
      });
  }
  goToFeed() {
    $('.ui.labeled.icon.sidebar').sidebar('hide');
    this.router.navigate(['/feed']);
  }
  getNotis(uid) {
    this.firebaseService.getNotis(uid).subscribe(res => {
      this.seenNotis = [];
      this.unseenNotis = [];

      res.forEach(item => {
        let formalTime: string = '';
        if (item.timestamp) {
          formalTime = this.firebaseService.calculateTime(item.timestamp);
        }
        //console.log("THE FORMAL TIME", formalTime);
        if (item.seen) {
          //console.log("seen", item);
          this.firebaseService.getUser(item.requester).subscribe(uRes => {
            let requester = uRes;
            this.firebaseService.getTrade(item.tradeID).subscribe(trade => {
              let reqBooks = [];
              trade.requesting.forEach(rBook => {
                this.firebaseService.getBookById(rBook).subscribe(book => reqBooks.push(book.title));
              })
              this.seenNotis.push({
                tradeID: item.tradeID,
                requester: requester,
                books: reqBooks,
                type: item.type,
                time: formalTime
              });
            });
          });

        }
        else {
          this.firebaseService.getUser(item.requester).subscribe(uRes => {
            let requester = uRes;
            this.firebaseService.getTrade(item.tradeID).subscribe(trade => {
              let reqBooks = [];

              trade.requesting.forEach(rBook => {
                this.firebaseService.getBookById(rBook).subscribe(book => reqBooks.push(book.title));
              })
              this.unseenNotis.push({
                tradeID: item.tradeID,
                requester: requester,
                books: reqBooks,
                type: item.type,
                time: formalTime
              });


            });
          });
        }
      });
      //console.log(this.seenNotis);
      //console.log(this.unseenNotis);
    });
  }

}
