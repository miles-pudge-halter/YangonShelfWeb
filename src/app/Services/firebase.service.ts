import { Injectable } from '@angular/core';
import { AngularFireDatabase, FirebaseListObservable, FirebaseObjectObservable } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import { Observable } from 'rxjs';
import * as knayi from "knayi-myscript";
import 'rxjs/add/operator/map';
import { Router, ActivatedRoute, Params } from '@angular/router';
import * as firebase from 'firebase';
declare var $: any;
@Injectable()
export class FirebaseService {

  public isLoading: boolean = false;

  constructor(
    public af: AngularFireDatabase,
    public angAuth: AngularFireAuth,
    public router: Router
  ) { }
  getTownships() {
    return this.af.list('Township');
  }
  getGenres() {
    return this.af.object('genres');
  }
  registerUser(user) {
    let userPath: FirebaseObjectObservable<any> = this.af.object('users/' + user.uid);
    if (userPath.$ref) {
      //console.log("this user exists");
      userPath.subscribe(
        res => {
          //console.log(res);
          if (!res.phone) {
            //console.log("User does not have a  phone");
            this.router.navigate(['/registration']);
            //console.log("After redirect");
          }
          else {
            this.router.navigate(['/feed']);
          }
        }
      );
    }
    else {
      //console.log("NEW USER", user.providerData[0].uid);
      let newUser = {
        displayName: user.displayName,
        email: user.email,
        photoURl: user.photoUrl,
        fbID: user.providerData[0].uid
      }
      userPath.set(newUser);
      this.router.navigate(['/registration']);
    }
  }

  updateUser(user, uid) {
    let userPath: FirebaseObjectObservable<any> = this.af.object('users/' + uid);
    userPath.set(user);
    this.router.navigate(['/feed']);
  }
  updateProfile(user, uid) {
    $('#editProfileModal').modal('setting', 'closable', false);
    let userPath: FirebaseObjectObservable<any> = this.af.object('users/' + uid);
    userPath.update(user);
    //this.af.object('users/'+uid+'/genres').set(user.genres);
    $('#editProfileModal').modal('hide');
  }
  removeBook(delBook) {
    let id = delBook.$key
    //console.log('deleting ', id);
    if (delBook.bookCover) {
      $('#deleteProgress').modal('setting', 'closable', false);
      $('#deleteProgress').modal('show');
      let storage = firebase.storage();
      let storageRef = storage.ref();
      let bookStore = storageRef.child('books/' + id + '.jpeg');
      bookStore.delete().then(function () {
        $('#deleteProgress').modal('hide');
        //console.log('deleted jpeg');
      }).catch(function (error) {
        $('#deleteProgress').modal('hide');
        //console.log('error deleting jpeg');
      });
    }
    this.af.list('books').remove(id);

    $(`#deleteModal`).modal('hide');
  }
  returnBook(book) {
    this.af.object('books/' + book.$key + '/currentHolder').remove();
    $('#returnModal').modal('hide');
  }
  getLoadingStatus() {
    return this.isLoading;
  }

