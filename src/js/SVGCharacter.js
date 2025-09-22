import Character from './Character.js';
import SVGPacman from './SVGPacman.js';

class SVGCharacter extends Character {
    constructor(options) {
        super(options);
        this._svgFrameCounter = 0;
        this._svgCurrentFrame = 0;
    }

    render() {
        // Create the element like the parent but without background image
        Object.assign(this.el.style, {
            position: 'absolute',
            overflow: 'hidden',
            height: `${this.height}px`,
            width: `${this.width}px`,
            zIndex: this.z
        });

        this.setAnimation(this.animations[this.defaultAnimation]);
        this.transform();
    }

    setAnimation(animation, index, callback) {
        this.animation = animation;
        this._svgCurrentFrame = 0;

        // Clear any existing background
        this.el.style.backgroundImage = 'none';
        
        // Update SVG content
        this._updateSVGContent();

        if (typeof callback === 'function') {
            this.callback = callback;
        }
    }

    _updateSVGContent() {
        if (!this.animation || !this.animation.direction) return;
        
        const svg = SVGPacman.generateSVG(this._svgCurrentFrame, this.animation.direction);
        this.el.innerHTML = svg;
    }

    refresh() {
        if (!this.animation || !this.playing) return;

        // Handle SVG frame animation
        const normalizedRefreshRate = this.normalizeRefrashRate ? this.normalizeRefrashRate(this.animation.refreshRate) : 1;
        if (this._svgFrameCounter >= normalizedRefreshRate - 1) {
            this._svgCurrentFrame = (this._svgCurrentFrame + 1) % this.animation.numberOfFrame;
            this._updateSVGContent();
            this._svgFrameCounter = 0;
        } else {
            this._svgFrameCounter++;
        }

        // Update idle counter for compatibility with the original system
        if (this.normalizeRefrashRate) {
            this.idleCounter = (this.idleCounter + 1) % this.normalizeRefrashRate(this.animation.refreshRate);
        }
    }

    pauseAnimation() {
        this.playing = false;
    }

    resumeAnimation() {
        this.playing = true;
    }
}

export default SVGCharacter;