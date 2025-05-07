import React, { useRef, useState, useEffect } from 'react';
import './App.css';
import { Visualization, VisualizationState } from './helpers.js';


function App() { // im not very familiar with what best practices exist for js/react, so App() is just gonna be main()
  // stuff to rerender stuff
  const [tick, setTick] = useState(0); // used to trigger rerenders
  const visStateRef = useRef(new VisualizationState());

  useEffect(() => { // this was chatgpted because i don't understand react hooks
    const interval = setInterval(() => {
      // put update logic here
      visStateRef.current.updateVisualization();
      setTick(prev => prev + 1); // what is this sorcery???
    }, 33);

    return () => clearInterval(interval); // Clean up on unmount
  }, []);

  return (
    <div className="App">
      <h1>Advisory Visualization</h1>
        <div class="visualization-container">
          this is a visualization visualization visualization visualization visualization visualization visualization visualization visualization 
          <TestComponent number={tick}/>
          <Visualization tick={tick} visStateRef={visStateRef}/>
        </div>
    </div>
  );
}

function TestComponent({ number }) { // ({ ... }) declare "props", which are just arguments into a react component
  return (
    <div id="test">
      <div>this is a test component</div>
      <div>tick: { number }</div>
    </div>
  );
}

export default App;
