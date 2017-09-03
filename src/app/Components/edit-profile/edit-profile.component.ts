import { Component, OnInit, Input } from '@angular/core';
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
import * as knayi from 'knayi-myscript';
declare var $: any;

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.css']
})
export class EditProfileComponent implements OnInit {

  @Input() public user: any;

  public townshipList: any;
  public genresList: any;
  public loaded: boolean;
  public genres: FormControl
  public name: FormControl;
  public email: FormControl;
  public location: FormControl;
  public quote: FormControl;
  public phone: FormControl;
  public phoneFormat: boolean = false;

  public profileForm: FormGroup;

  constructor(
    public fb: FormBuilder,
    public firebaseService: FirebaseService
  ) {
  }

  ngOnInit() {
    this.loaded = false;
    this.firebaseService.getGenres().subscribe(res => this.genresList = res);
    this.firebaseService.getTownships().subscribe(res => this.townshipList = res);
    this.name = new FormControl('', [
      Validators.required,
      Validators.minLength(4)
    ]);
    this.email = new FormControl('', [
      Validators.required,
      Validators.pattern("[^ @]*@[^ @]*")
    ]);
    this.location = new FormControl('', [
      Validators.required
    ]);
    this.genres = new FormControl('', [
      Validators.required
    ]);
    this.phone = new FormControl('',[
      Validators.required
    ])
    this.quote = new FormControl('');
    this.buildForm();
    this.name.setValue(this.user.displayName);
    this.email.setValue(this.user.email);
    this.phone.setValue(this.user.phone);
    //this.genres.setValue(this.user.genres);
    //console.log(this.user.address);
    this.location.setValue(this.user.address);
    if (this.user.quote) this.quote.setValue(this.user.quote);

    this.profileForm.valueChanges.subscribe(chgs=>{
      var parsedPh = parse(chgs.phone,"MM");
      this.phoneFormat = isValidNumber(parsedPh);
      //console.log(this.phoneFormat);
    });
  }
  buildForm(): void {
    this.profileForm = this.fb.group({
      name: this.name,
      phone:this.phone,
      email: this.email,
      location: this.location,
      quote: this.quote,
      genres: this.genres
    });
  }
  onSubmit() {
    let uniQuote: String = '';
    if (this.quote.value != '')
      uniQuote = knayi.fontConvert(this.quote.value, 'unicode');
    else
      uniQuote = this.quote.value;
    let updtUser = {
      displayName: knayi.fontConvert(this.name.value, 'unicode'),
      email: this.email.value,
      address: knayi.fontConvert(this.location.value, 'unicode'),
      quote: uniQuote,
      genres: this.genres.value,
      phone: this.phone.value
    };
    //console.log('UPDATING......', updtUser);
    this.firebaseService.updateProfile(updtUser, this.user.$key);
  }
  initJquery() {
    if (!this.loaded) {
      //console.log(this.user.address);
      $('#locDropdown').dropdown();
      $('#editDrop').dropdown('set exactly',this.user.genres);
      
      this.loaded = true;
      //console.log('loaded jq');
    }
    return true;
  }

}
