import React from "react";
import ReactDOM from "react-dom";

import "./styles.css";
import CarouselHook from "./carousel-hook";

function App() {
  return (
    <div className="App">
      <CarouselHook />
    </div>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
