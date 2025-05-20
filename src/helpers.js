import { Dot } from "./dot.js";
import { Vector2, randInt, extractColors, average } from "./niceLilTools.js";
import React, { useRef } from 'react';
// i know it's bad to have a "helpers.js" file, but this is where all the components are stored, and i'm too lazy to rename it (but not too lazy to write this comment lol)

// ==============================
// == THE ACTUAL VISUALIZATION ==
// ==============================
export class VisualizationState {
    constructor(data) {
        this.data = data;
        this.colorRule = "None";
        this.targetPositionRule = "None";
        this.centerPosition = new Vector2(250/2, 550/2);

        //let url = "https://coolors.co/palette/22577a-38a3a5-57cc99-80ed99-c7f9cc"; // cool, minty, kinda like a foggy forest at dusk
        //let url = "https://coolors.co/palette/264653-2a9d8f-e9c46a-f4a261-e76f51"; // warm rainbow (like sunset in an evergreen forest during the cretaceous period or smth)
        //let url = "https://coolors.co/palette/ffbe0b-fb5607-ff006e-8338ec-3a86ff"; // oversaturated sunset at the beach
        //let url = "https://coolors.co/palette/ef476f-ffd166-06d6a0-118ab2-073b4c"; // oversaturated rainbow
        //let url = "https://coolors.co/palette/386641-6a994e-a7c957-f2e8cf-bc4749"; // the hungry hungry caterpillar (i just think this one's funny)
        let url = "https://coolors.co/palette/3d348b-7678ed-f7b801-f18701-f35b04" // literally a sunset over the ocean
        this.colorPalette = extractColors(url, true);
        this.defaultColor = "#bababa";
        this.possibleTargetPositions = [50, 150, 250, 350, 450, 550, 650, 750];
        this.orderMap = {
            "Frequency": ["3+ times a week", "Twice a week", "Once a week", "Once every other week", "Once a month"],
            "Grade": ["12", "11", "10", "9"],
            "Value": ["5", "4", "3", "2", "1"],
            "Activities": ["one on ones", "advisory discussions", "announcements", "games", "work periods", "cross-advisory activities", "off-campus trips", "none"]
        }
        // create the dots
        this.dotList = [];
        //for (const entry of data) {
        for (let idx=0; idx<data.length; idx++) {
            this.dotList.push(
                new Dot(
                    idx, // id
                    new Vector2(randInt(250), randInt(550)), // init position
                    data[idx] // data
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
        // handle activities case
        if (newTargetPositionRule === "Activities" && this.targetPositionRule !== "Activities") {
            this.mitosisizeDots();
        }
        else if (newTargetPositionRule !== "Activities" && this.targetPositionRule === "Activities") {
            // apoptosisize the dots
            this.apoptosisizeDots();
        }

        this.colorRule = newColorRule;
        this.targetPositionRule= newTargetPositionRule;
        for (let idx=0; idx<this.dotList.length; idx++) {
            this.dotList[idx].updateColor(this);
            this.dotList[idx].updateTargetPosition(this);
        }
    }

    mitosisizeDots() {
        let newDotList = [];
        for (const dot of this.dotList) {
            // create new dots based on each dot's activity. copy all of its state and all
            for (let idx=0; idx<dot.data["Activities"].length; idx++) {
                let newDot = dot.clone();
                // add an activity number to the dots
                // so the dot should have the id number and the activity number
                newDot.data["ActivityNum"] = idx;
                newDotList.push(newDot);
            }
        }
        this.dotList = newDotList;
    }

    apoptosisizeDots() {
        let newDotList = [];
        let dotAttendance = [];
        for (let idx=0; idx<this.data.length; idx++) {
            dotAttendance.push(false); // dotAttendance is a list of all the dots that have(n't) been accounted for
        }
        for (const dot of this.dotList) {
            if (dot.data["ActivityNum"] == 0) {
                // clone the dot
                let newDot = dot.clone();
                // get rid of the activity num
                delete newDot.data["ActivityNum"];
                newDotList.push(newDot);
                dotAttendance[newDot.id] = true;
            }
        }
        // check for dots that aren't represented
        for (let idx=0; idx<dotAttendance.length; idx++) {
            if (!dotAttendance[idx]) {
                newDotList.push( // this was 
                    new Dot(
                        idx,
                        new Vector2(randInt(250), randInt(550)),
                        this.data[idx]
                    )
                )
            }
        }

        this.dotList = newDotList;
    }


    explodeDots(clickPosition) {
        for (const dot of this.dotList) {
            dot.repelFrom(clickPosition);
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
export function Control({ visStateRef, forceUpdate, tutorialRun, runClickTutorial }) { // ({ ... }) declare "props", which are just arguments into a react component
  const handleColorChange = (event) => {
    visStateRef.current.setNewState(event.target.value, visStateRef.current.targetPositionRule);
    // update entire vis
    forceUpdate(prev => prev + 1);
  };
  const handlePositionChange = (event) => { // it's a bit cursed to be handling this here, but that's just kinda what we're doing because i can't think of a better option off the top of my head
    visStateRef.current.setNewState(visStateRef.current.colorRule, event.target.value);
    if (event.target.value === "Activities" && !tutorialRun) {
        runClickTutorial(); // run the click tutorial
    }
    // update entire vis
    forceUpdate(prev => prev + 1);
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
          <option value="Activities">Activities</option>
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
        case "Activities":
            labels = ["one on ones", "advisory discussions", "announcements", "games", "work periods", "cross-advisory activities", "off-campus trips", "none"];
            break;
        default:
            break;
    }

    let meanLabels = numericalLabels(visStateRef);

    let htmlToReturn = [];
    if (meanLabels) { // this if else statement is a bit tacky, but oh well
        for (let idx=0; idx<labels.length; idx++) {
            htmlToReturn.push(
                <div className="label">
                    <div>{ labels[idx] }</div>
                    { meanLabels[idx] }
                </div>
            );
        }
    }
    else {
        for (let idx=0; idx<labels.length; idx++) {
            htmlToReturn.push(
                <div className="label">
                    <div>{ labels[idx] }</div>
                    <div className="numerical-label"></div>
                </div>
            );
        }

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
        return (
            <div id="color-key">
                <div>No color selected</div>
            </div>)
    }

    let orderMap = visStateRef.current.orderMap[colorRule];
    let colorPalette = visStateRef.current.colorPalette;
    let htmlToReturn = [];
    for (let idx=0; idx<orderMap.length; idx++) {
        htmlToReturn.push(
            <div className="color-key-item">
                <svg className="color-key-dot">
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
            <div className="description">
                <strong>Color: </strong> { colorDescription }
            </div>
            <div className="description">
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
            return (
                "None"
            );
        case "Activities":
            return (
                "Activities students reported doing in advisory in the past month."
            );
        default:
            return ("");
    }
}

export function ClickBox({ visStateRef, deactivateTutorial }) {
    const boxRef = useRef(null);
    const handleClick = (event) => {
        const rect = boxRef.current.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        console.log("X: " + x + "    Y: " + y);
        visStateRef.current.explodeDots(new Vector2(x, y));
        deactivateTutorial(); // basically, if you click, don't run the tutorial. we love spaghetti code
    }
    return (
        <div 
            id="click-box"
            ref={boxRef} 
            onClick={ handleClick }
        ></div>)
}

function numericalLabels(visStateRef) {
    let colorRule = visStateRef.current.colorRule;
    let positionRule = visStateRef.current.targetPositionRule;
    if (positionRule === "None") { // none case
        return;
    }

    let orderMap = visStateRef.current.orderMap;
    // initialize dotsByPos
    let dotsByPos = []; // [[dotAtPos1, dotAtPos1...], [dotAtPos2, dotAtPos2...]...]
    for (let idx=0; idx<orderMap[positionRule].length; idx++) { 
        dotsByPos.push([]);
    }

    // sort dots by target position
    for (const dot of visStateRef.current.dotList) {
        // get the data according to positionRule
        let positionData;
        if (positionRule === "Activities") {
            positionData = dot.data["Activities"][dot.data["ActivityNum"]] // TODO: test this
        }
        else {
            positionData = dot.data[positionRule];
        }
        // find the idx of the dot's data for the rule (this gives us the idx in possibleTargetPositions, so it should accomplish what we want while being a little more robust if we ever wanna change how targetPosition works)
        let targetPosIdx;
        for (let idx=0; idx<orderMap[positionRule].length; idx++) {
            if (orderMap[positionRule][idx] === positionData) {
                targetPosIdx = idx;
                break;
            }
        }
        // put that dot into the dotsByPos array
        if (targetPosIdx != undefined) {
            dotsByPos[targetPosIdx].push(dot);
        }
    }

    // if there's no color, but there is position, just return the dot number
    if (colorRule === "None") {
        let labels = [];
        for (let idx=0; idx<dotsByPos.length; idx++) {
            labels.push(
                <div className="numerical-label">
                    <div>{dotsByPos[idx].length} students</div>
                </div>
            )
        }
        return (labels);
    }

    // initializie valuesByPos
    let valuesByPos = [] // [[value1, value2...], [value1, value2...]...]
    for (let idx=0; idx<dotsByPos.length; idx++) {
        valuesByPos.push([]);
    }
    // get the dots' values based on their colors
    for (let pos=0; pos<dotsByPos.length; pos++) {
        // for each dot in dotsByPos[pos]
        for (const dot of dotsByPos[pos]) {
            // add the value according to colorRule to valuesByPos
            let value;
            switch (colorRule) {
                case "Grade":
                    value = Number(dot.data["Grade"]);
                    break;
                case "Value":
                    value = Number(dot.data["Value"]);
                    break;
                case "Frequency":
                    //"Frequency": ["3+ times a week", "Twice a week", "Once a week", "Once every other week", "Once a month"] // TODO: this is VERY bad, but idk i'm not gonna be working on this code in a few days
                    const map = {"3+ times a week": 12, "Twice a week": 8, "Once a week": 4, "Once every other week": 2, "Once a month": 1};
                    value = map[dot.data["Frequency"]]
                    break;
                default:
                    break;
            }
            if (value) {
                valuesByPos[pos].push(value);
            }
        }
    }

    // average the dots' values by target position
    let averagesByPos = [] // [average1, average2...]
    for (let idx=0; idx<valuesByPos.length; idx++) {
        averagesByPos.push(
            Math.round(average(valuesByPos[idx]) * 100) / 100 // average and round too the nearest 0.01
        );
    }
    console.log(averagesByPos);

    // return a component with labels
    let labels = [];
    let units = "";
    if (colorRule === "Frequency") {
        units = " times/month";
    }
    for (let idx=0; idx<averagesByPos.length; idx++) {
        labels.push(
            <div className="numerical-label">
                <div>{dotsByPos[idx].length} students</div>
                <div>Mean {colorRule}: { averagesByPos[idx] }{ units }</div>
            </div>
        )
    }

    return (labels);
}

export function Info({ active, deactivate }) { // active is a bool

    if (active) {
        return (
            <div class="shadow">
                <div id="info-container">
                    <button id="deactivate-info-button" onClick={deactivate}>X</button>
                    <div id="info">
                        <h2>How to Use this Visualization</h2>
                        <p>
                            Each dot in this visualization represents a student who filled out <a href="https://docs.google.com/forms/d/e/1FAIpQLSePUIkm_BPBJw4oWZU8IpMjAwOee7EDeX3oESQQVgO8HU2BDg/viewform?usp=dialog">this survey</a>
                            . To start playing around with this, try changing the Color and Position dropdown menus! 
                            Also, if dots look like they're getting stuck, try clicking on the them a couple of times!
                        </p>
                        <h2>Biases and Limitations</h2>
                        <p>
                            <strong>Grade: </strong>
                            Most responses to our form came from underclassmen (To see this most clearly, 
                            go to the Position menu and select "Grade"). Because of this, the data may be skewed towards
                            the opinions of underclassmen.
                        </p>
                        <p>
                            <strong>Value: </strong>
                            Value was measured with a Likert scale (scale from 1 to 5) where 1 was "Useless" and 5 was "Very Valuable".
                        </p>
                        <p>
                            <strong>Frequency: </strong>
                            Frequency was an optional question, so a few respondents didn't fill it out. The labels showing student-count 
                            and mean account for this, ignoring those students when calculating those values. However, the dots representing
                            students who didn't report a preferred frequency default to going towards the "Twice a week" clump, so the 
                            student-count may not exactly match up with the number of dots in a clump. Additionally, when calculating mean 
                            preferred frequency, "Once a month" was counted as 1 meetings per month, "Once every other week" was counted as 2 
                            meetings per month, "Once a week" was counted as 4 meetings per month, "Twice a week" was counted as 8 meetings per 
                            month, and "3+ times a month" was counted as 12 meetings per month.
                        </p>
                        <p>
                            <strong>Activities: </strong>
                            Activites shows the activities that students reported doing in advisory in the past month before filling out our
                            form. Because of this, respondents could report more than one option, which is why the dots duplicate when the
                            "Activities" option is selected. Additionally, some students selected an "other" option, but these responses are
                            not represented in this visualization.
                        </p>
                        <h3>Activity Descriptions</h3>
                        <table>
                            <tr>
                                <th>Activity</th>
                                <th>Description</th>
                            </tr>
                            <tr>
                                <td>One on ones</td>
                                <td>One-on-one check-ins with advisors</td>
                            </tr>
                            <tr>
                                <td>Advisory discussions</td>
                                <td>Whole-advisory discussions</td>
                            </tr>
                            <tr>
                                <td>Announcements</td>
                                <td>Announcements from advisors. This includes things like trips meetings and explaining the course catalog</td>
                            </tr>
                            <tr>
                                <td>Games</td>
                                <td>Games played in advisory (such as card games, scatagories, semantle, etc.)</td>
                            </tr>
                            <tr>
                                <td>Work periods</td>
                                <td>Free time and work periods</td>
                            </tr>
                            <tr>
                                <td>Cross-advisory activities</td>
                                <td>Activities with more than one advisory</td>
                            </tr>
                            <tr>
                                <td>Off-campus trips</td>
                                <td>Off-campus trips (to places such as Bay Meadows Park, Hillsdale Mall, Blue Bottle, etc.)</td>
                            </tr>
                            <tr>
                                <td>None</td>
                                <td>None of the above</td>
                            </tr>
                        </table>
                    </div>
                </div>
            </div>
        );
    }

    return;
}

export function InfoButton({ activate }) {
    return (
        <button id="info-button" onClick={activate}>Info</button>
    )
}

export function ClickTutorial({ active }) {
    if (active) {
        return (
            <div id="click-tutorial">
                Hey! If it looks like the dots are getting stuck, try clicking on them!
            </div>
        );
    }
    return;
}