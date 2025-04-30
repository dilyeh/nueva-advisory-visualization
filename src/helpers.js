export class Dot {
    constructor(Position) { // position is a position
        this.position = Position;
        this.forces = new Vector2(0,0);
        this.targetPosition = new Vector2(0,0);
    }
  
    getForces(ListOfDots, ) {

    }
  
}


export class Vector2 { // represents a 2d vector.
    constructor(X, Y) {
        this.X = X;
        this.Y = Y;
    }
}


export const Visualization = ({ visualizationDots }) => { // this generates a react component
    let htmlToReturn = [];

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
