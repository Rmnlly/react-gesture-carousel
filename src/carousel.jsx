import React from "react";
import "./styles.css";

export default class Carousel extends React.Component {
  constructor(props) {
    super(props);

    this.draggableRef = React.createRef();

    this.state = {
      dragging: false,
      dragStartX: 0,
      dragStartTime: 0,
      carouselPosition: 0, //This can be a value between 0 - 360,
      change: 0,
      width: 0,
      velocity: 0
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
    this.setState(() => ({ dragStartX: clientX, dragging: true }));
    requestAnimationFrame(this.updatePosition);
  }

  onDragEnd() {
    if (this.state.dragging) {
      this.setState(() => ({ dragging: false, change: 0 }));
    }
  }

  updatePosition() {
    //When we start dragging updatePosition is called once, then it must keep
    //calling itself so we can continue to update the position of the current item,
    //thats why the following line is here, it will terminate when we mouseup and dragging becomes false
    if (this.state.dragging) requestAnimationFrame(this.updatePosition);

    const now = Date.now();
    const elapsed = now - this.state.dragStartTime;

    if (this.state.dragging && elapsed > 20) {
      console.log("carouselPos: ", this.state.carouselPosition);
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
      )
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
      )
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
    //current movement is something like +40 or -20 or whatever, depending on left or right movement
    // previouCarousel is something between 1 & 360, so we need to map changes to that, we may need to factor in the
    // component width when mapping the currentMovement to the carousel change
    const cappedMovement =
      currentMovement > 0
        ? Math.min(currentMovement, width)
        : Math.max(currentMovement, -width);
    const degreesMoved = (cappedMovement / width) * 360 + previousCarouselState; //may be -30 degrees or + 10 degrees? who knows
    //which percentage of the current div have we moved? and how many degrees is that for our 360 carousel
    //If mappedCarouselMovement + previousCarousel state is > 360, then we take the amount we go over by and instead add that to 0,
    //so we always have a number between 0 and 360. Same for < 0, if its -30 after the calculation, then we take that different and
    //subtract it from 360
    const currentCarouselDegrees =
      degreesMoved > 360
        ? degreesMoved - 360
        : degreesMoved < 0
        ? degreesMoved + 360
        : degreesMoved;

    return currentCarouselDegrees;
  }

  render() {
    const { change, carouselPosition } = this.state;

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
        {/* <Carousel360 imageNumber={carouselPosition} /> */}
        {carouselPosition}
      </div>
    );
  }
}
