
export class VisualizationState {
    constructor(data) {
        this.colorRule = "None";
        this.targetPositionRule = "None";
        // create the dots
        let dotList = [];
        for (const entry of data) {
            dotList.push(
                new Dot(
                    new Vector2(randInt(600), randInt(700)), // init position
                    new Vector2(300, 350), // init target position
                    entry // data
                )
            )
        }
        //console.log("ndots: " + ndots);
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
            this.dotList[idx].updateColor(newColorRule);
            this.dotList[idx].updateTargetPosition(newTargetPositionRule);
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
                fill= { dotList[idx].possibleColors[dotList[idx].colorIdx] }
             />
        );
    }

    return (
        <svg id="visualization">
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
        this.possibleColors = ["#22577a", "#38a3a5", "#57cc99", "#80ed99", "#c7f9cc"];
        this.previousPosition = this.position;
        this.locked = false;
    }

    updateTick(dotList) {
        this.locked = false;
        this.getForces(dotList);
    }

    updateColor(visStateColor) {
        switch (visStateColor) { // this is terrible, it's a bunch of nested switch statements
            case "Grade":
                let grade = Number(this.data["Grade"]);
                this.colorIdx = grade - 9;
                break;
            case "Value":
                let value = Number(this.data["Value"]);
                this.colorIdx = value - 1;
                break;

            case "Frequency":
                let mappingThing = ["3+ times a week", "Twice a week", "Once a week", "Once every other week", "Once a month"];
                this.colorIdx = 1; // default to as it is now (twice a week) if other (because idk how to clean that up easily) TODO: actually do something about this
                for (let idx=0; idx<mappingThing.length; idx++) {
                    if (this.data["Frequency"] == mappingThing[idx]) {
                        this.colorIdx = idx;
                        break;
                    }
                }
                break;
            case "None":
                this.colorIdx = 0;
                break;
            default:
                break;
        }
    }

    updateTargetPosition(visStatePosition) {
        let notFound = false;
        let yPositions = [500, 400, 300, 200, 100]
        switch (visStatePosition) {
            case "Grade":
                let grade = Number(this.data["Grade"]);
                this.targetPosition = new Vector2(300, yPositions[grade - 9]); // 300 is the center width. the 3- is to reverse it because there's 4 grades and a zero index. we wanna reverse it because y=0 is at the top
                break;
            case "Value":
                let value = Number(this.data["Value"]);
                this.targetPosition = new Vector2(300, yPositions[value - 1]);
                break;
            case "Frequency":
                let mappingThing = ["Once a month", "Once every other week", "Once a week", "Twice a week", "3+ times a week"];
                this.targetPosition = new Vector2(300, yPositions[3]); // default to as it is now (twice a week) if other (because idk how to clean that up easily) TODO: actually do something about this
                for (let idx=0; idx<mappingThing.length; idx++) {
                    if (this.data["Frequency"] == mappingThing[idx]) {
                        this.targetPosition = new Vector2(300, yPositions[idx]);
                        break;
                    }
                }
                break;
            case "None":
                this.targetPosition = new Vector2 (300, 350);
                notFound = true; // TODO: this is very cursed, but i don't wanna multiply
                break;
            default:
                break;
        }
    }


    moveTick(dotList) {
        this.updateVelocity();
        this.moveDot(this.velocity);
        this.getOutOfCollisions(dotList);
        this.locked = true;
    }
  
    getForces(dotList) { // dotList is, contrary to popular belief, a list of dots
        const attraction = 0.02;
        const dampening = 0.8;
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
        let previousPositionMoved = this.position;
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