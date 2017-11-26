  /**
   * Are we displaying on Retina
   */
  export function isRetina() : boolean {
    return (typeof window !== 'undefined') && (window.devicePixelRatio >= 2);
  }