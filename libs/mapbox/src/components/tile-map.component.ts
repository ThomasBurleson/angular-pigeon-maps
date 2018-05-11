/**
 * @license
 * Copyright Mindsapce LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  Inject,
  Component,
  Input,
  Output,
  EventEmitter,
  TrackByFunction,
  ChangeDetectionStrategy,
  ContentChildren,
  QueryList,
  SimpleChanges,
  ChangeDetectorRef,
  ElementRef,
  OnInit,
  OnDestroy,
  OnChanges,
  AfterContentInit
} from "@angular/core";

import { Subscription } from "rxjs/Subscription";

import { Tile, TileMap, TileMapCoordinates } from "../models";
import {
  Point,
  LatLongPoint,
  LatLong,
  MapStyles,
  TileMapStyles
} from "../utils";
import {
  TileMapDrag,
  TileMapLoader,
  MapProviderFactory,
  TILE_MAP_PROVIDERS
} from "../services";

import { TileMarkerComponent } from "./tile-marker.component";

@Component({
  selector: "mb-tile-map",
  styles: [
    `.tile {
        position        : absolute;
        will-change     : transform;
        transform-origin: left top 0px;
        opacity         : 1;
    }`,
    `{
      .hidden {
        position:absolute;
        display:none;
        left:-1000px;
        top:-1000px;
      }
    }`
  ],
  template: `
    <div [ngStyle]="styles.box">
      <div [ngStyle]="styles.list">
          <img *ngFor="let tile of tiles; trackBy: getTileID"  
               [src]="tile.url"
               class="tile" 
               [ngStyle]="tile.bounds" />
      </div>
      <div>
        <ng-content></ng-content>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TileMapComponent
  implements OnInit, OnDestroy, OnChanges, AfterContentInit {
  map: TileMap;
  tiles: Array<Tile> = [];
  styles: MapStyles = { box: {}, list: {} };
  getTileID: TrackByFunction<Tile> = Tile.trackBy;

  @Input() zoom: number; // zoom level
  @Input() center: Array<number>; // global lat long position for map center
  @Input() provider = "outdoors"; // map provider fn used to build tile urls

  @Output() status: EventEmitter<string> = new EventEmitter<string>();

  /**
   * Projected `<tile-marker>` items
   */
  @ContentChildren(TileMarkerComponent) markers: QueryList<TileMarkerComponent>;

  // **************************************************
  // Constructor
  // **************************************************

  /**
   * Constructor w/ MapUrlBuilders service
   */
  constructor(
    private elRef: ElementRef,
    private cd: ChangeDetectorRef,
    private dragger: TileMapDrag,
    private tileMapLoader: TileMapLoader,
    @Inject(TILE_MAP_PROVIDERS) private urlsFor: MapProviderFactory
  ) {}

  /**
   * Tools to preload tile images...
   */
  private loadWatch: Subscription;

  /**
   * Watcher for map dragging...
   */
  private dragWatch: Subscription;

  // **************************************************
  // Lifecycle Events
  // **************************************************

  ngOnInit() {
    this.enableDrag();
    this.buildTiles();
  }

  ngOnChanges(changes: SimpleChanges) {
    this.buildTiles();
  }
  ngAfterContentInit() {
    this.updateMarkerPositions();
  }

  ngOnDestroy() {
    this.loadWatch.unsubscribe();
    this.dragWatch.unsubscribe();
  }

  // **************************************************
  // Private methods
  // **************************************************

  /**
   * Enable map dragging using the TileMapDrag service
   */
  private enableDrag() {
    const container = this.elRef.nativeElement;
    const dragging$ = this.dragger.observeDragOn(container);

    this.dragWatch = dragging$.subscribe(position => {
      container.style.left = `${position.x}px`;
      container.style.top = `${position.y}px`;
    });
  }

  /**
   * Build a new TileMap for the current center+zoom, then build:
   *  1) a data model for all tiles releative within the TileMap coordinates
   *  2) css styles for the current TileMap
   *
   */
  private buildTiles() {
    const urlBuilder = this.urlsFor(this.provider);
    const centerAt = new LatLong(this.center[0], this.center[1]);
    const map = new TileMap(urlBuilder);
    const tiles = map.moveCamera(centerAt, this.zoom);

    this.map = map;
    this.loadTiles(tiles);
  }

  /**
   * Preload all tile images asynchronously
   */
  private loadTiles(tiles): void {
    if (this.loadWatch) {
      this.loadWatch.unsubscribe();
    }

    this.loadWatch = this.tileMapLoader.load(tiles).subscribe(list => {
      // update template binding sources
      this.tiles = list;
      this.styles = new TileMapStyles(this.map).styles;

      // Refresh DOM with new tile list
      this.cd.markForCheck();
    });
  }

  /**
   * For all projected content:
   *  (1) Relocate element TileMarker from global latLog to map pixel coordinates
   *      (which correct for map zooming and centering).
   */
  private updateMarkerPositions() {
    const coordinates: TileMapCoordinates = this.map.coordinates;

    // Convert each TileMarker::anchor global LatLong position to a
    // tile map pixel position
    this.markers.forEach((it: TileMarkerComponent, j: number) => {
      it.topLeft = coordinates.fromLatLong(it.anchor);
    });
  }
}
