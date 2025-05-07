
export class VisualizationState {
    constructor() {
        // create the dots
        let dotList = [];
        for (let i=0; i<50; i++) {
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
    }

    updateTick(dotList) {
        this.getForces(dotList);
    }

    moveTick() {
        this.updateVelocity();
        this.moveDot(this.velocity);
    }
  
    getForces(dotList) { // dotList is, contrary to popular belief, a list of dots
        const springStiffness = 0.03;
        const dampening = 0.8;
        // find forces according to targetPosition
        let distanceFromTargetPosition = new Vector2(this.targetPosition.X - this.position.X, this.targetPosition.Y - this.position.Y);
        let targetVelocity = new Vector2(
            (Math.abs(distanceFromTargetPosition.X) * springStiffness) * Math.sign(distanceFromTargetPosition.X), 
            (Math.abs(distanceFromTargetPosition.Y) * springStiffness) * Math.sign(distanceFromTargetPosition.Y));
        this.forces.X = (targetVelocity.X - this.velocity.X);
        this.forces.Y = (targetVelocity.Y - this.velocity.Y);

        for (const dot of dotList) {


            // compute distance and angle, find the force magnitude, and adjust the x and y components according to magnitude and angle
            if (dot !== this) {
                let distanceFromDot = this.position.getDistance(dot.position);

                if (distanceFromDot <= (this.radius + dot.radius)) {
                    let angle = Math.atan2(dot.position.Y - this.position.Y, dot.position.X - this.position.X); // atan's range is (-pi/2) -> (pi/2)

                    //let forceMagnitude = -0.8 * 1.5 ** ((this.radius + dot.radius) - distanceFromDot);
                    let forceMagnitude = -0.8 * ((this.radius + dot.radius)- distanceFromDot);
                    this.forces.X += Math.cos(angle) * forceMagnitude;
                    this.forces.Y += Math.sin(angle) * forceMagnitude;
                }
            }
        }

    }

    updateVelocity() {
        this.velocity.X += this.forces.X;
        this.velocity.Y += this.forces.Y;

        const dampening = 0.8;
        this.velocity.X *= dampening;
        this.velocity.Y *= dampening;

        //if (Math.abs(this.velocity.X) <= 0.1) {
            //this.velocity.X = 0;
        //}
        //if (Math.abs(this.velocity.Y) <= 0.1) {
            //this.velocity.Y = 0;
        //}
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
        ));
    }
}

export function randInt(max) {
    return Math.floor(Math.random() * max);
}
