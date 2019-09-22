import React, { useState, useRef, useEffect, useReducer } from "react";
import "./styles.css";

//A hook for getting the previous state/a previous value, if needed
const usePrevious = value => {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
};

const useWidth = ref => {
  console.log("called useWidth");
  const [width, setWidth] = useState(0);
  useEffect(() => {
    setWidth(ref.current.getBoundingClientRect().width);
  }, [ref]);
};

const telemetryReducer = (state, action) => {
  switch (action.type) {
    case "user_move":
      return {
        angle: action.angle,
        change: action.change,
        velocity: action.velocity
      };
    case "decay_move":
      return {
        ...state,
        angle: action.angle,
        velocity: action.velocity
      };
    case "reset_change":
      return {
        ...state,
        change: 0
      };
    case "reset_velocity":
      return { ...state, velocity: 0 };

    default:
      return state;
  }
};

const Carousel2 = () => {
  const [dragState, setDragState] = useState({
    dragging: false,
    dragStartX: 0,
    dragStartTime: 0
  });
  const [carouselTelemetry, dispatch] = useReducer(telemetryReducer, {
    angle: 0,
    change: 0,
    velocity: 0
  });
  const [decayInterval, setDecayInterval] = useState(null);
  const draggableRef = useRef();
  const width = useWidth(draggableRef);

  useEffect(() => {
    window.addEventListener("mouseup", onDragEndMouse);
    window.addEventListener("touchend", onDragEndTouch);

    return () => {
      window.removeEventListener("mouseup", onDragEndMouse);
      window.removeEventListener("touchend", onDragEndTouch);
    };
  }, []);

  const onDragEndMouse = e => {
    window.removeEventListener("mousemove", this.onMouseMove);
    onDragEnd();
  };

  const onDragEndTouch = e => {
    window.removeEventListener("touchmove", this.onTouchMove);
    onDragEnd();
  };

  const onDragStartMouse = e => {
    onDragStart(e.clientX);
    window.addEventListener("mousemove", this.onMouseMove);
  };

  const onDragStartTouch = e => {
    const touch = e.targetTouches[0];
    onDragStart(touch.clientX);
    window.addEventListener("touchmove", this.onTouchMove);
  };

  const onDragStart = clientX => {
    if (decayInterval !== null) {
      clearInterval(decayInterval);
    }
    setDragState({ dragStartX: clientX, dragging: true, velocity: 0 });
    requestAnimationFrame(updatePosition);
  };

  const onDragEnd = () => {
    setDragState(state => ({ ...state, change: 0, dragging: false }));
    setDecayInterval(state =>
      state === null ? setInterval(animateSliding, 66) : null
    );
  };

  return (
    <div>
      <h1>Spin the text below!</h1>
      <div
        ref={this.draggableRef}
        onMouseDown={onDragStartMouse}
        onTouchStart={onDragStartTouch}
        className="spinText"
      >
        touch move me wherever necessary
      </div>
      <br />
      <br />
      <br />
      <span>
        {`pos: ${carouselTelemetry.angle} velo:${carouselTelemetry.velocity}`}
      </span>
    </div>
  );
};

class Carousel extends React.Component {
  constructor(props) {
    super(props);

    this.draggableRef = React.createRef();

    this.state = {
      dragging: false,
      dragStartX: 0,
      dragStartTime: 0,
      carouselPosition: 0, //This can be a value between 0 - 360,
      change: 0,
      velocity: 0,
      width: 0,
      intervalId: null
    };

    this.onDragStartMouse = this.onDragStartMouse.bind(this);
    this.onDragStartTouch = this.onDragStartTouch.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onTouchMove = this.onTouchMove.bind(this);
    this.updatePosition = this.updatePosition.bind(this);
    this.onDragEnd = this.onDragEnd.bind(this);
    this.onDragStart = this.onDragStart.bind(this);
    this.onDragEndMouse = this.onDragEndMouse.bind(this);
    this.onDragEndTouch = this.onDragEndTouch.bind(this);
    this.animateSliding = this.animateSliding.bind(this);
  }

  componentDidMount() {
    window.addEventListener("mouseup", this.onDragEndMouse);
    window.addEventListener("touchend", this.onDragEndTouch);
    this.setState(() => ({
      width: this.draggableRef.current.getBoundingClientRect().width
    }));
  }

  componentWillUnmount() {
    window.removeEventListener("mouseup", this.onDragEndMouse);
    window.removeEventListener("touchend", this.onDragEndTouch);
  }

