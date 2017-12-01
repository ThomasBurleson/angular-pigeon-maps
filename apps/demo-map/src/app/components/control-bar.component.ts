import { 
  Inject, 
  Component, 
  Input, Output, 
  EventEmitter, 
  TrackByFunction,
  ChangeDetectionStrategy,
  ContentChildren,
  QueryList,
  SimpleChanges,
  ChangeDetectorRef
} from "@angular/core";

import { MapTypesList } from "@pigeon-maps-nx/mapbox";

@Component({
  selector : 'app-control-bar',
  template : `
    <div style="margin-top:20px">
      <button 
        *ngFor="let p of knownProviders"
        (click)="selectProvider.emit(p)"> 
          {{p}}
      </button>
    </div>
    <div style="margin-top:5px">
    <button (click)="zoomIn.emit()" > Zoom In </button>
    <button (click)="zoomOut.emit()" > Zoom Out </button>
  `,
  changeDetection : ChangeDetectionStrategy.OnPush
})
export class ControlBarComponent { 
  knownProviders: Array<string>      = MapTypesList();

  @Output()   zoomOut        = new EventEmitter<void>();
  @Output()   zoomIn         = new EventEmitter<void>();
  @Output()   selectProvider = new EventEmitter<string>();
}