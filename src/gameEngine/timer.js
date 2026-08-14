// timer.js
// -----------------------------------------------------------------------
// Owns ONLY the numeric countdown (remainingSeconds). How that number is
// visually displayed is entirely Person B's concern.
//
// This is a small class so the game engine can hold exactly one instance
// at a time and guarantee no duplicate timers.
// -----------------------------------------------------------------------

export class Timer {
  constructor({ onTick, onComplete } = {}) {
    this.onTick = onTick || (() => {});
    this.onComplete = onComplete || (() => {});
    this._intervalId = null;
    this.remainingSeconds = 0;
  }

  start(durationSeconds) {
    // Prevent duplicate timers — always clear any existing one first.
    this.stop();

    this.remainingSeconds = durationSeconds;
    this.onTick(this.remainingSeconds);

    this._intervalId = setInterval(() => {
      this.remainingSeconds -= 1;
      this.onTick(this.remainingSeconds);

      if (this.remainingSeconds <= 0) {
        this.stop();
        this.onComplete();
      }
    }, 1000);
  }

  stop() {
    if (this._intervalId !== null) {
      clearInterval(this._intervalId);
      this._intervalId = null;
    }
  }

  reset(durationSeconds) {
    this.stop();
    this.remainingSeconds = durationSeconds;
    this.onTick(this.remainingSeconds);
  }

  isRunning() {
    return this._intervalId !== null;
  }
}
