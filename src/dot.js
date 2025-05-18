import { Vector2, cloneWithPrototype } from "./niceLilTools"

export class Dot {
    constructor(Id, Position, Data) { // position is a vector2
        this.id = Id;
        this.data = Data; // data looks like {"Grade": "xx", "Advisory": "xx", "Value": "xx", "Activities": [...], "Frequency": "xx"}
        this.position = Position;
        this.velocity = new Vector2(0,0);
        this.forces = new Vector2(0,0); // forces and accel are basically the same thing. there's no mass implementation here
        this.targetPosition = new Vector2(0,0);
        this.radius = 5;
        this.colorIdx = 0;
        this.previousPosition = this.position;
        this.locked = false;
    }

    updateTick(dotList) {
        this.locked = false;
        this.getForces(dotList);
    }

    moveTick(dotList) {
        this.updateVelocity();
        this.moveDot(this.velocity);
        this.getOutOfCollisions(dotList);
        this.locked = true;
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
        if (targetPositionRule === "None") { // None case
            this.targetPosition = visStateRef.centerPosition;
            return;
        }
        let dataToCompare;
        if (targetPositionRule === "Activities") {
            dataToCompare = this.data["Activities"][this.data["ActivityNum"]]; // holy crap this is unreadable. i didn't realize my data structure decisions were that bad
            // basically, go into the activities array and index into the activity number stored elsewhere in the data object
            // TODO: this is a little unsafe because it assumes the dot has an activitynum, which it's not guaranteed, but it should only fire after it's gotten one?
        }
        else {
            dataToCompare = this.data[targetPositionRule];
        }
        

        let orderMap = visStateRef.orderMap[targetPositionRule];
        this.targetPosition = new Vector2(visStateRef.centerPosition.X, visStateRef.possibleTargetPositions[1]); // default value. TODO: because the only thing with a default value is frequency, this is ok, but not ideal
        for (let idx=0; idx<orderMap.length; idx++) {
            if (dataToCompare == orderMap[idx]) {
                this.targetPosition = new Vector2(visStateRef.centerPosition.X, visStateRef.possibleTargetPositions[idx]);
            }
        }
    }
  
    getForces(dotList) { // dotList is, contrary to popular belief, a list of dots
        const attraction = 0.06;
        const selfForceField = 1.1;
        const othersForceField = 2;
        const otherDotSpringForce = -0.6;

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
        const maxAcceleration = 0.65;

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

    repelFrom(position) {
        let distance = this.position.getDistance(position);
        const range = 100;
        const power = 0.2;
        if (distance < range) {
            let angle = Math.atan2(position.Y - this.position.Y, position.X - this.position.X); // i copy+pasted this from the getforces code lol
            this.velocity.X -= Math.cos(angle) * (range - distance) * power;
            this.velocity.Y -= Math.sin(angle) * (range - distance) * power;
        }
    }

    clone() {
        const clone = cloneWithPrototype(this);
        clone.position = this.position.copy();
        clone.velocity = this.velocity.copy();
        clone.forces = this.forces.copy();
        clone.targetPosition = this.targetPosition.copy();
        clone.previousPosition = this.previousPosition.copy();

        clone.data = JSON.parse(JSON.stringify(this.data));
        return (clone);
    }
}