  onDragStart(clientX) {
    if (this.state.intervalId !== null) {
      clearInterval(this.state.intervalId);
    }
    this.setState(() => ({ dragStartX: clientX, dragging: true, velocity: 0 }));
    requestAnimationFrame(this.updatePosition);
  }

  onDragEnd() {
    this.setState(prevState => ({
      dragging: false,
      change: 0,
      intervalId:
        prevState.intervalId === null
          ? setInterval(this.animateSliding, 66)
          : null
    }));
  }

  updatePosition() {
    //When we start dragging updatePosition is called once, then it must keep
    //calling itself so we can continue to update the position of the current item,
    //thats why the following line is here, it will terminate when we mouseup and dragging becomes false
    if (this.state.dragging) requestAnimationFrame(this.updatePosition);

    const now = Date.now();
    const elapsed = now - this.state.dragStartTime;

    if (
      (this.state.dragging && elapsed > 20) ||
      this.state.intervalId !== null
    ) {
      this.draggableRef.current.style.transform = `rotate3d(0,1,0,${
        this.state.carouselPosition
      }deg)`;

      this.setState(() => ({ dragStartTime: Date.now() }));
    }
  }

  onMouseMove(e) {
    const change = e.clientX - this.state.dragStartX;
    this.setState(prevState => ({
      change: change,
      carouselPosition: this.calculateCarouselPosition(
        change - prevState.change,
        prevState.carouselPosition,
        prevState.width
      ),
      velocity:
        ((change - prevState.change) / (Date.now() - prevState.dragStartTime)) *
        20
    }));
  }

  onTouchMove(e) {
    const touch = e.targetTouches[0];
    const change = touch.clientX - this.state.dragStartX;
    this.setState(prevState => ({
      change: change,
      carouselPosition: this.calculateCarouselPosition(
        change - prevState.change,
        prevState.carouselPosition,
        prevState.width
      ),
      velocity:
        ((change - prevState.change) / (Date.now() - prevState.dragStartTime)) *
        20
    }));
  }

  onDragStartMouse(e) {
    this.onDragStart(e.clientX);
    window.addEventListener("mousemove", this.onMouseMove);
  }

  onDragStartTouch(e) {
    const touch = e.targetTouches[0];
    this.onDragStart(touch.clientX);
    window.addEventListener("touchmove", this.onTouchMove);
  }

  onDragEndMouse(e) {
    window.removeEventListener("mousemove", this.onMouseMove);
    this.onDragEnd();
  }

  onDragEndTouch(e) {
    window.removeEventListener("touchmove", this.onTouchMove);
    this.onDragEnd();
  }

  calculateCarouselPosition(currentMovement, previousCarouselState, width) {
    //1) Here we take the distance spun since our last frame checked
    //2) We don't want to let a user spin more than the width of our element so that
    //a full spin is the start to the finish of the element in dragging distance,
    //so we min/max it.
    //3) We map the distance moved, relative to the elements with to 360 degrees to see
    //how much of the "carousel" we've spun
    //4) We don't ever want to be spinning more than 360 degrees or less than 0
    const cappedMovement =
      currentMovement > 0
        ? Math.min(currentMovement, width)
        : Math.max(currentMovement, -width);
    const degreesMoved = (cappedMovement / width) * 360 + previousCarouselState;
    const currentCarouselDegrees =
      degreesMoved > 360
        ? degreesMoved - 360
        : degreesMoved < 0
        ? degreesMoved + 360
        : degreesMoved;

    return Math.round(currentCarouselDegrees);
  }

  animateSliding() {
    const { velocity, dragging } = this.state;
    if (!dragging && Math.abs(velocity) > 0) {
      this.setState(prevState => ({
        carouselPosition: this.calculateCarouselPosition(
          velocity,
          prevState.carouselPosition,
          prevState.width
        ),
        velocity:
          Math.abs(prevState.velocity / 1.5) < 0.3
            ? 0
            : prevState.velocity / 1.5
      }));
      requestAnimationFrame(this.updatePosition);
    } else {
      clearInterval(this.state.intervalId);
      this.setState(() => ({ intervalId: null }));
    }
  }

  render() {
    const { carouselPosition, velocity } = this.state;

    return (
      <div>
        <h1>hey</h1>
        <div
          ref={this.draggableRef}
          onMouseDown={this.onDragStartMouse}
          onTouchStart={this.onDragStartTouch}
          className="spinText"
        >
          touch move me wherever necessary
        </div>
        <br />
        <br />
        <br />
        {`pos: ${carouselPosition} velo:${velocity}`}
      </div>
    );
  }
}

export default Carousel;
