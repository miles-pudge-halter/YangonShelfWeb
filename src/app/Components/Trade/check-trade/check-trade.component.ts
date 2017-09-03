import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FirebaseService } from '../../../Services/firebase.service';
import { DragulaService } from 'ng2-dragula';
import { AngularFireAuth } from 'angularfire2/auth';

@Component({
  selector: 'app-check-trade',
  templateUrl: './check-trade.component.html',
  styleUrls: ['./check-trade.component.css']
})
export class CheckTradeComponent implements OnInit {
  public tradeId: string;
  public requester: any;
  public requestee: any;
  public trade: any;
  public requesteeBooks: any;
  public requesterGivingBooks: any;
  public requesterHaveBooks: any;
  public originGiving: any;
  public originHave: any;
  public giving2 = [];
  public have2 = [];
  constructor(
    public af: AngularFireAuth,
    public router: Router,
    public route: ActivatedRoute,
    public firebaseService: FirebaseService,
    public dragulaService: DragulaService
  ) {
  }


  ngOnInit() {
    this.requesterGivingBooks = [];
    this.requesterHaveBooks = [];
    this.giving2 = [];
    this.have2 = [];
    this.requesteeBooks = [];
    this.route.params.subscribe(params => {

      //if(!params) this.router.navigate(['/']);
      this.tradeId = params['id'];
      //console.log(this.tradeId);

      this.firebaseService.getTrade(this.tradeId).subscribe(res => {
        if (!res) this.router.navigate(['/profile']);
        this.trade = res;
        if (this.trade.status) {
          //console.log("GET OUT OF HERE");
          this.af.authState.subscribe(angUser => {
            this.makeItSeen(angUser.uid, this.tradeId);
          });
          this.router.navigate(['/profile']);
        }
        this.requesteeBooks=[];
        this.requesterGivingBooks = [];
        this.requesterHaveBooks = [];
        //console.log(res);
        this.firebaseService.getUser(this.trade.requestee).subscribe(res => {
          this.requestee = res;
          this.makeItSeen(this.requestee.$key, this.tradeId);
          //this.firebaseService.fetchBooksByUser(this.requestee.$key).subscribe(res => this.requesteeBooks = res);
        });
        this.firebaseService.getUser(this.trade.requester).subscribe(res => {
          this.requester = res;
          this.firebaseService.fetchAvailableBooksByUser(this.requester.$key).subscribe(res => {
            this.requesterHaveBooks = res;
            res.forEach(book => {
              this.have2.push(book.$key);
            });
            //console.log('all they have', this.have2);
            this.giving2 = this.trade.giving;
            this.originGiving = this.giving2.toString();
            //console.log('gonna give these', this.giving2);
            this.giving2.forEach(item => {
              //console.log('coming in', item);
              if (this.have2.indexOf(item) > -1){
                //console.log('splicing', this.have2.splice(this.have2.indexOf(item), 1));
              }
            });
            this.originHave = this.have2.toString();
            //console.log('giving', this.giving2);
            //console.log('have', this.have2);
            this.trade.giving.forEach(book => {
              this.firebaseService.getBookById(book).subscribe(res => {

                this.requesterHaveBooks.forEach(hvBook => {
                  //console.log('finding...', res.$key, hvBook.$key);
                  if (res.$key == hvBook.$key)
                    this.requesterHaveBooks.splice(this.requesterHaveBooks.indexOf(hvBook), 1);
                });

                //console.log('splicing this -', res);
                //console.log('with this?', this.requesterHaveBooks[0]);
                if (Object.is(res, this.requesterGivingBooks[0])) //console.log("it's the same thing");
                this.requesterGivingBooks.push(res);
                //console.log(this.requesterHaveBooks);
                //console.log(this.requesterHaveBooks.indexOf(res));
                ////console.log('spppllliicciinngg',this.requesterHaveBooks.splice(this.requesterHaveBooks.indexOf(res), 1));
              });
            });
          });
        });
        this.trade.requesting.forEach(book => {
          ////console.log(book);
          this.firebaseService.getBookById(book).subscribe(res => {
            this.requesteeBooks.push(res)
            //console.log(this.requesteeBooks);
          });
        });

        this.dragulaService.drop.subscribe(val => {
          ////console.log(val.slice(0));
          let bookID = (val.slice(1)[0]['id']);
          let segmentID = (val.slice(2)[0]['id']);
          //console.log(segmentID);
          //console.log(bookID);
          if (segmentID == "giving2") {
            this.theyGive(bookID);
          }
          else if (segmentID == "have2") {
            this.theyHave(bookID);
          }
        });

      });
    });
  }
  makeItSeen(uid, tid) {
    this.firebaseService.setNotiSeen(uid, tid)
      .subscribe(res => {
        this.firebaseService.setNoti(uid, res[0].$key);
      });
  }
  theyGive(bookID) {
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
  checkAlter() {
    if (this.giving2.toString() == this.originGiving && this.have2.toString() == this.originHave)
      return false;
    return true;
  }
  acceptTrade() {
    this.firebaseService.acceptTrade(this.tradeId, this.trade.giving, this.trade.requesting, this.trade.requester, this.trade.requestee);
  }
  denyTrade() {
    this.firebaseService.denyTrade(this.tradeId, this.trade.giving, this.trade.requesting, this.trade.requester, this.trade.requestee);
  }
  counterOffer() {

  }

}
