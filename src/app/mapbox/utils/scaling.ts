export type Zooming = {
  zoom    : number;
  rounded : number;
  delta   : number;
}

export class Scaling {
  constructor(public scale: number, public width: number, public height: number) { }
}