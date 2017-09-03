import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { FirebaseService } from '../../../Services/firebase.service';
import { Router } from '@angular/router';
declare var $: any;

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {
  public genresList: any=[];
  public books: any = [];
  public user: any;
  public query: any;
  public loaded: boolean;
  public category: any = [];
  public searchResults: any;
  public visibility: boolean = false;
  constructor(
    public firebaseService: FirebaseService,
    public af: AngularFireAuth,
    public router: Router
  ) { }

  ngOnInit() {
    this.firebaseService.getGenres().subscribe(res=>{
      this.genresList=res;
    });
    this.af.authState.subscribe(res => {
      this.user = res;
    });
    this.loaded = false;
    this.initJquery();
    //$('.ui.dropdown').dropdown();
  }
  formCheck() {
    if (this.query || this.category.length > 0) return true;
    return false;
  }
  toggleView() {
    if (this.visibility) this.visibility = false;
    else this.visibility = true;
    $('#searchResults').toggle('2000', "swing", function () { });
  }
  search() {
    //console.log(this.query, this.category);
    if (this.books.length > 0 && this.visibility == true)
      $('#searchResults').toggle('2000', "swing", function () { });
    this.searchResults = [];
    this.books = [];
    this.searchResults = this.firebaseService.search(this.query, this.category);
    this.searchResults.forEach(book => {
      this.sortOutUser(book);
    });
    if (this.searchResults.length > 0) {
      $('#searchResults').toggle('2000', "swing", function () { });
      this.visibility = true;
    }
   //console.log(this.searchResults);
  }
  sortOutUser(item) {
    this.firebaseService.getUser(item.owner).subscribe(res2 => {
      this.books.push({
        book: item,
        owner: res2
      });
      console.log("done", res2.displayName);

    }, err => console.log(err),
      () => console.log("DONE")
    );
  }
  initJquery() {
    if (!this.loaded) {
      $('#combobox').dropdown();
      this.loaded = true;
      //console.log('loaded jq');
    }
    return true;
  }
  goToProfile(uid) {
    this.router.navigate(['/profile'],
      {
        queryParams:
        { reqProfile: uid }
      });
  }
  reqTrade(bookID,ownerID){
    //console.log(bookID,ownerID);
    this.router.navigate(['/trade'],
    {
      queryParams:
      {
        bookID: bookID,
        ownerID: ownerID
      }
    });
  }

}
