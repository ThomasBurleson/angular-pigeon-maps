import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { MapBoxModule } from './mapbox';

import { AppComponent } from './components/app.component';
import { ControlBarComponent } from './components/control-bar.component';


@NgModule({
  imports: [
    BrowserModule,
    MapBoxModule
  ],
  declarations: [
    AppComponent,
    ControlBarComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
