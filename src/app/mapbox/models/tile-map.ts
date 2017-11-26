import { LatLong, LatLongPoint } from '../utils/lat-long';
import { Scaling, Zooming } from '../utils/scaling';
import { Point, Range, BoundingRect } from '../utils/point';
import { constrainRange } from '../utils/tile-map-utils';

import { MapUrlFactory } from '../services/tile-map-provider';
import { TileMapCoordinates } from './tile-map-info';
import { Tile, TileFactory, createTileFactory } from './tile';


/**
 * TileMap maintains a 2-D [256 x 256 cells] grid of Tile data model items 
 
 * The TileMap is responsible for rebuilding the `tiles` list and map information whenever the 
 * camera moves or zooms.
 */
export class TileMap {

  /**
   * 2D list (columns concatenated) of Tile model items
   */
  tiles: Array<Tile> = [];

  /**
   * Min, Max, Scale, and Zoom information associated with the current 2D Grid
   */
  coordinates : TileMapCoordinates;

  /**
   * Constructor used to precapture the width, height, and url builder
   */
  constructor( 
    private urlBuilder: MapUrlFactory,
    private width     : number = 600, 
    private height    : number = 400 ) { }

  /**
   * As the camera moves, zooms, etc... then rebuild the data models
   */
  moveCamera(
       center    : LatLongPoint, 
       zoom      : number = 1, 
       zoomDelta : number = 0, 
       pixelDelta: Point  = null ): Array<Tile> {
     const range = new BoundingRect(0, 0, this.width, this.height);

     this.coordinates = new TileMapCoordinates(center, range, pixelDelta, zoom, zoomDelta );
     this.tiles       = this.buildTiles();

     return this.tiles;
  }


  // ************************************************
  // Private methods
  // ************************************************

  /**
   * Build a 2D model of tile items as a single list using 'concatenated columns'
   */
  private buildTiles(): Array<Tile> {
    const mc      : TileMapCoordinates = this.coordinates;
    const buffer  : Array<Tile> = [];

    
    const zoom    : number      = mc.zooming.zoom;
    const minMax  : Range       = { min: mc.min, max: mc.max };
    const bounds  : Range       = constrainRange(minMax, zoom);
    const makeTile: TileFactory = createTileFactory(this.urlBuilder);

    for (let x = bounds.min.x; x <= bounds.max.x; x++) {
      for (let y = bounds.min.y; y <= bounds.max.y; y++) {
        buffer.push( makeTile(x, y, zoom, bounds.min) );
      }
    }

    return buffer;
  }

}

