import React from 'react';
import './App.css';
import {Dot, Vector2, Visualization} from './helpers.js';


function App() { // im not very familiar with what best practices exist for js/react, so App() is just gonna be main()

  // generate the dots
  let visualizationDots = [];
  for (let i=0; i<5; i++) {
    visualizationDots.push(new Dot(new Vector2(i * 10, i * 10)));
  }

  return (
    <div className="App">
      <h1>Advisory Visualization</h1>
        <div class="visualization-container">
          this is a visualization visualization visualization visualization visualization visualization visualization visualization visualization 
          <Visualization visualizationDots={visualizationDots}/>
        </div>
    </div>
  );
}

export default App;
