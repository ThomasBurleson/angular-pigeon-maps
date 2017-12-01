import { Component } from '@angular/core';
import { TileMarkerComponent, MapTypes } from '@pigeon-maps-nx/mapbox';

@Component({
  selector: 'app-root',
  styleUrls : [ 
    './app.component.css' 
  ],
  template: `
    <div class="centered">
      <div class="dragBox">

        <mb-tile-map
          class="mapBox"
          [provider]="mapProvider"
          [center]="mapCenter" 
          [zoom]="zoomLevel" >

            <mb-tile-marker 
              *ngFor="let it of markers" 
              [anchor]="it" 
              (selected)="onMarkerSelected(it)">
                  <!-- 0...n POI markers -->
            </mb-tile-marker>

        </mb-tile-map>
        
        <app-control-bar 
          class="toolbar"
          (zoomIn)="zoomIn()"
          (zoomOut)="zoomOut()"  
          (selectProvider)="mapProvider=$event">
        </app-control-bar>

      </div> 

      <mb-progress-indicator class="loader">
      </mb-progress-indicator>
    </div>
  `
})
export class AppComponent {
  zoomLevel   : number               = 13;
  mapProvider : string               = MapTypes.OUTDOORS;
  mapCenter   : Array<number>        = [50.879, 4.6997];
  markers     : Array<Array<number>> = [[50.879, 4.6997],[50.874, 4.6947]];  
 
  
  onMarkerSelected(marker:TileMarkerComponent) {
    console.log(`marker isSelected == ${marker.selected}`);
  }

  zoomIn()  {  this.zoomLevel = Math.min(this.zoomLevel + 1, 18);  }
  zoomOut() {  this.zoomLevel = Math.max(this.zoomLevel -1, 1);    }

}
