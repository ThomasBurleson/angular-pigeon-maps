/**
 * @license
 * Copyright Mindsapce LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { InjectionToken } from "@angular/core";

/**
 * MapBox Access Token
 * @TODO  replace with access to environment variable...
 */
const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoidGhvbWFzYnVybGVzb24iLCJhIjoiY2phNWtmYzRwM2I3YTJ3cG9wcW1pODRjcSJ9.FSg2GyJtTaQRtLY6Ddx6rA'


// *************************************************
// Internal map providers
// These build URLs to map tiles for specific types of maps
// *************************************************

const mapbox = (mapboxId) => (lat, long, zoom) => {
  const retina = typeof window !== 'undefined' && window.devicePixelRatio >= 2 ? '@2x' : ''
  return `https://api.mapbox.com/styles/v1/mapbox/${mapboxId}/tiles/256/${zoom}/${lat}/${long}${retina}?access_token=${MAPBOX_ACCESS_TOKEN}`
}

const registry = {
  osm: (lat, long, zoom) => {
    const s = String.fromCharCode(97 + (lat + long + zoom) % 3)
    return `https://${s}.tile.openstreetmap.org/${zoom}/${lat}/${long}.png`
  },
  wikimedia: (lat, long, zoom) => {
    const retina = typeof window !== 'undefined' && window.devicePixelRatio >= 2 ? '@2x' : ''
    return `https://maps.wikimedia.org/osm-intl/${zoom}/${lat}/${long}${retina}.png`
  },
  stamen: (lat, long, zoom) => {
    const retina = typeof window !== 'undefined' && window.devicePixelRatio >= 2 ? '@2x' : ''
    return `https://stamen-tiles.a.ssl.fastly.net/terrain/${zoom}/${lat}/${long}${retina}.jpg`
  },
  streets  : mapbox('streets-v10'            ),
  satellite: mapbox('satellite-streets-v10'  ),
  outdoors : mapbox('outdoors-v10'           ),
  light    : mapbox('light-v9'               ),
  dark     : mapbox('dark-v9'                )
};


// *************************************************
// Exported Types and Factories
// *************************************************

export enum MapTypes {
  OSM       = "osm",
  WIKIMEDIA = "wikimedia",
  STAMEN    = "stamen",
  STREETS   = "streets",
  OUTDOORS  = "outdoors",
  LIGHT     = "light",
  DARK      = "dark"
};

export function MapTypesList() {
  return [
    MapTypes.DARK,
    MapTypes.LIGHT, 
    MapTypes.OSM, 
    MapTypes.OUTDOORS, 
    MapTypes.STAMEN, 
    MapTypes.STREETS, 
    MapTypes.WIKIMEDIA
  ];
};


/**
 * Interface and function signatures for building urls to different map types
 */
export type MapUrlFactory = (lat:number, long:number, zoom:number) => string;

/**
 * Accessor function used to lookup a MapUrlFn (aka url builder) for 
 * a specific map type. 
 * 
 * NOTE: 
 *   These are not ngModule providers. Rather these are MapBox URL factories for
 *   specific MapBox provider types
 */
export type MapProviderFactory = (provider:string) => MapUrlFactory;

/**
 * Injection token for the MapUrlBuilders services
 */
export const TILE_MAP_PROVIDERS = new InjectionToken<MapProviderFactory>("tilemap.map.providers");

/**
 * Provider factory to publish specific URL builder functions for different map types
 */
export function providerMapUrlsService() : MapProviderFactory {
  return (provider:string): MapUrlFactory => registry[provider];
}

/**
 * Angular MapUrls Provider used in the ngModule + DI
 */
export const TileMapUrlProviderFactory = { 
  provide   : TILE_MAP_PROVIDERS, 
  useFactory: providerMapUrlsService 
};

