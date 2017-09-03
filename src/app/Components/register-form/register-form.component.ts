import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { Observable } from 'rxjs/observable';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { FirebaseService } from '../../Services/firebase.service';
import {
  ReactiveFormsModule,
  FormsModule,
  FormGroup,
  FormControl,
  Validators,
  FormBuilder
} from '@angular/forms';
import { parse, format, asYouType, isValidNumber } from 'libphonenumber-js';
import * as firebase from 'firebase/app';
import * as knayi from 'knayi-myscript';
declare var $: any;

@Component({
  selector: 'app-register-form',
  templateUrl: './register-form.component.html',
  styleUrls: ['./register-form.component.css']
})
export class RegisterFormComponent implements OnInit {

  public townshipList: any;
  public listGenres: any = [];
  public name: FormControl;
  public fbID: any;
  public email: FormControl;
  public phone: FormControl;
  public address: FormControl;
  public genres: FormControl;
  public photoURL: any;
  public uid: any;
  public phoneFormat: boolean = false;

  regForm: FormGroup;

  user: Observable<firebase.User>;
  constructor(
    public fb: FormBuilder,
    public af: AngularFireAuth,
    public firebaseService: FirebaseService
  ) {
    this.user = this.af.authState;
    this.user.subscribe(res => {
      //console.log(res);
      this.email.setValue(res.email);
      this.name.setValue(res.displayName);
      this.uid = res.uid;
      this.photoURL = res.photoURL;
      this.fbID = res.providerData[0].uid;
    }
    );
  }

  ngOnInit() {
    $('.ui.dropdown').dropdown();
    this.firebaseService.getTownships().subscribe(res => this.townshipList = res);
    this.firebaseService.getGenres().subscribe(res => this.listGenres = res);
    this.name = new FormControl('', [
      Validators.required,
      Validators.minLength(4)
    ]);
    this.email = new FormControl('', [
      Validators.required,
      Validators.minLength(9),
      Validators.pattern("[^ @]*@[^ @]*")
    ]);
    this.phone = new FormControl('', [
      Validators.required,
      Validators.minLength(7)
    ]);
    this.address = new FormControl('', [
      Validators.required,
    ]);
    this.genres = new FormControl('', [
      Validators.required
    ]);
    this.buildForm();
    this.regForm.valueChanges.subscribe(chgs=>{
      var parsedPh = parse(chgs.phone,"MM");
      this.phoneFormat = isValidNumber(parsedPh);
    });
  }
  buildForm(): void {
    this.regForm = this.fb.group({
      name: this.name,
      email: this.email,
      phone: this.phone,
      address: this.address,
      genres: this.genres
    });
  }

  onSubmit() {
    let updtUser = {
      displayName: knayi.fontConvert(this.name.value, 'unicode'),
      email: this.email.value,
      phone: this.phone.value,
      address: knayi.fontConvert(this.address.value, 'unicode'),
      photoURL: this.photoURL,
      genres: this.genres.value,
      fbID: this.fbID
    };
    //console.log(updtUser);
    this.firebaseService.updateUser(updtUser, this.uid);
  }
}
