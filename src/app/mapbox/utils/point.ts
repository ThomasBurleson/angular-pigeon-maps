
export class Point {
  constructor(public x: number = 0, public y: number = 0) { }
  
  /**
   * Initial Point from string values
   */
  static fromStyle(x:string, y:string):Point {
    return new Point( parseInt(x, 10) || 0, parseInt(y, 10) || 0)
  }

  toString():string {
    return `(${this.x}, ${this.y})`;
  }
  
  /**
   * Equality comparison for 2 point(s) 
   * * @param target : Point
   */
  matches(target:Point):boolean {
    if ( !target ) return false;
    return (target.x === this.x) && (target.y === this.y );
  }

  scale(valX:number,valY:number=0):Point {
    return new Point(this.x * valX, this.y * (valY || valX));
  }

  offsetBy(delta:Point):Point {
    return new Point(this.x + delta.x, this.y + delta.y);
  }

}

export class BoundingRect {
  public get right() : number { return this.left + this.width; }
  public get bottom(): number { return this.top  + this.height; }

  constructor(
    public left  : number, 
    public top   : number,
    public width : number = 0, 
    public height: number = 0) { }

  /**
   * Equality comparison for 2 boundingRect(s) 
   * @param target : BoundingRect
   */
  matches(target:BoundingRect):boolean {
    if ( !target ) return false;
    return (
      (target.left   == this.left)  &&
      (target.right  == this.right) &&
      (target.width  == this.width) &&
      (target.height == this.height)
    );
  }
}

export type Range = { min: Point, max: Point };  

/**
* Round the `target` Point to the specified precision
*/
export function roundToPrecision(target:Point,precision:number=0): Point {
 const factor = Math.pow(10,precision);

 return new Point(
     Math.max(Math.floor(target.x * factor)/factor,0),
     Math.max(Math.floor(target.y * factor)/factor,0)
 );
}