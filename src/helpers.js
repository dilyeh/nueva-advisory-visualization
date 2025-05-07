
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
                r={ visStateRef.current.dotList[idx].radius }
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
        this.radius = 10;
    }

    tick(visualizationState) {
        // find forces
        this.getForces(visualizationState);
        // update position
        this.updateVelocity();
        this.moveDot(this.velocity);
        // check / get out of collisions
        // render
    }
  
    getForces() { 
        // find forces according to targetPosition
        let distanceFromTargetPosition = new Vector2(this.targetPosition.X - this.position.X, this.targetPosition.Y - this.position.Y);
        let targetVelocity = new Vector2(distanceFromTargetPosition.X * 0.05, distanceFromTargetPosition.Y * 0.05);
        this.forces.X = targetVelocity.X - this.velocity.X;
        this.forces.Y = targetVelocity.Y - this.velocity.Y;
    }

    checkCollisions(visualizationState) {
        for (let idx=0; idx<visualizationState.current.dotList.length; idx++) {
            if (visualizationState.current.dotList !== this) {
                // get distance from dot
                let distance = this.position.getDistance(visualizationState.current.dotList[idx].position);
                if (distance < this.radius + visualizationState.current.dotlist[idx].radius) {
                    return true;
                }
           }
        }
        return false;
    }

    getOutOfCollisions(visualizationState) {
        for (let jiggle=0; jiggle<this.radius; jiggle++) {
            if (!this.checkCollisions(visualizationState)) {
                
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
            ((this.X - anotherVector2.X) ** 2)
        ));
    }
}

function randInt(max) {
    return Math.floor(Math.random() * max);
}
