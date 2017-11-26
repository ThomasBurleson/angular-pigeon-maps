import { Point } from "./point";

export type LatLongPoint = {
  lat : number; // degrees
  lng : number; // degrees
}

export class LatLong {
  constructor(public lat: number = 0, public lng: number = 0) { }

  /*
   * Convert a (x,y) tile pixle Point to a Map LatLong coordinates
   */ 
  static fromPoint(x: number, y: number, zoom: number): LatLong {
    const n = Math.PI - 2 * Math.PI * y / Math.pow(2, zoom);
    return new LatLong(
      (x / Math.pow(2, zoom) * 360 - 180),
      (180 / Math.PI * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n))))
    );
  }

  /**
   * Convert map Lat/Long coordinates to Map pixel point.
   */
  static toPoint(lat:number, long:number, zoom:number):Point {
    const n = lat * Math.PI / 180;
    return new Point(
      (long + 180) / 360 * Math.pow(2, zoom),
      (1 - Math.log(Math.tan(n) + 1 / Math.cos(n)) / Math.PI) / 2 * Math.pow(2, zoom)      
    );
  }

  static minimum : LatLong = LatLong.fromPoint(Math.pow(2,10), 0, 10);
  static maximum : LatLong = LatLong.fromPoint(0, Math.pow(2,10), 10);

}

