
export class VisualizationState {
    constructor() {
        // create the dots
        let dotList = [];
        for (let i=0; i<20; i++) {
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
            this.dotList[idx].tick(this.dotList);
        }
    }

    setNewTargetPositions(newTargetPosition1, newTargetPosition2) { // newTargetLocation is a vector2
        for (let idx=0; idx<this.dotList.length; idx++) {
            let randomBool = randInt(2);
            if (randomBool == 0) {
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
                r="10"
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
        this.radius = 10;
        this.color = "#fce879";
    }

    tick(dotList) {
        this.getForces(dotList);
        this.updateVelocity();
        this.moveDot(this.velocity);
    }
  
    getForces(dotList) { // dotList is, contrary to popular belief, a list of dots
        // find forces according to targetPosition
        let distanceFromTargetPosition = new Vector2(this.targetPosition.X - this.position.X, this.targetPosition.Y - this.position.Y);
        let targetVelocity = new Vector2(distanceFromTargetPosition.X * 0.03, distanceFromTargetPosition.Y * 0.03);
        this.forces.X = targetVelocity.X - this.velocity.X;
        this.forces.Y = targetVelocity.Y - this.velocity.Y;

        for (const dot of dotList) {
            // wait, this is bad. force should be proportional to the dot's distance (x and y), not just the x or y components
            // it'll be easier to compute distance and angle, find the force magnitude, and adjust the x and y components according to magnitude and angle
            if (dot !== this) {
                let distanceFromDot = this.position.getDistance(dot.position);

                if (distanceFromDot <= (this.radius + dot.radius)) {
                    let angle = Math.atan((dot.position.Y - this.position.Y) / (dot.position.X - this.position.X)); // atan's range is (-pi/2) -> (pi/2)
                    if (this.position.X > dot.position.X) { // i think this gives us a full 360 degrees
                        angle += Math.PI;
                    }

                    let forceMagnitude = -0.85 * ((this.radius + dot.radius) - distanceFromDot);
                    this.forces.X += Math.cos(angle) * forceMagnitude;
                    this.forces.Y += Math.sin(angle) * forceMagnitude;
                }
                
                // if the abs(distanceFromDot <= 50), then take 50-abs(distanceFromDot), multiply it by the sign, and add it to forces. else, add nothing
                //this.forces.X += (Math.abs(distanceFromDot.X) <= 10) ? (-0.15 * Math.sign(distanceFromDot.X) * (10 - Math.abs(distanceFromDot.X))) : 0;
                //this.forces.Y += (Math.abs(distanceFromDot.Y) <= 10) ? (-0.15 * Math.sign(distanceFromDot.Y) * (10 - Math.abs(distanceFromDot.Y))) : 0;
            }
        }
    }
    updateVelocity() {
        this.velocity.X += this.forces.X;
        this.velocity.Y += this.forces.Y;
    }

    moveDot(velocity) {
        this.position.X += velocity.X;
        this.position.Y += velocity.Y;
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
        ))
    }
}

export function randInt(max) {
    return Math.floor(Math.random() * max);
}