import React, { useRef, useState, useEffect } from 'react';
import './App.css';
import { Visualization, VisualizationState, Vector2, VisualizationLabels } from './helpers.js';
import data from './clean_data.json'; // automatically parsed


function App() { // im not very familiar with what best practices exist for js/react, so App() is just gonna be main()
  // stuff to rerender stuff
  const [tick, setTick] = useState(0); // used to trigger rerenders
  const visStateRef = useRef(new VisualizationState(data));

  useEffect(() => { // this was chatgpted because i don't understand react hooks
    const interval = setInterval(() => {
      // put update logic here
      visStateRef.current.updateVisualization();
      setTick(prev => {

        let updatedTick = prev + 1; // the way js closures work (or something) is that, when outside of the scope of setTick, the state of tick when it was first declared is stored or something, idrk
        if (updatedTick % 500 === 0) {
          //visStateRef.current.setNewTargetPositions(new Vector2(250, 50), new Vector2(250, 500));
          //visStateRef.current.setNewState("Grade", "Value");
        }


        return prev + 1;
      }); // what is this sorcery???
    }, 10);

    return () => clearInterval(interval); // Clean up on unmount
  }, []);

  return (
    <div className="App">
      <h1>Advisory Visualization</h1>
        <div id="visualization-container">
          <Control tick={tick} visStateRef={visStateRef}/>
          <VisualizationLabels visStateRef={visStateRef} />
          <Visualization tick={tick} visStateRef={visStateRef}/>
        </div>
    </div>
  );
}

function Control({ tick, visStateRef }) { // ({ ... }) declare "props", which are just arguments into a react component
  const [selectedOption, setSelectedOption] = useState('');
  const handleColorChange = (event) => {
    visStateRef.current.setNewState(event.target.value, visStateRef.current.targetPositionRule);
  };
  const handlePositionChange = (event) => {
    visStateRef.current.targetPositionRule = event.target.value;
    visStateRef.current.setNewState(visStateRef.current.colorRule, event.target.value);
  };

  return (
    <div id="menu">
      <div class="control">
        <div>Color</div>
        <select onChange={ handleColorChange }>
          <option value="None">Choose an option!</option>
          <option value="Grade">Grade</option>
          <option value="Value">Value</option>
          <option value="Frequency">Frequency</option>
        </select>
      </div>
      <div class="control">
        <div>Position</div>
        <select onChange={ handlePositionChange }>
          <option value="None">Choose an option!</option>
          <option value="Grade">Grade</option>
          <option value="Value">Value</option>
          <option value="Frequency">Frequency</option>
        </select>
      </div>
    </div>
  );
}

export default App;
