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

    copy() {
        return new Vector2(this.X, this.Y);
    }
}

export function randInt(max) {
    return Math.floor(Math.random() * max);
}


export function extractColors(url, reverse=false) { // input is a coolors url
    // get just the parts with the colors
    let colorCode = url.replace("https://coolors.co/palette/", '');
    // extract colors (hyphen-separated)
    let colorPalette = ["#"];
    for (let char=0; char<colorCode.length; char++) {
        if (colorCode[char] === "-") {
            colorPalette.push("#");
        }
        else {
            colorPalette[colorPalette.length - 1] = colorPalette[colorPalette.length - 1] + colorCode[char]
        }
    }
    if (reverse) {
        colorPalette.reverse();
    }
    return (colorPalette);
}

export function cloneWithPrototype(obj) { // this was chatgpted
    return Object.assign(Object.create(Object.getPrototypeOf(obj)), obj);
}

// this is from https://stackoverflow.com/questions/29544371/finding-the-average-of-an-array-using-js#41452260
// because idk what the reduce method is
export const average = (array) => array.reduce((a, b) => a + b) / array.length;