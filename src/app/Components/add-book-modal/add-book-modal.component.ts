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
import * as knayi from 'knayi-myscript';
import * as firebase from 'firebase/app';
declare var $ : any;

@Component({
  selector: 'app-add-book-modal',
  templateUrl: './add-book-modal.component.html',
  styleUrls: ['./add-book-modal.component.css']
})
export class AddBookModalComponent implements OnInit {

  public cUser: any;
  //user: Observable<firebase.User>;

  public genresList: any=[];
  public isLoading : any;
  public title: FormControl;
  public author: FormControl;
  public genres: FormControl;
  public description: FormControl;
  public bookCover: File;
  public bookCoverBlob: any = null;

  public addBookForm: FormGroup;

  constructor(
    public fb: FormBuilder,
    public af: AngularFireAuth,
    public firebaseService: FirebaseService
  ) {
  }

  ngOnInit() {
    this.af.authState.subscribe(res=>this.cUser=res);
    this.firebaseService.getGenres().subscribe(res=>{
      this.genresList=res
    });   
    this.title = new FormControl('', [
      Validators.required,
      Validators.minLength(4)
    ]);
    this.author = new FormControl('', [
      Validators.required,
      Validators.minLength(4)
    ]);
    this.genres = new FormControl('', [
      Validators.required,
    ]);
    this.description = new FormControl('');
    this.buildForm();
  }

  buildForm(): void {
    this.addBookForm = this.fb.group({
      title: this.title,
      author: this.author,
      genres: this.genres,
      description: this.description,
    });
  }
  onFileChange(event) {
    let fileList: FileList = event.target.files;
    if (fileList.length > 0) {
      let file: File = fileList[0];
      this.bookCover = file;

      interface IResizeImageOptions {
        maxSize: number;
        file: File;
      }
      const resizeImage = (settings: IResizeImageOptions) => {
        const file = settings.file;
        const maxSize = settings.maxSize;
        const reader = new FileReader();
        const image = new Image();
        const canvas = document.createElement('canvas');
        const dataURItoBlob = (dataURI: string) => {
          const bytes = dataURI.split(',')[0].indexOf('base64') >= 0 ?
            atob(dataURI.split(',')[1]) :
            decodeURI(dataURI.split(',')[1]);
          const mime = dataURI.split(',')[0].split(':')[1].split(';')[0];
          const max = bytes.length;
          const ia = new Uint8Array(max);
          for (var i = 0; i < max; i++) ia[i] = bytes.charCodeAt(i);
          return new Blob([ia], { type: mime });
        };
        const resize = () => {
          let width = image.width;
          let height = image.height;

          if (width > height) {
            if (width > maxSize) {
              height *= maxSize / width;
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width *= maxSize / height;
              height = maxSize;
            }
          }

          canvas.width = width;
          canvas.height = height;
          canvas.getContext('2d').drawImage(image, 0, 0, width, height);
          let dataUrl = canvas.toDataURL('image/jpeg');
          return dataURItoBlob(dataUrl);
        };

        return new Promise((ok, no) => {
          if (!file.type.match(/image.*/)) {
            no(new Error("Not an image"));
            return;
          }

          reader.onload = (readerEvent: any) => {
            image.onload = () => ok(resize());
            image.src = readerEvent.target.result;
          };
          reader.readAsDataURL(file);
        })
      };

      resizeImage({
        file: this.bookCover,
        maxSize:1000
      }).then(res=>{
        this.bookCoverBlob=res;
        //console.log(this.bookCoverBlob);
      });
      // let formData: FormData = new FormData();
      // formData.append('uploadFile', file,file.name);
      // console.log(formData);
      // console.log(file);
      // let headers = new Headers();
      // headers.append('Content-Type', 'multipart/form-data');
      // headers.append('Accept','application/json');
      // let options = new RequestOptions({headers: headers});
    }
  }

  onSubmit(): void {
    this.isLoading=true;
    let uniDescription:String='';
    // if(this.description.value == ''){
    //   uniDescription = '';
    // }
    // else
    //   uniDescription = this.description.value;

    let newBook = {
      title: knayi.fontConvert(this.title.value,'unicode'),
      author: knayi.fontConvert(this.author.value,'unicode'),
      genres: this.genres.value,
      description: this.description.value==''||null ? this.description.value : knayi.fontConvert(this.description.value,'unicode'),
      owner: this.cUser.uid,
      bookCover: null,
      currentHolder: null
    };
    this.firebaseService.addBook(newBook, this.bookCoverBlob).then(res=>{
      if(res)this.isLoading=false;
    });

    this.title.setValue(null);
    this.author.setValue(null);
    this.description.setValue('');
    $('#addDropDown').dropdown('clear');
    $('#addDropDown').dropdown('set selected','');
    this.genres.setValue([]);
  }
}
