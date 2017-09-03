import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { Observable } from 'rxjs/observable';
import { Router } from '@angular/router';
import { FirebaseService } from '../../../Services/firebase.service';
import * as firebase from 'firebase/app';
declare var $: any;
@Component({
  selector: 'app-book-list',
  templateUrl: './book-list.component.html',
  styleUrls: ['./book-list.component.css']
})
export class BookListComponent implements OnInit {

  public user: any;
  public unsortRelatedBooks: any = [];
  public relatedBooks: any = [];
  public books: any = [];
  public noBooks: boolean = false;

  constructor(
    public af: AngularFireAuth,
    public firebaseService: FirebaseService,
    public router: Router
  ) { }

  ngOnInit() {

    this.af.authState.subscribe(res => {
      this.user = res;
      this.firebaseService.getUser(this.user.uid).subscribe(fUser => {


        //GET ALL BOOKS
        this.firebaseService.getAllBooks().subscribe(res => {
          if (res.length < 1) this.noBooks = true;
          this.books = [];
          this.relatedBooks = [];
          res.forEach(item => {
            this.sortOutUser(item, 'all');
            fUser.genres.forEach(gen => {
              if (item.genres.indexOf(gen) > -1) {
                //////
                this.unsortRelatedBooks.forEach(sr => {
                  if (sr.$key == item.$key) 
                    this.unsortRelatedBooks.splice(this.unsortRelatedBooks.indexOf(sr), 1);
                });
                this.unsortRelatedBooks.push(item);
              }
            });
          });
          this.unsortRelatedBooks.forEach(unsortBook=>{
            this.sortOutUser(unsortBook,'related');
          });

        });
      });
    });
  }

  sortOutUser(item, type) {
    this.firebaseService.getUser(item.owner).subscribe(res2 => {
      if (type == "all") {
        this.books.push({
          book: item,
          owner: res2
        });
      }
      else {
        this.relatedBooks.push({
          book: item,
          owner: res2
        });
      }


    }, err => console.log(err),
      () => console.log("DONE")
    );
  }
  goToProfile(uid) {
    this.router.navigate(['/profile'],
      {
        queryParams:
        { reqProfile: uid }
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
    $('.bookItem.dimmer').dimmer({ on: 'hover' });
  }
}
