import { Component, OnInit } from '@angular/core';
import { FirebaseService } from '../../../Services/firebase.service';
import { AngularFireAuth } from 'angularfire2/auth';
import { DragulaService } from 'ng2-dragula';
import { Router, Params, ActivatedRoute } from '@angular/router';
declare var $: any;

@Component({
  selector: 'app-trade-view',
  templateUrl: './trade-view.component.html',
  styleUrls: ['./trade-view.component.css']
})
export class TradeViewComponent implements OnInit {
  public side1list: any = [];
  public side2list: any = [];
  public requestedBook: any = [];
  public reqBookID: any;
  public reqBookOwner: any;
  //public reqBook:any;
  public books: any;
  public otherBooks: any;
  public cleanOtherBooks: any;
  public currentUser: any;
  public otherUser: any;
  public giving1 = [];
  public have1 = [];
  public giving2 = [];
  public have2 = [];
  constructor(
    public dragulaService: DragulaService,
    public firebaseService: FirebaseService,
    public af: AngularFireAuth,
    public router: Router,
    public route: ActivatedRoute
  ) {
    this.route.queryParams.subscribe(params => {
      if (!params.bookID || !params.ownerID)
        this.router.navigate(['/feed']);
      this.reqBookID = params.bookID;
      this.reqBookOwner = params.ownerID;
    });
  }

  ngOnInit() {
    $('.ui.dropdown').dropdown();
    this.af.authState.subscribe(res => {
      this.currentUser = res;
      this.firebaseService.fetchAvailableBooksByUser(this.currentUser.uid).subscribe(res => {
        this.books = res;

        res.forEach(item => {
          this.have1.push(item.$key);
        });
        //console.log("YOU HAVE - ", this.have1);
      });
    });
    this.firebaseService.getUser(this.reqBookOwner).subscribe(res => {
      this.otherUser = res;
    });
    this.firebaseService.fetchAvailableBooksByUser(this.reqBookOwner).subscribe(res => {
      this.cleanOtherBooks = res;
    });
    this.firebaseService.fetchAvailableBooksByUser(this.reqBookOwner).subscribe(res => {
      this.otherBooks = res;
      this.firebaseService.getBookById(this.reqBookID).subscribe(rb => {
        this.requestedBook.push(rb);
        this.otherBooks.forEach(book => {
          if (book.$key == this.requestedBook[0].$key) {
            this.otherBooks.splice(this.otherBooks.indexOf(book), 1);
          }
        });
      });
      res.forEach(item => {
        this.have2.push(item.$key);
      });
      //////////
      //console.log('before pushing', this.giving2, this.reqBookID);
      this.giving2.push(this.reqBookID);
      //console.log('after pushing', this.giving2);
      this.have2.splice(this.have2.indexOf(this.reqBookID), 1);
    });


    this.dragulaService.drop.subscribe(val => {
      //console.log(val.slice(0));
      let bookID = (val.slice(1)[0]['id']);
      let segmentID = (val.slice(2)[0]['id']);
      //console.log(segmentID);

      if (segmentID == "giving1") {
        this.youGive(bookID);
      }
      else if (segmentID == "have1") {
        this.youHave(bookID);
      }
      else if (segmentID == "giving2") {
        this.theyGive(bookID);
      }
      else if (segmentID == "have2") {
        this.theyHave(bookID);
      }
    });
  }

  youGive(bookID) {
    if (this.giving1.indexOf(bookID) != -1) {
      //console.log("already here");
    }
    else {
      if (this.have1.indexOf(bookID) != -1) {
        //console.log(this.have1.indexOf(bookID));
        this.have1.splice(this.have1.indexOf(bookID), 1);
        //console.log("YOU hAVE", this.have1);
      }
      this.giving1.push(bookID);
    }
    //console.log("YOU GIVE", this.giving1);
  }
  youHave(bookID) {
    if (this.have1.indexOf(bookID) != -1) {
      //console.log("already here");
    }
    else {
      if (this.giving1.indexOf(bookID) != -1) {
        //console.log(this.giving1.indexOf(bookID));
        this.giving1.splice(this.giving1.indexOf(bookID), 1);
        //console.log("YOU give", this.giving1);
      }
      this.have1.push(bookID);
    }
    //console.log("YoU have", this.have1);
  }
  theyGive(bookID) {
    //console.log('giving this', bookID);
    if (this.giving2.indexOf(bookID) != -1) {
      //console.log("already here");
    }
    else {
      if (this.have2.indexOf(bookID) != -1) {
        //console.log(this.have2.indexOf(bookID));
        this.have2.splice(this.have2.indexOf(bookID), 1);
        //console.log("they hAVE", this.have2);
      }
      this.giving2.push(bookID);
    }
    //console.log("they GIVE", this.giving2);
  }
  theyHave(bookID) {
    if (this.have2.indexOf(bookID) != -1) {
      //console.log("already here");
    }
    else {
      if (this.giving2.indexOf(bookID) != -1) {
        //console.log(this.giving2.indexOf(bookID));
        this.giving2.splice(this.giving2.indexOf(bookID), 1);
        //console.log("they give", this.giving2);
      }
      this.have2.push(bookID);
    }
    //console.log("they have", this.have2);
  }

  reqTrade() {
    let trade = {
      requester: this.currentUser.uid,
      requestee: this.otherUser.$key,
      requesting: this.giving2,
      giving: this.giving1,
      timestamp: new Date().toString()
    };
    this.firebaseService.createTrade(trade);
    this.router.navigate(['/feed']);
  }
  reqTradeMobile() {
    //console.log(this.side1list, this.side2list);
    let trade = {
      requester: this.currentUser.uid,
      requestee: this.otherUser.$key,
      requesting: this.side2list,
      giving: this.side1list,
      timestamp: new Date().toString()
    }
    this.firebaseService.createTrade(trade);
    this.router.navigate(['/feed']);
  }
}
