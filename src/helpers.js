import { Dot } from "./dot.js";
import { Vector2, randInt, extractColors } from "./niceLilTools.js";
// i know it's bad to have a "helpers.js" file, but this is where all the components are stored, and i'm too lazy to rename it (but not too lazy to write this comment lol)

// ==============================
// == THE ACTUAL VISUALIZATION ==
// ==============================
export class VisualizationState {
    constructor(data) {
        this.colorRule = "None";
        this.targetPositionRule = "None";
        this.centerPosition = 250 / 2;

        //                    least                                        most
        //let.url = "https://coolors.co/palette/22577a-38a3a5-57cc99-80ed99-c7f9cc"; // cool, minty, kinda like a foggy forest at dusk
        //let.url = "https://coolors.co/palette/264653-2a9d8f-e9c46a-f4a261-e76f51"; // warm rainbow (like sunset in an evergreen forest during the cretaceous period or smth)
        //let url = "https://coolors.co/palette/ffbe0b-fb5607-ff006e-8338ec-3a86ff"; // oversaturated sunset at the beach
        //let url = "https://coolors.co/palette/ef476f-ffd166-06d6a0-118ab2-073b4c"; // oversaturated rainbow
        //let url = "https://coolors.co/palette/386641-6a994e-a7c957-f2e8cf-bc4749"; // the hungry hungry caterpillar (i just think this one's funny)
        let url = "https://coolors.co/palette/3d348b-7678ed-f7b801-f18701-f35b04" // literally a sunset over the ocean
        this.colorPalette = extractColors(url);
        this.defaultColor = "#bababa";
        this.possibleTargetPositions = [50, 150, 250, 350, 450];
        this.orderMap = {
            "Frequency": ["3+ times a week", "Twice a week", "Once a week", "Once every other week", "Once a month"],
            "Grade": ["12", "11", "10", "9"],
            "Value": ["5", "4", "3", "2", "1"]
        }
        // create the dots
        this.dotList = [];
        for (const entry of data) {
            this.dotList.push(
                new Dot(
                    new Vector2(randInt(250), randInt(550)), // init position
                    entry // data
                )
            )
        }
        // initialize the dots with actual values
        this.setNewState(this.colorRule, this.targetPositionRule);
    }

    updateVisualization() {
        for (let idx=0; idx<this.dotList.length; idx++) {
            this.dotList[idx].updateTick(this.dotList);
            this.dotList[idx].moveTick(this.dotList);
        }
    }
    
    setNewState(newColorRule, newTargetPositionRule) { // "Grade", "Value", or "Frequency"
        for (let idx=0; idx<this.dotList.length; idx++) {
            this.colorRule = newColorRule;
            this.targetPositionRule= newTargetPositionRule;
            this.dotList[idx].updateColor(this);
            this.dotList[idx].updateTargetPosition(this);
        }
    }

}

export function Visualization({ visStateRef }) { // this generates a react component
    let circles = [];
    let dotList = visStateRef.current.dotList;
    for (let idx=0; idx<dotList.length; idx++) {
        circles.push(
            <circle 
                r={ dotList[idx].radius }
                cx={ dotList[idx].position.X }
                cy={ dotList[idx].position.Y }
                fill= { (visStateRef.current.colorRule === "None") ? visStateRef.current.defaultColor : visStateRef.current.colorPalette[dotList[idx].colorIdx] }
             />
        );
    }

    let targetPositionRule = visStateRef.current.targetPositionRule;
    let lines = [];
    if (targetPositionRule !== "None") {
        let possibleTargetPositions = visStateRef.current.possibleTargetPositions;
        let orderMap = visStateRef.current.orderMap[targetPositionRule];
        for (let idx=0; idx<orderMap.length; idx++) {
            lines.push(
                <line 
                    x1="0"
                    y1={ possibleTargetPositions[idx] } 
                    x2="500"
                    y2={ possibleTargetPositions[idx] } 
                    stroke="#e0e0e0"
                    strokeWidth="2"
                />
            )
        }
    }

    return (
        <svg id="visualization">
            { lines }
            { circles }
        </svg>
    );
}

