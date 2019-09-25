import React, {
  useRef,
  useEffect,
  useReducer,
  useCallback,
  useLayoutEffect
} from "react";
import "./styles.css";

//A hook for getting the previous state/a previous value, if needed
// const usePrevious = value => {
//   const ref = useRef();
//   useEffect(() => {
//     ref.current = value;
//   });
//   return ref.current;
// };

const telemetryReducer = (state, action) => {
  switch (action.type) {
    case "start_dragging":
      return {
        ...state,
        dragging: true,
        startX: action.startX
      };
    case "move":
      return {
        ...state,
        currentX: state.startX - action.currentX
      };

    case "move_stop":
      return {
        ...state,
        dragging: false,
        currentX: 0
      };
    default:
      return state;
  }
};

// const getAngle = (distance, prevAngle, width) => {
//   const cappedMovement =
//     distance > 0 ? Math.min(distance, width) : Math.max(distance, -width);
//   const degreesMoved = (cappedMovement / width) * 360 + prevAngle;
//   const currentCarouselDegrees =
//     degreesMoved > 360
//       ? degreesMoved - 360
//       : degreesMoved < 0
//       ? degreesMoved + 360
//       : degreesMoved;

//   return Math.round(currentCarouselDegrees);
// };

const CarouselHook = () => {
  const draggableRef = useRef();
  //A reducer for our carousels telemetry data and dragging
  const [telemetry, dispatch] = useReducer(telemetryReducer, {
    dragging: false,
    startX: 0,
    currentX: 0
  });

  // handling the mouse being pressed down
  const handleMouseDown = useCallback(({ clientX }) => {
    dispatch({ type: "start_dragging", startX: clientX });
  }, []);

  // mouse move
  const handleMouseMove = useCallback(
    ({ clientX }) => {
      if (telemetry.dragging) {
        dispatch({ type: "move", currentX: clientX });
      }
    },
    [telemetry.dragging]
  );

  // mouse left click release
  const handleMouseUp = useCallback(() => {
    if (telemetry.dragging) {
      dispatch({ type: "move_stop" });
    }
  }, [telemetry.dragging]);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  useLayoutEffect(() => {
    draggableRef.current.style.transform = `translateX(${-telemetry.currentX}px)`;
  }, [telemetry.currentX]);

  return (
    <div>
      <h1>Spin the text below!</h1>
      <div
        ref={draggableRef}
        onMouseDown={handleMouseDown}
        // onTouchStart={onDragStartTouch}
        className="spinText"
      >
        {telemetry.currentX}
        touch move me wherever necessary
      </div>
    </div>
  );
};

export default CarouselHook;