  addBook(newBook: Book, bookCover) {
    $('#addBookModal').modal('setting', 'closable', false);
    this.isLoading = true;
    let ID = firebase.database().ref('books').push().key
    let bookPath: FirebaseObjectObservable<any> = this.af.object('books/' + ID);
    // //console.log(bookCover);
    return new Promise((resolve, rject) => {
      if (bookCover) {
        let storage = firebase.storage();
        let storageRef = storage.ref();
        let type = bookCover.type;
        type = type.substring(type.indexOf("/") + 1);
        let booksRef = storageRef.child('books/' + ID + '.' + type);
        let uploadTask = booksRef.put(bookCover);
        uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED,
          function (snapshot) {
            let progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            //console.log(progress + "%");
            $('#progressModal').modal('setting', 'closable', false);
            $('#progressModal').modal('show');
            $('#progress').progress({
              percent: progress
            });
          });
        uploadTask.then(function (snapshot) {
          // //console.log(snapshot.downloadURL);
          newBook.bookCover = snapshot.downloadURL;
          bookPath.set(newBook).then(res => {
            $('#progressModal').modal('toggle');
            $('#addBookModal').modal('setting', 'closable', true);
            $('#addBookModal').modal('hide');
            resolve(true);
          });
        });
      }
      else {
        bookPath.set(newBook).then(res => {
          $('#addBookModal').modal('setting', 'closable', true);
          $('#addBookModal').modal('hide');
          resolve(true);
        });
      }
    });
  }

  getAllBooks() {
    let fetchedBooks: FirebaseListObservable<any> = this.af.list('books');

    // //console.log(books);
    return fetchedBooks;
  }
  getRelatedBooks(genres) {
    return this.af.list('books')
      .map(_res => _res.filter(book => {
        book.genres.forEach(bookGenre => {
          genres.forEach(givenGenre => {
            if (bookGenre == givenGenre) {
              ////console.log('match found');
              return true;
            }
          });
        });
      }));
  }
  getUser(uid) {
    let fetchedUser: FirebaseObjectObservable<any> = this.af.object('users/' + uid);
    return fetchedUser;
  }

  fetchAvailableBooksByUser(uid) {
    return this.af.list('books', {
      query: {
        orderByChild: 'owner',
        equalTo: uid
      }
    }).map(_res => _res.filter(res => res.currentHolder == null && !res.pending));

    //return fetchedBooks;
  }
  fetchBooksByUser(uid) {
    let fetchedBooks: FirebaseListObservable<any> = this.af.list('books', {
      query: {
        orderByChild: 'owner',
        equalTo: uid
      }
    });
    return fetchedBooks;
  }

  logout() {
    this.angAuth.auth.signOut().then(res => {
      this.router.navigate(['/']);
    });
  }
  createTrade(trade) {
    //console.log(trade);
    //let tid = Math.random().toString(36).substr(2, 9);
    let tid = firebase.database().ref('trade').push().key
    //console.log(tid)
    let tradePath: FirebaseObjectObservable<any> = this.af.object('trade/'+tid);
    tradePath.set(trade);
    let notiID = firebase.database().ref('noti/'+trade.requestee).push().key
    let notiPath: FirebaseObjectObservable<any> = this.af.object('noti/' + trade.requestee + "/" + notiID);

    let noti = {
      tradeID: tid,
      requester: trade.requester,
      seen: false,
      type: "request",
      timestamp: new Date().toString()
    };
    notiPath.set(noti);
  }
  getNotis(uid) {
    return this.af.list('noti/' + uid, {
      query: {
        orderByChild: 'timestamp'
      }
    });
  }
  setNotiSeen(uid, tradeID) {
    return this.af.list('noti/' + uid)
      .map(_res => _res.filter(res => res.tradeID == tradeID));
  }
  setNoti(uid, notiId) {
    this.af.object('noti/' + uid + '/' + notiId).update({ seen: true });
  }
  getTrade(tradeId) {
    let fetchTrade: FirebaseObjectObservable<any> = this.af.object('trade/' + tradeId);
    return fetchTrade;
  }
  getRequestedTrades(uid) {
    let fetchTrade: FirebaseListObservable<any> = this.af.list('trade', {
      query: {
        orderByChild: 'requestee',
        equalTo: uid
      }
    });
    return fetchTrade;
  }
  getRequestingTrades(uid) {
    let fetchTrade: FirebaseListObservable<any> = this.af.list('trade', {
      query: {
        orderByChild: 'requester',
        equalTo: uid
      }
    });
    return fetchTrade;
  }
  getBorrowedBooks(uid) {
    //console.log('fetching borrowed books...');
    let fetchBooks: FirebaseListObservable<any> = this.af.list('books', {
      query: {
        orderByChild: 'currentHolder',
        equalTo: uid
      }
    });
    return fetchBooks;
  }
  getBookById(id) {
    let fetchedBook: FirebaseObjectObservable<any> = this.af.object('books/' + id);
    return fetchedBook;
  }
  acceptTrade(tradeID, giving, requesting, requester, requestee) {
    let fetchTrade: FirebaseObjectObservable<any> = this.af.object('trade/' + tradeID);
    fetchTrade.update({
      status: 'accepted',
      requesterConfirm: false,
      requesteeConfirm: false
    });
    let notiID = firebase.database().ref('noti/'+requester).push().key
    let notiPath: FirebaseObjectObservable<any> = this.af.object('noti/' + requester + '/' + notiID);
    notiPath.set({
      seen: false,
      type: "accept",
      tradeID: tradeID,
      requester: requestee,
      timestamp: new Date().toString()
    });
    requesting.forEach(book=>{
      this.af.object('books/'+book).update({pending:true})
    })
    giving.forEach(book=>{
      this.af.object('books/'+book).update({pending:true})
    })
    this.af.list('trade/').subscribe(res => {
      res.forEach(trade => {
        if (trade.$key != tradeID && trade.status==null) {
          let sendNoti = false
          trade.giving.forEach(book => {
            if (giving.indexOf(book) > -1 || requesting.indexOf(book) > -1) {
              sendNoti = true
              //console.log("duplicate in giving detected",book);
              this.af.object('trade/'+trade.$key).update({status:'failed'})
            }
          });
          trade.requesting.forEach(book => {
            if (giving.indexOf(book) > -1 || requesting.indexOf(book) > -1) {
              sendNoti = true
              //console.log("duplicate in requesting detected",book);
              this.af.object('trade/'+trade.$key).update({status:'failed'})
            }
          });
          if(sendNoti){
            let notiId1 = firebase.database().ref('noti/'+trade.requester).push().key
            this.af.object('noti/'+trade.requester+'/'+notiId1).set({
                seen: false,
                type: "deny",
                tradeID: trade.$key,
                requester: trade.requestee,
                timestamp: new Date().toString()
              });
            let notiId2 = firebase.database().ref('noti/'+trade.requestee).push().key
            this.af.object('noti/'+trade.requestee+'/'+notiId2).set({
                seen: false,
                type: "deny",
                tradeID: trade.$key,
                requester: trade.requester,
                timestamp: new Date().toString()
              });
          }
        }
      });
    });
  }
  failTrade(trade, uid) {
    let fetchTrade: FirebaseObjectObservable<any> = this.af.object('trade/' + trade.$key);
    if (trade.requestee == uid) {
      fetchTrade.update({ status: 'failed', requesterFail: true });
    }
    else if (trade.requester == uid) {
      fetchTrade.update({ status: 'failed', requesteeFail: true });
    }
    trade.giving.forEach(book=>{
      this.af.object('books/'+book).update({pending:false})
    })
    trade.requesting.forEach(book=>{
      this.af.object('books/'+book).update({pending:false})
    })
  }
  confirmTrade(trade, uid) {
    //console.log('in service', trade);
    let fetchTrade: FirebaseObjectObservable<any> = this.af.object('trade/' + trade.$key);
    //console.log(trade.requester, trade.requestee, uid);
    if (trade.requestee == uid) {
      fetchTrade.update({ requesteeConfirm: true }).then(res => {
        fetchTrade.subscribe(fTrade => {
          if (fTrade.requesterConfirm && fTrade.requesteeConfirm) {
            //console.log('trade completed');
            fetchTrade.update({ status: 'confirmed' });
            trade.giving.forEach(book => {
              this.af.object('books/' + book).update({ currentHolder: trade.requestee, pending: false });
            });
            trade.requesting.forEach(book => {
              this.af.object('books/' + book).update({ currentHolder: trade.requester, pending: false });
            });
          }
          else{ //console.log('still pending');
        }
        });
      });
    }
    else if (trade.requester == uid) {
      fetchTrade.update({ requesterConfirm: true }).then(res => {
        fetchTrade.subscribe(fTrade => {
          if (fTrade.requesterConfirm && fTrade.requesteeConfirm) {
            //console.log('trade completed');
            fetchTrade.update({ status: 'confirmed' });
            trade.giving.forEach(book => {
              this.af.object('books/' + book).update({ currentHolder: trade.requestee });
            });
            trade.requesting.forEach(book => {
              this.af.object('books/' + book).update({ currentHolder: trade.requester });
            });
          }
          else {//console.log('still pending');
        }
        });
      });
    }
    // //console.log(requester, giving);
    // //console.log(requestee, requesting);
    // giving.forEach(book => {
    //   this.af.object('books/' + book).update({ currentHolder: requestee });
    // });
    // requesting.forEach(book => {
    //   this.af.object('books/' + book).update({ currentHolder: requester });
    // });
    // fetchTrade.update({ status: 'confirmed' });
    // let notiID = Math.random().toString(36).substr(2, 9);
    // let notiPath: FirebaseObjectObservable<any> = this.af.object('noti/' + requester + '/' + notiID);
    // notiPath.set({
    //   seen: false,
    //   type: "confirm",
    //   tradeID: tradeID,
    //   requester: requestee
    // });
  }
  denyTrade(tradeID, giving, requesting, requester, requestee) {
    let notiID = firebase.database().ref('noti/'+requester).push().key
    let fetchTrade: FirebaseObjectObservable<any> = this.af.object('trade/' + tradeID);
    fetchTrade.update({ status: 'denied' });
    let notiPath: FirebaseObjectObservable<any> = this.af.object('noti/' + requester + '/' + notiID);
    notiPath.set({
      seen: false,
      type: "deny",
      tradeID: tradeID,
      requester: requestee,
      timestamp: new Date().toString()
    });
  }
  counterOffer(tradeID) {
    let fetchTrade: FirebaseObjectObservable<any> = this.af.object('trade/' + tradeID);
  }
  search(query, genres) {
    let searchResult = [];
    this.af.list('books').subscribe(res => {
      res.forEach(book => {
        if (query) {
          query = knayi.fontConvert(query, 'unicode');
          if (genres.length < 1) {
            if (book.author.toLowerCase().search(query.toLowerCase()) > -1 || book.title.toLowerCase().search(query.toLowerCase()) > -1) {
              searchResult.forEach(sr => {
                if (sr.$key == book.$key) searchResult.splice(searchResult.indexOf(sr), 1);
              });
              searchResult.push(book);
            }
          }
          else {
            genres.forEach(gen => {
              if (book.genres.indexOf(gen) > -1) {
                if (book.author.toLowerCase().search(query.toLowerCase()) > -1 || book.title.toLowerCase().search(query.toLowerCase()) > -1) {
                  searchResult.forEach(sr => {
                    if (sr.$key == book.$key) searchResult.splice(searchResult.indexOf(sr), 1);
                  });
                  searchResult.push(book);
                }
              }
            });
          }
        }
        else {
          genres.forEach(gen => {
            if (book.genres.indexOf(gen) > -1) {
              searchResult.forEach(sr => {
                if (sr.$key == book.$key) searchResult.splice(searchResult.indexOf(sr), 1);
              });
              searchResult.push(book);
            }
          });
        }
      });
    });
    return searchResult;
  }
  calculateTime(time) {
    ////console.log("RECEIVED ON -- ",item.timestamp);
    let formalTime: string = ''
    let timestamp = new Date(time);
    let seconds = (Date.now() - +timestamp) / 1000;
    formalTime = Math.round(seconds).toString() + " seconds ago";
    //console.log(seconds, " seconds ago");
    if (seconds >= 60) {
      let minutes = seconds / 60;
      formalTime = Math.round(minutes).toString() + " minutes ago"
      //console.log(Math.round(minutes), " minutes ago");
      if (minutes >= 60) {
        let hours = minutes / 60;
        formalTime = Math.round(hours).toString() + " hours ago"
        //console.log(Math.round(hours), " hours ago");
        if (hours >= 24) {
          let days = hours / 24;
          Math.round(days) == 1 ? formalTime = 'Yesterday' : formalTime = Math.round(days).toString() + " days ago"
          //console.log(Math.round(days), " days ago");
          if (days >= 7) {
            let weeks = days / 7;
            formalTime = Math.round(weeks).toString() + " weeks ago"
            //console.log(Math.round(weeks), " weeks ago");
            if (days >= 30) {
              let months = days / 30;
              formalTime = Math.round(months).toString() + " months ago";
              //console.log(Math.round(months), " months ago");
              if (days >= 365) {
                let years = days / 365;
                let formalTime = Math.round(years).toString() + " years ago";
                //console.log(Math.round(years), " years ago");
              }
            }
          }
        }
      }
    }
    return formalTime;
  }


}
interface Book {
  title: any,
  author: any,
  genres: any,
  description: any,
  owner: any,
  bookCover: any;
}
