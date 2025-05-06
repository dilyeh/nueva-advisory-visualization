
export class VisualizationContainer {
    constructor() {
        // create the dots
        let visualizationDots = [];
        for (let i=0; i<5; i++) {
            visualizationDots.push(new Dot(new Vector2(i * 10, i * 10)));
        }
        this.visualizationDots = visualizationDots;
    }

    updateVisualization() {
        for (let idx=0; idx<this.visualizationDots.length; idx++) {
            this.visualizationDots[idx].tick(this.visualizationDots);
        }
    }
}



export class Dot {
    constructor(Position) { // position is a vector2
        this.position = Position;
        this.forces = new Vector2(0,0);
        this.targetPosition = new Vector2(0,0);
    }

    tick(visualizationDots) {
        this.getForces(visualizationDots);
        this.moveDot(new Vector2(2,2));
    }
  
    getForces(visualizationDots) { // visualizationDots is a list of Dots
        // find forces according to targetPosition
        let distanceFromTargetPosition = new Vector2(this.targetPosition.X - this.position.X, this.targetPosition.Y - this.position.Y);
        this.forces.X = distanceFromTargetPosition.X * 5; // 5 is how strongly the target position should pull on the dot
        this.forces.Y = distanceFromTargetPosition.Y * 5;

        for (const dot of visualizationDots) {
            if (!dot == this) { // idk if this works?
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


export const Visualization = ({ visualizationContainer }) => { // this generates a react component
    let htmlToReturn = [];
    let visualizationDots = visualizationContainer.visualizationDots;

    for (let i=0; i<visualizationDots.length; i++) { // this is so cooked
        htmlToReturn.push(
            <circle cx={visualizationDots[i].position.X} cy={visualizationDots[i].position.Y} r="3" strokeWidth="0" fill="yellow" />
        );
    }

    return (
        <svg id="visualization">
            { htmlToReturn }
        </svg>
    );
}
