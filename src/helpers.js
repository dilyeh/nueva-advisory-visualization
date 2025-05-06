
export class VisualizationState {
    constructor() {
        // create the dots
        let dotList = [];
        for (let i=0; i<5; i++) {
            dotList.push(new Dot(new Vector2(i * 30, i * 30)));
        }
        this.dotList = dotList;
    }

    updateVisualization() {
        for (let idx=0; idx<this.dotList.length; idx++) {
            this.dotList[idx].tick(this.dotList);
        }
        console.log("we're updating");
    }
}



export function Visualization({ tick, visStateRef }) { // this generates a react component
    let circles = [];
    for (let idx=0; idx<visStateRef.current.dotList.length; idx++) {
        circles.push(
            <circle 
                r="20"
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
        this.forces = new Vector2(0,0);
        this.targetPosition = new Vector2(0,0);
    }

    tick(visualizationDots) {
        this.getForces(visualizationDots);
        this.moveDot(new Vector2(10,10));
    }
  
    getForces(visualizationDots) { // visualizationDots is a list of Dots
        // find forces according to targetPosition
        let distanceFromTargetPosition = new Vector2(this.targetPosition.X - this.position.X, this.targetPosition.Y - this.position.Y);
        this.forces.X = distanceFromTargetPosition.X * 5; // 5 is how strongly the target position should pull on the dot
        this.forces.Y = distanceFromTargetPosition.Y * 5;

        for (const dot of visualizationDots) {
            if (!dot === this) { // idk if this works? i think === checks if it's the same without type conversion or smth?????? average js moment
                let distanceFromDot = new Vector2(dot.position.X - this.position.X, dot.position.Y - this.position.Y);
                this.forces.X += distanceFromDot.X * 0.5;
                this.forces.Y += distanceFromDot.Y * 0.5;
            }
        }
    }

    moveDot(velocity) {
        this.position.X += velocity.X;
        this.position.Y += velocity.Y;
    }

    move(displacement) { // displacement is a vector2
        this.position.X += displacement.X;
        this.position.Y += displacement.Y;
    }
}


export class Vector2 { // represents a 2d vector.
    constructor(X, Y) {
        this.X = X;
        this.Y = Y;
    }
}

