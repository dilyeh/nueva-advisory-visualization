
export class VisualizationState {
    constructor() {
        // create the dots
        let dotList = [];
        for (let i=0; i<200; i++) {
            dotList.push(
                new Dot(
                    new Vector2(randInt(300), randInt(300))
                )
            );
        }
        this.dotList = dotList;
    }

    updateVisualization() {
        for (let idx=0; idx<this.dotList.length; idx++) {
            this.dotList[idx].updateTick(this.dotList);
            this.dotList[idx].moveTick(this.dotList);
        }
    }

    setNewTargetPositions(newTargetPosition1, newTargetPosition2) { // newTargetLocation is a vector2
        for (let idx=0; idx<this.dotList.length; idx++) {
            let randomBool = randInt(2);
            if (randomBool === 0) {
                this.dotList[idx].targetPosition = newTargetPosition1;
                this.dotList[idx].color = "#fce879";
            }
            else {
                this.dotList[idx].targetPosition = newTargetPosition2;
                this.dotList[idx].color = "#d781f9";
            }
        }
    }
}



export function Visualization({ visStateRef }) { // this generates a react component
    let circles = [];
    for (let idx=0; idx<visStateRef.current.dotList.length; idx++) {
        circles.push(
            <circle 
                r={ visStateRef.current.dotList[idx].radius }
                cx={ visStateRef.current.dotList[idx].position.X }
                cy={ visStateRef.current.dotList[idx].position.Y }
                fill={ visStateRef.current.dotList[idx].color }
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
    constructor(Position) { // position is a vector2
        this.position = Position;
        this.velocity = new Vector2(0,0);
        this.forces = new Vector2(0,0); // forces and accel are basically the same thing. there's no mass implementation here
        this.targetPosition = new Vector2(100,100);
        this.radius = 5;
        this.color = "#fce879";
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
