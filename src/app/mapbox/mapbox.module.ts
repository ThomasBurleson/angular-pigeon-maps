import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { TileMapComponent, TileMarkerComponent, TileMapProgressIndicator } from './components';
import { TileMapLoader, TileMapDrag, TileMapUrlProviderFactory } from './services';

const ALL_COMPONENTS = [
  TileMapComponent,
  TileMarkerComponent,
  TileMapProgressIndicator
]
@NgModule({
  imports     : [ BrowserModule ],
  declarations: [ ...ALL_COMPONENTS ],
  exports     : [ ...ALL_COMPONENTS ],
  providers   : [ 
    TileMapDrag, 
    TileMapLoader,
    TileMapUrlProviderFactory ]
})
export class MapBoxModule { }
