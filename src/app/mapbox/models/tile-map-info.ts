import { Point, BoundingRect } from "../utils/point";
import { Scaling, Zooming } from "../utils/scaling";
import { LatLongPoint, LatLong } from "../utils/lat-long";

export class TileMapCoordinates {

    zooming: Zooming;
    scaling: Scaling;
    center : Point;
    min    : Point;
    max    : Point;

    /**
     * To create a TileMapInfo, we must have the bounds of the grid box
     * and the center point.
     * 
     */
     constructor(
      public latLong : LatLongPoint, 
      bounds         : BoundingRect, 
      pixelDelta     : Point  = null, 
      zoom           : number = 1, 
      zoomDelta      : number = 0  ) {

      this.centerAndZoom(bounds, latLong, zoom, zoomDelta, pixelDelta);
    }

    /**
     * Calculate TileMapInfo associated with current bounds, zoom, and centering
     */
    centerAndZoom(
        bounds    : BoundingRect, 
        center    : LatLongPoint, 
        zoom      : number, 
        zoomDelta : number = 0, 
        pixelDelta: Point  = null) {

      const roundedZoom = Math.round(zoom + zoomDelta);
      const zoomDiff    = zoom + zoomDelta - roundedZoom;
      const scale       = Math.pow(2, zoomDiff);
      
      this.zooming      = { zoom: zoom, rounded: roundedZoom, delta: zoomDelta };
      this.scaling      = new Scaling(scale, bounds.width / scale, bounds.height / scale);
      
      // Our map is a 256x256 cell grid
      const halfWidth   = this.scaling.width / 2 / 256.0;
      const halfHeight  = this.scaling.height / 2 / 256.0;
      
      const converted   = LatLong.toPoint(center.lat, center.lng, roundedZoom);
      const offset      = pixelDelta ? pixelDelta.scale(1 / 256.0 / scale) : new Point(0,0);
      
      this.center       = new Point(converted.x - offset.x, converted.y - offset.y),
      this.min          = new Point(Math.floor(this.center.x - halfWidth), Math.floor(this.center.y - halfHeight)),
      this.max          = new Point(Math.floor(this.center.x + halfWidth), Math.floor(this.center.y + halfHeight))
    }  
    
    /**
     * Convert a global LatLong coordinate to map-specific pixel point/location 
     * This conversion should also account for map-relative zooming and centering.
     */
    fromLatLong(target:Array<number>):Point {
      const pixelDelta = new Point(0,0);
      const midPt      = new Point(this.scaling.width / 2, this.scaling.height / 2);
      const tile       = LatLong.toPoint(target[0], target[1], this.zooming.zoom);

      return new Point(tile.x - this.center.x, tile.y - this.center.y )
                  .scale( 256 )
                  .offsetBy( midPt )
                  .offsetBy( pixelDelta);
    }

    /**
     * Convert map-specific pixel location [relative to map zoom and centering]
     * to a global LatLong point.
     */
    toLatLong(target:Point):LatLongPoint {
      const pixelDelta = new Point(0,0);
      const delta = new Point((target.x - this.scaling.width/2), (target.y - this.scaling.height/2))
            .offsetBy( this.center )
            .offsetBy( pixelDelta )
            .scale( 1/256 );

      return new LatLong(delta.x, delta.y);
    }
}