// ====================
// == CONTROL SYSTEM ==
// ====================
export function Control({ visStateRef }) { // ({ ... }) declare "props", which are just arguments into a react component
  const handleColorChange = (event) => {
    visStateRef.current.setNewState(event.target.value, visStateRef.current.targetPositionRule);
  };
  const handlePositionChange = (event) => {
    visStateRef.current.targetPositionRule = event.target.value;
    visStateRef.current.setNewState(visStateRef.current.colorRule, event.target.value);
  };

  return (
    <div id="menu">
      <div className="control">
        <div>Color</div>
        <select onChange={ handleColorChange }>
          <option value="None">None</option>
          <option value="Grade">Grade</option>
          <option value="Value">Value</option>
          <option value="Frequency">Frequency</option>
        </select>
      </div>
      <div className="control">
        <div>Position</div>
        <select onChange={ handlePositionChange }>
          <option value="None">None</option>
          <option value="Grade">Grade</option>
          <option value="Value">Value</option>
          <option value="Frequency">Frequency</option>
        </select>
      </div>
    </div>
  );
}

// ====================
// == VARIOUS LABELS ==
// ====================
export function VisualizationLabels({ visStateRef }) {
    let targetPositionRule = visStateRef.current.targetPositionRule;
    let labels = [];
    switch (targetPositionRule) {
        case "Grade":
            labels = ["12th", "11th", "10th", "9th"];
            break;
        case "Value":
            labels = ["5", "4", "3", "2", "1"];
            break;
        case "Frequency":
            labels = ["3+ times a week", "2 times a week", "Once a week", "Once every other week", "Once a month"];
            break;
        default:
            break;
    }
    let htmlToReturn = [];
    for (const label of labels) {
        htmlToReturn.push(
            <div class="label">{ label }</div>
        );
    }

    return(
        <div id="visualization-label-container">
            { htmlToReturn }
        </div>
    );
}

export function ColorKey({ visStateRef }) {
    let colorRule = visStateRef.current.colorRule;
    if (colorRule == "None") { // none case
        return (<div id="color-key">No color selected</div>)
    }

    let orderMap = visStateRef.current.orderMap[colorRule];
    let colorPalette = visStateRef.current.colorPalette;
    let htmlToReturn = [];
    for (let idx=0; idx<orderMap.length; idx++) {
        htmlToReturn.push(
            <div class="color-key-item">
                <svg class="color-key-dot">
                    <circle cx="5" cy="5" r="5" fill={ colorPalette[idx] }/>
                </svg>
                <div>{ orderMap[idx] }</div>
            </div>
        )
    }

    return (
        <div id="color-key">
            { htmlToReturn }
        </div>
    )
}

export function Descriptions({ visStateRef }){
    let colorRule = visStateRef.current.colorRule;
    let targetPositionRule = visStateRef.current.targetPositionRule;
    let colorDescription = getDescription(colorRule);
    let targetPositionDescription = getDescription(targetPositionRule);
    
    return (
        <div id="description-container">
            <div class="description">
                <strong>Color: </strong> { colorDescription }
            </div>
            <div class="description">
                <strong>Position: </strong> {targetPositionDescription}
            </div>
        </div>
    )
}

function getDescription(state) { // this is where all the descriptions are stored
    switch (state) {
        case "Grade":
            return (
                "The grades of students we surveyed."
            );
        case "Value":
            return (
                "Students' percieved value of advisory. 1 = Useless, 5 = Very Valuable."
            );
        case "Frequency":
            return (
                "How often students we surveyed wished advisory met."
            );
        case "None":
            return(
                "None"
            );
        default:
            return ("");
    }
}