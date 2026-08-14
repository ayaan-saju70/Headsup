export async function startTiltInput({ onTiltDown, onTiltUp, windowObj }) {
  const win = windowObj || (typeof window !== 'undefined' ? window : null);
  
  // 1. Handle missing API (graceful fallback)
  if (!win || !win.DeviceOrientationEvent) {
    return false;
  }

  // 2. Request permission (iOS 13+)
  if (typeof win.DeviceOrientationEvent.requestPermission === 'function') {
    try {
      const permission = await win.DeviceOrientationEvent.requestPermission();
      if (permission !== 'granted') {
        return false;
      }
    } catch (err) {
      return false; // Fallback if permission request fails
    }
  }

  let neutralBeta = null;
  let neutralGamma = null;
  let state = 'neutral'; // 'neutral', 'tilted_down', 'tilted_up'
  
  const TILT_THRESHOLD = 30; // Degrees from neutral to trigger
  const RETURN_THRESHOLD = 15; // Degrees from neutral to reset

  const handleOrientation = (event) => {
    let { beta, gamma } = event;
    
    // Ignore events with no data (some browsers fire empty events initially)
    if (beta === null || beta === undefined || gamma === null || gamma === undefined) return;

    // 3. Calibration: lock in the resting orientation on first valid event
    if (neutralBeta === null) {
      neutralBeta = beta;
      neutralGamma = gamma;
      return;
    }

    // 4. Calculate relative tilt
    let deltaBeta = beta - neutralBeta;
    let deltaGamma = gamma - neutralGamma;
    
    // Normalize wrapped angles
    if (deltaBeta > 180) deltaBeta -= 360;
    if (deltaBeta < -180) deltaBeta += 360;
    if (deltaGamma > 180) deltaGamma -= 360;
    if (deltaGamma < -180) deltaGamma += 360;

    // 5. Debounce & State Management
    // Direction is decided by beta (front-back tilt) only.
    // gamma (left-right) is only used to reject ambiguous/sideways motion.
    const isClearlySideways = Math.abs(deltaGamma) > Math.abs(deltaBeta) && Math.abs(deltaGamma) > TILT_THRESHOLD;

    if (state === 'neutral' && !isClearlySideways) {
      if (deltaBeta > TILT_THRESHOLD) {
        state = 'tilted_down';
        if (onTiltDown) onTiltDown();
      } else if (deltaBeta < -TILT_THRESHOLD) {
        state = 'tilted_up';
        if (onTiltUp) onTiltUp();
      }
    } else if (state !== 'neutral') {
      // 6. Require return to neutral before another tilt can fire
      if (Math.abs(deltaBeta) < RETURN_THRESHOLD) {
        state = 'neutral';
      }
    }
  };

  win.addEventListener('deviceorientation', handleOrientation);

  return {
    stop: () => {
      win.removeEventListener('deviceorientation', handleOrientation);
    }
  };
}
