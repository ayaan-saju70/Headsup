// useGameEngine.js
// -----------------------------------------------------------------------
// Thin React hook wrapper. Person B can use this in components without
// touching gameEngine.js internals directly.
//
// Usage:
//   const { state, engine } = useGameEngine();
//   engine.startGame();
//   const movie = engine.getCurrentMovie();
// -----------------------------------------------------------------------

import { useEffect, useMemo, useState } from "react";
import { createGameEngine } from "./gameEngine.js";
import { createInitialState } from "./gameState.js";

export function useGameEngine() {
  const [state, setState] = useState(createInitialState());

  const engine = useMemo(
    () => createGameEngine({ onStateChange: setState }),
    []
  );

  // Safety net: stop any running timer if the component unmounts mid-round.
  useEffect(() => {
    return () => {
      engine.resetGame();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { state, engine };
}

export default useGameEngine;
