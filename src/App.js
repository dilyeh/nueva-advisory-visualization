import React, { useRef, useState, useEffect } from 'react';
import './App.css';
import { Visualization, VisualizationState, VisualizationLabels, ColorKey, Descriptions, Control, ClickBox } from './helpers.js';
import data from './clean_data.json'; // automatically parsed


function App() { // im not very familiar with what best practices exist for js/react, so App() is just gonna be main()
  // stuff to rerender stuff
  const visStateRef = useRef(new VisualizationState(data));
  const [update, setUpdate] = useState(0);

  const forceUpdate = (value) => {
    setUpdate(value)
  }
  
  return ( // VisualizationRerenderer rerenders everything in the the dot visualization. Control is responsible for triggering rerenders
    <div id="content">
      <div className="App">
        <h1 id="title">Student Opinion on Advisory</h1>
        <div id="visualization-container">
          <Control visStateRef={visStateRef} forceUpdate={forceUpdate}/>
          <ColorKey visStateRef={visStateRef} />
          <Descriptions visStateRef={visStateRef} />
          <VisualizationLabels visStateRef={visStateRef} />
          <VisualizationRerenderer visStateRef={visStateRef} />
          <ClickBox visStateRef={visStateRef} />
        </div>
      </div>
    </div>
  );
}

function VisualizationRerenderer ({ visStateRef }) {
  const [tick, setTick] = useState(0); // used to trigger rerenders
  useEffect(() => { // this was chatgpted because i don't understand react hooks
    const interval = setInterval(() => {
      // put update logic here
      visStateRef.current.updateVisualization();

      setTick(prev => {
        return prev + 1;
      }); // what is this sorcery???
    }, 10);

    return () => clearInterval(interval); // Clean up on unmount
  }, []);

  return (
    <Visualization visStateRef={visStateRef} />
  );
}

export default App;
