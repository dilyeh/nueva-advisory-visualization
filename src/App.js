import React, { useRef, useState, useEffect } from 'react';
import './App.css';
import {Visualization, VisualizationContainer} from './helpers.js';


function App() { // im not very familiar with what best practices exist for js/react, so App() is just gonna be main()
  // stuff to rerender stuff
  const visualizationRef = useRef(new VisualizationContainer()); // instantiate the vis
  const [tick, setTick] = useState(0); // used to trigger rerenders

  useEffect(() => { // this was chatgpted because i don't understand react hooks
    const interval = setInterval(() => {
      visualizationRef.current.updateVisualization(); // WHY DO I NEED THE KEYWORD CURRENT????
      setTick(prev => prev + 1); // what is this sorcery???
    }, 1000);

    return () => clearInterval(interval); // Clean up on unmount
  }, []);

  return ( // the getValue() thing is sketchy.....
    <div className="App">
      <h1>Advisory Visualization</h1>
        <div class="visualization-container">
          this is a visualization visualization visualization visualization visualization visualization visualization visualization visualization 
          <Visualization visualizationDots={visualizationRef.current}/>
        </div>
    </div>
  );
}

export default App;
