import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { FooterComponent } from './Components/footer/footer.component';
import { LandingPageComponent } from './Components/landing-page/landing-page.component';

import { parse, format, asYouType, isValidNumber } from 'libphonenumber-js';
import * as knayi from 'knayi-myscript';

import { AngularFireModule } from 'angularfire2';
import { AngularFireDatabaseModule } from 'angularfire2/database';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { environment } from '../environments/environment';
import * as firebase from 'firebase';
import { RouterModule, Routes } from '@angular/router';
import { DragulaModule } from 'ng2-dragula';

import { FirebaseService } from './Services/firebase.service';

import { FeedViewComponent } from './Components/Feed/feed-view/feed-view.component';
import { NavBarComponent } from './Components/nav-bar/nav-bar.component';
import { RegisterFormComponent } from './Components/register-form/register-form.component';
import { ReactiveFormsModule } from '@angular/forms';
import { AddBookModalComponent } from './Components/add-book-modal/add-book-modal.component';
import { BookListComponent } from './Components/Feed/book-list/book-list.component';
import { ProfileComponent } from './Components/profile/profile.component';
import { SpinnerComponent } from './Components/spinner/spinner.component';
import { TradeViewComponent } from './Components/Trade/trade-view/trade-view.component';
import { CheckTradeComponent } from './Components/Trade/check-trade/check-trade.component';
import { SearchComponent } from './Components/Feed/search/search.component';
import { EditProfileComponent } from './Components/edit-profile/edit-profile.component';

const appRoutes: Routes = [
  { path: '', component: LandingPageComponent },
  { path: 'feed', component: FeedViewComponent },
  { path: 'registration', component: RegisterFormComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'trade', component: TradeViewComponent },
  { path: 'trade/:id', component: CheckTradeComponent}
]


@NgModule({
  declarations: [
    AppComponent,
    FooterComponent,
    LandingPageComponent,
    FeedViewComponent,
    NavBarComponent,
    RegisterFormComponent,
    AddBookModalComponent,
    BookListComponent,
    ProfileComponent,
    SpinnerComponent,
    TradeViewComponent,
    CheckTradeComponent,
    SearchComponent,
    EditProfileComponent
  ],
  imports: [
    DragulaModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserModule,
    FormsModule,
    HttpModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAuthModule,
    AngularFireDatabaseModule,
    RouterModule.forRoot(appRoutes)
  ],
  providers: [FirebaseService],
  bootstrap: [AppComponent]
})
export class AppModule { }
