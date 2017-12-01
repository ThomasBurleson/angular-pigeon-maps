import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NxModule } from '@nrwl/nx';

import { MapBoxModule } from '@pigeon-maps-nx/mapbox';

import { AppComponent } from './app.component';
import { ControlBarComponent } from './components/control-bar.component';

@NgModule({
  imports: [
    BrowserModule, 
    NxModule.forRoot(), 
    MapBoxModule
  ],
  declarations: [
    AppComponent, 
    ControlBarComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
