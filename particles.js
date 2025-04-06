import { checkBounds, moveParticle, getParticle, setParticle } from "./canvas.js";
import { getRandomInt } from "./util.js";

/**
 * Base particle class
 */
class Particle {
    constructor() {
        this.color = "";
        this.type = "";
    }

    /**
     * Returns true if the particle should swap with other when trying
     * to move onto the same grid location as {@link other}.
     * 
     * EX: Let sand sink below water
     * 
     * @param {Particle} other 
     * @returns {boolean} Should the particle swap
     */
    swap(other) {
        return false;
    }

    /**
     * Update the particle at location (row, col)
     * 
     * @param {number} row 
     * @param {number} col 
     */
    update(row, col) {

    }
}

/**
 * Sand particle
 */
export class Sand extends Particle {
    constructor() {
        super();
        this.color = "orange";
        this.type = "sand";
    }

    swap(other) {
        // Making sand fall under water
        return other.type == "water";
    }

    update(row, col) {
        let newRow = row + 1;

        if (!moveParticle(row, col, newRow, col)) {
            if (!moveParticle(row, col, newRow, col+1, this.swap)) {
                moveParticle(row, col, newRow, col-1, this.swap);
            }
        }
    }
}


/**
 * Water particle
 */
export class Water extends Particle {
    constructor() {
        super();
        this.color = "blue";
        this.type = "water";
    }

    update(row, col) {
        // Make water turn to grass when touching it
        if (getParticle(row+1, col)?.type == "dirt") {
            setParticle(row+1, col, new Grass());
            setParticle(row, col, null);
            return;
        }

        // Moving down
        if (getRandomInt(0,2) && !getParticle(row+1, col)) {
            moveParticle(row, col, row+1, col, super.swap);
        }

        // Moving left/right
        if (getRandomInt(0,1) && !getParticle(row, col+1)) {
            moveParticle(row, col, row, col+1, super.swap);
        } else if (getRandomInt(0,1) && !getParticle(row, col-1)) {
            moveParticle(row, col, row, col-1, super.swap);
        }

    }
}

/**
 * Stone particle
 */
export class Stone extends Particle {
    constructor () {
        super();
        this.color = "gray";
        this.type = "stone";
    }
}

/**
 * Dirt particle
 */
export class Dirt extends Sand {
    constructor() {
        super();
        this.color = "#964B00";
        this.type = "dirt";
    }
}

/**
 * Grass particle
 */
export class Grass extends Sand {
    constructor() {
        super();
        this.color = "green";
        this.type = "grass";
    }
}

/**
 * Fire particle
 */
export class Fire extends Particle {
    constructor() {
        super();
        this.color = "red";
        this.type = "fire";
        this.duration = 0;
        this.max_duration = getRandomInt(50,100);
    }

    update(row, col) {
        this.duration++;

        if (this.duration >= this.max_duration) {
            setParticle(row, col, null);
            return;
        }

        // Fire spreading for wood
        if (getParticle(row - 1, col)?.type === "wood") {
            setParticle(row - 1, col, new Fire());
        } else if (getParticle(row, col + 1)?.type === "wood") {
            setParticle(row, col + 1, new Fire());
        } else if (getParticle(row, col - 1)?.type === "wood") {
            setParticle(row, col - 1, new Fire());
        }

        // Fire making steam
        if (getParticle(row - 1, col)?.type === "water") {
            setParticle(row - 1, col, new Steam());
        } else if (getParticle(row + 1, col)?.type === "water") {
            setParticle(row - 1, col, new Steam());
        } else if (getParticle(row, col + 1)?.type === "water") {
            setParticle(row, col + 1, new Steam());
        } else if (getParticle(row, col - 1)?.type === "water") {
            setParticle(row, col - 1, new Steam());
        }

        // Movement
        if (!getParticle(row - 1, col) && checkBounds(row - 1, col)) {
            moveParticle(row, col, row - 1, col);
        } else if (getRandomInt(0, 1) && !getParticle(row, col + 1) && checkBounds(row, col + 1)) {
            moveParticle(row, col, row, col + 1);
        } else if (getRandomInt(0, 1) && !getParticle(row, col - 1) && checkBounds(row, col - 1)) {
            moveParticle(row, col, row, col - 1);
        }

        
    }
}

/**
 * Wood particle
 */
export class Wood extends Particle {
    constructor() {
        super();
        this.color = "#964B00";
        this.type = "wood";
    }
}

/**
 * Steam particle
 */
export class Steam extends Particle {
    constructor() {
        super();
        this.color = "#D3D3D3"
        this.type = "steam";
        this.duration = 0;
        this.max_duration = getRandomInt(200,300);
    }

    update(row, col) {
        this.duration++;
        
        // Disappears if 1/500 number is selected
        if (getRandomInt(0, 500) == 15) {
            setParticle(row, col, null);
            return;
        }

        // Turns into water after some time
        if (this.duration >= this.max_duration) {
            setParticle(row, col, new Water());
            return;
        }

        if (!getParticle(row - 1, col) && checkBounds(row - 1, col)) {
            moveParticle(row, col, row - 1, col);
        } else if (getRandomInt(0, 1) && !getParticle(row, col + 1) && checkBounds(row, col + 1)) {
            moveParticle(row, col, row, col + 1);
        } else if (getRandomInt(0, 1) && !getParticle(row, col - 1) && checkBounds(row, col - 1)) {
            moveParticle(row, col, row, col - 1);
        }
    }
}

/**
 * Acid Particle
 */

export class Acid extends Particle {
    constructor() {
        super();
        this.color = "green";
        this.type = "acid";
    }

    update(row, col) {
        // Turns stone or wood into steam after interaction
        if (getParticle(row - 1, col)?.type === "wood" || getParticle(row - 1, col)?.type === "stone") {
            setParticle(row - 1, col, new Steam());
        } else if (getParticle(row, col + 1)?.type === "wood" || getParticle(row, col + 1)?.type === "stone") {
            setParticle(row, col + 1, new Steam());
        } else if (getParticle(row, col +1)?.type === "wood" || getParticle(row, col + 1)?.type === "stone") {
            setParticle(row, col - 1, new Steam());
        }

        // Turns water into acid
        if (getParticle(row - 1, col)?.type === "water") {
            setParticle(row - 1, col, new Acid());
        } else if (getParticle(row, col + 1)?.type === "water") {
            setParticle(row, col + 1, new Acid());
        } else if (getParticle(row, col - 1)?.type === "water") {
            setParticle(row, col - 1, new Acid());
        }

        // Moving down
        if (getRandomInt(0,2) && !getParticle(row+1, col)) {
            moveParticle(row, col, row+1, col, super.swap);
        }

        // Moving left/right
        if (getRandomInt(0,1) && !getParticle(row, col+1)) {
            moveParticle(row, col, row, col+1, super.swap);
        } else if (getRandomInt(0,1) && !getParticle(row, col-1)) {
            moveParticle(row, col, row, col-1, super.swap);
        }
    }
}

/**
 * Create particle based on dropdown name
 * 
 * @param {string} value 
 * @returns 
 */
export function checkParticleType(value) {
    if (value == "Sand") {
        return new Sand();
    } else if (value == "Water") {
        return new Water();
    } else if (value == "Stone") {
        return new Stone();
    } else if (value == "Dirt") {
        return new Dirt();
    } else if (value == "Fire") {
        return new Fire();
    } else if (value == "Wood") {
        return new Wood();
    } else if (value == "Steam") {
        return new Steam();
    }  else if (value == "Acid") {
        return new Acid();
    } else {
        return null;
    }
}