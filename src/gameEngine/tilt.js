export async function startTiltInput({ onTiltDown, onTiltUp, windowObj }) {
  const win = windowObj || (typeof window !== 'undefined' ? window : null);
  if (!win || !win.DeviceOrientationEvent) return false;

  if (typeof win.DeviceOrientationEvent.requestPermission === 'function') {
    try {
      const permission = await win.DeviceOrientationEvent.requestPermission();
      if (permission !== 'granted') return false;
    } catch (err) {
      return false;
    }
  }

  let neutralBeta = null;
  let neutralGamma = null;
  let latestBeta = null;
  let latestGamma = null;
  let state = 'neutral';
  let calibrating = false;
  let calibrationSamples = [];

  const TILT_THRESHOLD = 30;
  const RETURN_THRESHOLD = 15;

  const handleOrientation = (event) => {
    const { beta, gamma } = event;
    if (beta == null || gamma == null) return;
    latestBeta = beta;
    latestGamma = gamma;

    if (calibrating) {
      calibrationSamples.push({ beta, gamma });
      return;
    }
    if (neutralBeta === null) return; // not calibrated yet — ignore events

    let deltaBeta = beta - neutralBeta;
    let deltaGamma = gamma - neutralGamma;
    if (deltaBeta > 180) deltaBeta -= 360;
    if (deltaBeta < -180) deltaBeta += 360;
    if (deltaGamma > 180) deltaGamma -= 360;
    if (deltaGamma < -180) deltaGamma += 360;

    console.log('[TILT]', { beta, gamma, neutralBeta, neutralGamma, deltaBeta, deltaGamma, state });

    const isClearlySideways = Math.abs(deltaGamma) > Math.abs(deltaBeta) && Math.abs(deltaGamma) > TILT_THRESHOLD;

    if (state === 'neutral' && !isClearlySideways) {
      if (deltaBeta > TILT_THRESHOLD) {
        state = 'tilted_down';
        if (onTiltDown) onTiltDown();
      } else if (deltaBeta < -TILT_THRESHOLD) {
        state = 'tilted_up';
        if (onTiltUp) onTiltUp();
      }
    } else if (state !== 'neutral' && Math.abs(deltaBeta) < RETURN_THRESHOLD) {
      state = 'neutral';
    }
  };

  win.addEventListener('deviceorientation', handleOrientation);

  // Explicit calibration — call this once the guesser has the phone at
  // their forehead, not on listener attach.
  function calibrate(sampleWindowMs = 400) {
    return new Promise((resolve) => {
      calibrating = true;
      calibrationSamples = [];
      setTimeout(() => {
        calibrating = false;
        if (calibrationSamples.length > 0) {
          neutralBeta = calibrationSamples.reduce((s, v) => s + v.beta, 0) / calibrationSamples.length;
          neutralGamma = calibrationSamples.reduce((s, v) => s + v.gamma, 0) / calibrationSamples.length;
        } else if (latestBeta !== null) {
          // fallback if no samples arrived during the window
          neutralBeta = latestBeta;
          neutralGamma = latestGamma;
        }
        state = 'neutral';
        resolve(neutralBeta !== null);
      }, sampleWindowMs);
    });
  }

  return {
    calibrate,
    stop: () => win.removeEventListener('deviceorientation', handleOrientation),
  };
}
