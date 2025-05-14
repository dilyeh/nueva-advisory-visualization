
export class VisualizationState {
    constructor(data) {
        this.colorRule = "None";
        this.targetPositionRule = "None";
        this.centerPosition = 250 / 2;

        //                    least                                        most
        //this.colorPalette = VisualizationState.extractColorsFromCoolorsURL("https://coolors.co/palette/22577a-38a3a5-57cc99-80ed99-c7f9cc"); // cool, minty, kinda like a foggy forest at dusk
        //this.colorPalette = VisualizationState.extractColorsFromCoolorsURL("https://coolors.co/palette/264653-2a9d8f-e9c46a-f4a261-e76f51"); // warm rainbow (like sunset in an evergreen forest during the cretaceous period or smth)
        //this.colorPalette = VisualizationState.extractColorsFromCoolorsURL("https://coolors.co/palette/ffbe0b-fb5607-ff006e-8338ec-3a86ff"); // oversaturated sunset at the beach
        //this.colorPalette = VisualizationState.extractColorsFromCoolorsURL("https://coolors.co/palette/ef476f-ffd166-06d6a0-118ab2-073b4c"); // oversaturated rainbow
        //this.colorPalette = VisualizationState.extractColorsFromCoolorsURL("https://coolors.co/palette/386641-6a994e-a7c957-f2e8cf-bc4749"); // the hungry hungry caterpillar (i just think this one's funny)
        this.colorPalette = VisualizationState.extractColorsFromCoolorsURL("https://coolors.co/palette/3d348b-7678ed-f7b801-f18701-f35b04"); // literally a sunset over the ocean
        this.defaultColor = "#bababa";
        this.possibleTargetPositions = [50, 150, 250, 350, 450];
        this.orderMap = {
            "Frequency": ["3+ times a week", "Twice a week", "Once a week", "Once every other week", "Once a month"],
            "Grade": ["12", "11", "10", "9"],
            "Value": ["5", "4", "3", "2", "1"]
        }
        // create the dots
        let dotList = [];
        for (const entry of data) {
            dotList.push(
                new Dot(
                    new Vector2(randInt(250), randInt(550)), // init position
                    new Vector2(this.centerPosition, 550/2), // init target position. this is very cursed
                    entry // data
                )
            )
        }
        this.dotList = dotList;
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

    static extractColorsFromCoolorsURL(url) {
        // get just the parts with the colors
        let colorCode = url.replace("https://coolors.co/palette/", '');
        // extract colors (hyphen-separated)
        let colorPalette = ["#"];
        for (let char=0; char<colorCode.length; char++) {
            if (colorCode[char] === "-") {
                colorPalette.push("#");
            }
            else {
                colorPalette[colorPalette.length - 1] = colorPalette[colorPalette.length - 1] + colorCode[char]
            }
        }
        return (colorPalette);
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

export class Dot {
    constructor(Position, TargetPosition, Data) { // position is a vector2
        this.data = Data; // data looks like {"Grade": "xx", "Advisory": "xx", "Value": "xx", "Activities": [...], "Frequency": "xx"}
        this.position = Position;
        this.velocity = new Vector2(0,0);
        this.forces = new Vector2(0,0); // forces and accel are basically the same thing. there's no mass implementation here
        this.targetPosition = TargetPosition;
        this.radius = 5;
        this.colorIdx = 0;
        this.previousPosition = this.position;
        this.locked = false;
    }

    updateTick(dotList) {
        this.locked = false;
        this.getForces(dotList);
    }

    updateColor(visStateRef) {
        // find the idx of the state in the color map
        let colorRule = visStateRef.colorRule;
        if (visStateRef.colorRule === "None") {
            this.colorIdx = 0;
            return
        }
        let orderMap = visStateRef.orderMap[colorRule];
        this.colorIdx = 1; // TODO: so far, the only thing that could have a default value is frequency, so it works to be 2, but ideally we have something that keeps track of default values
        for (let idx=0; idx<orderMap.length; idx++) {
            if (this.data[colorRule] == orderMap[idx]) { // if when you go into the data and look at the value of the color rule, and it's the same as the orderMap at that idx, you've found your idx
                // i'll be the first to admit that this logic is a little disguisting
                this.colorIdx = idx;
            }
        }
    }

    updateTargetPosition(visStateRef) {
        // this is VERY similar to updateColor, but i'm not sure the best way to make this one method lol
        let targetPositionRule = visStateRef.targetPositionRule;
        if (targetPositionRule == "None") { // None case
            this.targetPosition = new Vector2(visStateRef.centerPosition, 550/2);
            console.log("this is firing");
            return;
        }
        let orderMap = visStateRef.orderMap[targetPositionRule];
        this.targetPosition = new Vector2(visStateRef.centerPosition, visStateRef.possibleTargetPositions[1]); // default value. TODO: because the only thing with a default value is frequency, this is ok, but not ideal
        for (let idx=0; idx<orderMap.length; idx++) {
            if (this.data[targetPositionRule] == orderMap[idx]) {
                // that idx is the color and/or position
                this.targetPosition = new Vector2(visStateRef.centerPosition, visStateRef.possibleTargetPositions[idx]);
            }
        }
    }

    moveTick(dotList) {
        this.updateVelocity();
        this.moveDot(this.velocity);
        this.getOutOfCollisions(dotList);
        this.locked = true;
    }
  
    getForces(dotList) { // dotList is, contrary to popular belief, a list of dots
        const attraction = 0.03;
        const selfForceField = 1.1;
        const othersForceField = 2;
        const otherDotSpringForce = -0.3;

        // find forces according to targetPosition
        let distanceFromTargetPosition = new Vector2(this.targetPosition.X - this.position.X, this.targetPosition.Y - this.position.Y);
        let targetVelocity = new Vector2(
            (Math.abs(distanceFromTargetPosition.X) * attraction) * Math.sign(distanceFromTargetPosition.X), 
            (Math.abs(distanceFromTargetPosition.Y) * attraction) * Math.sign(distanceFromTargetPosition.Y));
        this.forces.X = (targetVelocity.X - this.velocity.X);
        this.forces.Y = (targetVelocity.Y - this.velocity.Y);

        for (const dot of dotList) {
            // compute distance and angle, find the force magnitude, and adjust the x and y components according to magnitude and angle
            if (dot !== this) {
                let distanceFromDot = this.position.getDistance(dot.position);
                //let forceFieldToUse = (dot.targetPosition === this.targetPosition) ? selfForceField : othersForceField;
                let forceFieldToUse = 0;
                if (dot.targetPosition.X == this.targetPosition.X && dot.targetPosition.Y == this.targetPosition.Y) {
                    forceFieldToUse = selfForceField;
                }
                else {
                    forceFieldToUse = othersForceField;
                }

                if (distanceFromDot <= (this.radius + dot.radius) * forceFieldToUse) {
                    let angle = Math.atan2(dot.position.Y - this.position.Y, dot.position.X - this.position.X); // atan's range is (-pi/2) -> (pi/2)

                    //let forceMagnitude = -0.8 * 1.5 ** ((this.radius + dot.radius) - distanceFromDot);
                    let forceMagnitude = otherDotSpringForce * ((this.radius + dot.radius) * forceFieldToUse - distanceFromDot);
                    this.forces.X += Math.cos(angle) * forceMagnitude;
                    this.forces.Y += Math.sin(angle) * forceMagnitude;
                }
            }
        }

    }

    updateVelocity() {
        const dampening = 0.8;
        const maxAcceleration = 0.5;

        if (this.forces.magnitude() > maxAcceleration) {
            this.forces.X = Math.cos(this.forces.angle()) * maxAcceleration;
            this.forces.Y = Math.sin(this.forces.angle()) * maxAcceleration;
        }
        this.velocity.X += this.forces.X;
        this.velocity.Y += this.forces.Y;

        this.velocity.X *= dampening;
        this.velocity.Y *= dampening;
    }

    moveDot(velocity) {
        this.position.X += velocity.X;
        this.position.Y += velocity.Y;
    }


    getOutOfCollisions(dotList) { 
        for (const dot of dotList) {
            let distance = dot.position.getDistance(this.position);
            if (this !== dot) {
                if (distance < this.radius + dot.radius) {
                    // get angle
                    let angle = Math.atan2(dot.position.Y - this.position.Y, dot.position.X - this.position.X);
                    // get amount to displace
                    let displacementMagnitude = 0 - ((this.radius + dot.radius) - distance); // negative because propelling away
                    // get components
                    let displacement = new Vector2(Math.cos(angle) * displacementMagnitude, Math.sin(angle) * displacementMagnitude)
                    this.position.X += displacement.X;
                    this.position.Y += displacement.Y;
                }
            }
        }

        let isColliding = this.checkCollisions(dotList);
        if (isColliding) {
            this.previousPositionMoved = this.position;
            for (const dot of dotList) {
                let distance = dot.position.getDistance(this.position);
                // only look at the locked dots
                if (this !== dot && dot.locked) {
                    if (distance < this.radius + dot.radius) {
                        // get angle
                        let angle = Math.atan2(dot.position.Y - this.position.Y, dot.position.X - this.position.X);
                        // get amount to displace
                        let displacementMagnitude = 0 - ((this.radius + dot.radius) - distance); // negative because propelling away
                        // get components
                        let displacement = new Vector2(Math.cos(angle) * displacementMagnitude, Math.sin(angle) * displacementMagnitude)
                        this.position.X += displacement.X;
                        this.position.Y += displacement.Y;
                    }
                }
            }
        }
        isColliding = this.checkCollisions(dotList);
        if (isColliding) {
            this.position = this.previousPosition;
        }
        this.previousPosition = this.position;
    }

    checkCollisions(dotList) {
        for (const dot of dotList) {
            let distance = dot.position.getDistance(this.position)
            if (distance < this.radius + dot.radius) {
                return true;
            }
        }
        return false;
    }
}

export class Vector2 { // represents a 2d vector.
    constructor(X, Y) {
        this.X = X;
        this.Y = Y;
    }

    getDistance(anotherVector2) {
        return (Math.sqrt(
            ((this.X - anotherVector2.X) ** 2) + 
            ((this.Y - anotherVector2.Y) ** 2) 
        ));
    }
    magnitude() {
        return Math.sqrt(this.X ** 2 + this.Y ** 2);
    }
    angle() {
        return Math.atan2(this.Y, this.X);
    }
}

export function randInt(max) {
    return Math.floor(Math.random() * max);
}

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

function getDescription(state) {
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
