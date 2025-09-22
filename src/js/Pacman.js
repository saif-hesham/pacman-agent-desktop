import Animation, { ANIMATION_HORIZONTAL } from './engine/Animation.js';
import SVGCharacter from './SVGCharacter.js';
import SVGPacman from './SVGPacman.js';

// Custom SVG Animation class for Pac-Man
class SVGAnimation {
    constructor(direction) {
        this.direction = direction;
        this.numberOfFrame = 4;
        this.refreshRate = 60;
        this.currentFrame = 0;
        this.isReady = () => true;
        this.load = () => Promise.resolve();
    }
}

const animations = {
    'right': new SVGAnimation('right'),
    'down': new SVGAnimation('down'),
    'up': new SVGAnimation('up'),
    'left': new SVGAnimation('left')
};

const defaults = {
    animations,
    dir : 'l',
    defaultAnimation : 'left',
    preturn : true,
    frightenedSpeed : null,
    frightenedDotSpeed : null,
    dotSpeed : null
};

class Pacman extends SVGCharacter {
    constructor(options) {
        super(options);

        Object.keys(defaults).forEach(key => {
            if (key in options) this[key] = options[key];
        });

        const {
            addGameGhostEatEventListener,
            addGameGhostModeFrightenedEnter,
            addGameGhostModeFrightenedExit
        } = options;

        this._ghostFrightened = [];

        // Change tile. Set direction.
        this.on('item:tile', (tile) => {
            if (this._ghostFrightened.length) this._speed = this.frightenedSpeed;
            else this._speed = this.speed;

            if (tile.item) {
                if (tile.hasPill()) { // Pill!
                    this.emit('item:eatpill', tile);
                }
                else if (tile.hasDot()) { // Dot!
                    this.emit('item:eatdot', tile);
                    if (this._ghostFrightened.length) this._speed = this.frightenedDotSpeed;
                    else this._speed = this.dotSpeed;
                }
                tile.item.destroy();
                tile.item = null;
            }

        });

        addGameGhostEatEventListener(ghost => {
            this._eatenTurns = 9;
            this.dir = 'r';
            this.pauseAnimation();
        });

        addGameGhostModeFrightenedEnter(ghost => {
            this._ghostFrightened = this._ghostFrightened.filter(f => f !== ghost).concat([ghost]);
        });

        addGameGhostModeFrightenedExit(ghost => {
            this._ghostFrightened = this._ghostFrightened.filter(f => f !== ghost);
        });
    }

    reset() {
        SVGCharacter.prototype.reset.apply(this);
        this._lastEatenTurnsTime = null;
    }

    move() {
        if (!this._eatenTurns) SVGCharacter.prototype.move.apply(this, arguments);
        else if (!this._eatenTurnsFrames) {
            if (this._eatenTurns === 9) this.emit('item:die');
            if (this._eatenTurns > 2) {
                var directions = {'d' : 'l', 'l' : 'u', 'u' : 'r', 'r' : 'd'};
                this.dir = directions[this.dir];
                this.setNextAnimation();
                this.update();
                this._eatenTurnsFrames = 5;
            } else this._eatenTurnsFrames = 25;

            this._eatenTurns--;

            if (this._eatenTurns === 0) this.emit('item:life');

        } else this._eatenTurnsFrames--;
    }

};

Object.assign(Pacman.prototype, defaults);

export default Pacman;
