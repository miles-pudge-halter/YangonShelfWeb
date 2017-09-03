import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { Observable } from 'rxjs/observable';
import { Router, Params, ActivatedRoute } from '@angular/router';
import { FirebaseService } from '../../Services/firebase.service';
import * as firebase from 'firebase/app';
declare var $: any;

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  public requestingBooks: any;
  public givingBooks: any;
  public confirmingTrade: any;

  public returningBook: any;
  public deletingBook: any;
  public noBorrowedBooks: boolean = false;
  public noTradeToYou: boolean = false;
  public noTradeByYou: boolean = false;
  public rt1: any;
  public rt2: any;
  public requestedTrades: any;
  public requestingTrades: any;
  public currentUser: any;
  public ownedBooks: any;
  public borrowedBooks: any;
  public reqUserId: any;
  public presentingUser: any;
  public $user: Observable<firebase.User>;
  constructor(
    public firebaseService: FirebaseService,
    public af: AngularFireAuth,
    public router: Router,
    public route: ActivatedRoute
  ) {

    this.route.queryParams.subscribe(params => {
      this.reqUserId = params['reqProfile'];
      this.loadUser();
    });
  }

  ngOnInit() {
    //console.log(new Date().toString());
    this.rt1 = [];
    this.rt2 = [];
    this.borrowedBooks = [];
  }
  loadUser() {
    this.rt1 = [];
    this.rt2 = [];
    this.borrowedBooks = [];

    this.$user = this.af.authState;
    this.$user.subscribe(res => {
      if (!this.reqUserId) this.reqUserId = res.uid;
      if (!res)
        this.router.navigate(['/']);
      else
        this.currentUser = res;

      if (!this.checkUser()) {
        //console.log('Other\'s profile');
        this.firebaseService.getUser(this.reqUserId).subscribe(res => {
          this.presentingUser = res;
          this.getOwnedBooks(this.reqUserId);
          this.getBorrowedBooks(this.reqUserId);
        });
      }
      else {
        this.firebaseService.getUser(this.currentUser.uid).subscribe(res => {
          this.presentingUser = res;
          this.getOwnedBooks(this.currentUser.uid);
          this.getBorrowedBooks(this.currentUser.uid);
        })
      }
      //console.log(this.presentingUser);
      this.fetchTrades();
    });
  }
  checkUser() {
    if (this.currentUser.uid == this.reqUserId)
      return true;
    return false;
  }
  showTradeConfirm(tradeID) {
    this.firebaseService.getTrade(tradeID).subscribe(trade => {
      this.confirmingTrade = trade;
      this.requestingBooks = [];
      this.givingBooks = [];
      //console.log(tradeID, trade);
      trade.giving.forEach(book => {
        this.firebaseService.getBookById(book).subscribe(res => this.givingBooks.push(res.title));
      });
      trade.requesting.forEach(book => {
        this.firebaseService.getBookById(book).subscribe(res => this.requestingBooks.push(res.title));
      });
      $('#tradeConfirmModal').modal('toggle');
    });
  }
  confirmTrade(trade) {
    this.firebaseService.confirmTrade(trade, this.currentUser.uid);
  }
  denyTrade(trade){
    this.firebaseService.failTrade(trade, this.currentUser.uid);
  }
  showTradeDeny(tradeID) {
    this.firebaseService.getTrade(tradeID).subscribe(trade => {
      this.confirmingTrade = trade;
      this.requestingBooks = [];
      this.givingBooks = [];
      //console.log(tradeID, trade);
      trade.giving.forEach(book => {
        this.firebaseService.getBookById(book).subscribe(res => this.givingBooks.push(res.title));
      });
      trade.requesting.forEach(book => {
        this.firebaseService.getBookById(book).subscribe(res => this.requestingBooks.push(res.title));
      });
      $('#tradeDenyModal').modal('toggle');
    });
  }
  deleteConfirm(delBook) {
    //console.log("You want to delete " + delBook.title);
    this.deletingBook = delBook;
    $('#deleteModal').modal('show');
  }
  deleteBook(delBook) {
    //console.log('requested to delete this books ', delBook);
    this.firebaseService.removeBook(delBook);
  }
  returnConfirm(rBook) {
    this.returningBook = rBook;
    $('#returnModal').modal('show');
  }
  returnBook(book) {
    this.firebaseService.returnBook(book);
  }
  getOwnedBooks(uid) {
    this.firebaseService.fetchBooksByUser(uid).subscribe(res => {
      this.ownedBooks = res;
      //console.log(this.ownedBooks)
    });
  }
  getBorrowedBooks(uid) {

    this.firebaseService.getBorrowedBooks(uid).subscribe(res => {
      this.borrowedBooks = [];
      if (res.length > 0)
        res.forEach(item => {
          this.sortOutUser(item);
        });
      else {
        //console.log("No borrowed books");
        this.noBorrowedBooks = true;
      }
    });
  }
  sortOutUser(item) {
    this.firebaseService.getUser(item.owner).subscribe(res2 => {
      this.borrowedBooks.push({
        book: item,
        owner: res2
      });
      //console.log("done", res2.displayName);
    }, err => console.log(err),
      () => console.log("DONE")
    );
  }
  editProfile() {
    $('#editProfileModal').modal('show');
  }
  goToProfile(uid) {
    this.router.navigate(['/profile'],
      {
        queryParams:
        { reqProfile: uid }
      });
  }
  fetchTrades() {
    this.firebaseService.getRequestedTrades(this.currentUser.uid).subscribe(res => {
      if (res.length < 1) this.noTradeToYou = true;
      this.rt1 = [];
      this.requestedTrades = res;
      this.requestedTrades.forEach(item => {
        let tradeID = item;
        this.firebaseService.getUser(item.requester).subscribe(res => {
          //this.rt1 = [];
          let requester = res;
          let reqBooks = [];
          item.requesting.forEach(book => {
            this.firebaseService.getBookById(book).subscribe(res => reqBooks.push(res.title));
          });
          this.rt1.push({
            trade: tradeID,
            requester: requester,
            books: reqBooks
          })
        });
      });
    });
    this.firebaseService.getRequestingTrades(this.currentUser.uid).subscribe(res => {
      if (res.length < 1) this.noTradeByYou = true;
      this.rt2 = [];
      this.requestingTrades = res;
      this.requestingTrades.forEach(item => {
        let tradeID = item;
        //console.log(tradeID);
        this.firebaseService.getUser(item.requestee).subscribe(res => {
          //this.rt2 = [];
          let requestee = res;
          let reqBooks = [];
          item.requesting.forEach(book => {
            this.firebaseService.getBookById(book).subscribe(res => reqBooks.push(res.title));
          });
          this.rt2.push({
            trade: tradeID,
            requestee: requestee,
            books: reqBooks
          })
        });
      });
    });
  }
  reqTrade(bookID, ownerID) {
    this.router.navigate(['/trade'],
      {
        queryParams:
        {
          bookID: bookID,
          ownerID: ownerID
        }
      });
  }
  enableDimmer() {
    $('.profileDimmer').dimmer({ on: 'hover' });
  }

}
