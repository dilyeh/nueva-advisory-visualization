
export class VisualizationState {
    constructor() {
        // create the dots
        let dotList = [];
        for (let i=0; i<10; i++) {
            dotList.push(
                new Dot(
                    new Vector2(randInt(300), randInt(300))
                )
            );
        }
        this.dotList = dotList;
    }

    updateVisualization() {
        console.log("updating visualization");
        for (let idx=0; idx<this.dotList.length; idx++) {
            this.dotList[idx].tick(this.dotList);
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
                fill="yellow"
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
    }

    tick(visualizationDots) {
        this.getForces(visualizationDots);
        this.updateVelocity();
        this.moveDot(this.velocity);
    }
  
    getForces(visualizationDots) { // visualizationDots is a list of Dots
        // find forces according to targetPosition
        let distanceFromTargetPosition = new Vector2(this.targetPosition.X - this.position.X, this.targetPosition.Y - this.position.Y);
        let targetVelocity = new Vector2(distanceFromTargetPosition.X * 0.05, distanceFromTargetPosition.Y * 0.05);
        this.forces.X = targetVelocity.X - this.velocity.X;
        this.forces.Y = targetVelocity.Y - this.velocity.Y;

        for (const dot of visualizationDots) {
            if (dot !== this) { // idk if this works? i think === checks if it's the same without type conversion or smth?????? average js moment
                let distanceFromDot = new Vector2(dot.position.X - this.position.X, dot.position.Y - this.position.Y);

                // if the abs(distanceFromDot <= 50), then take 50-abs(distanceFromDot), multiply it by the sign, and add it to forces. else, add nothing
                this.forces.X += (Math.abs(distanceFromDot.X) <= 10) ? (-0.15 * Math.sign(distanceFromDot.X) * (20 - Math.abs(distanceFromDot.X))) : 0;
                this.forces.Y += (Math.abs(distanceFromDot.Y) <= 10) ? (-0.15 * Math.sign(distanceFromDot.Y) * (20 - Math.abs(distanceFromDot.Y))) : 0;
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
}

function randInt(max) {
    return Math.floor(Math.random() * max);
}