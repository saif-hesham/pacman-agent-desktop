import Animation from '../engine/Animation.js';
import Ghost, { animations, animationBase } from '../Ghost.js';
import getDistance from '../helper/getDistance.js';

export const SPRITE_PINKY = 'SPRITE_PINKY';
export const SPRITE_BLINKY = 'SPRITE_BLINKY';
export const SPRITE_INKY = 'SPRITE_INKY';
export const SPRITE_SUE = 'SPRITE_SUE';
// AGENT_MOD: Add fifth ghost type for mobile.svg
export const SPRITE_MOBILE = 'SPRITE_MOBILE';

// AGENT_MOD: Create SVG-based animation base for ghost icons
const svgAnimationBase = {
  numberOfFrame: 1,
  delta: 0,
  refreshRate: 180,
  offsetX: 0,
  offsetY: 0,
};

// AGENT_MOD: Helper function to create all directional animations for an SVG icon
const createSvgAnimations = imageURL => ({
  right: new Animation({
    ...svgAnimationBase,
    imageURL,
  }),
  down: new Animation({
    ...svgAnimationBase,
    imageURL,
  }),
  up: new Animation({
    ...svgAnimationBase,
    imageURL,
  }),
  left: new Animation({
    ...svgAnimationBase,
    imageURL,
  }),
  // AGENT_MOD: Add frightened animation (lighter shade)
  frightened: new Animation({
    ...svgAnimationBase,
    imageURL,
  }),
  // AGENT_MOD: Add frightened blink animation (darker shade for flashing)
  frightenedBlink: new Animation({
    ...svgAnimationBase,
    imageURL,
  }),
});

// AGENT_MOD: Create a custom Ghost class that handles SVG sprites properly
class SvgGhost extends Ghost {
  setAnimation(animation, index, callback) {
    super.setAnimation(animation, index, callback);
    // Override background styling for SVG images
    if (animation.imageURL.endsWith('.svg')) {
      this.el.style.backgroundSize = 'contain';
      this.el.style.backgroundRepeat = 'no-repeat';
      this.el.style.backgroundPosition = 'center';

      // AGENT_MOD: Apply CSS filters for frightened states
      const animationKey = this.getAnimationKey(animation);
      if (animationKey === 'frightened' || animationKey === 'frightenedBlink') {
        // Lighter shade for frightened state (both normal and blink use same effect)
        this.el.style.filter = 'brightness(2) opacity(0.5)';
      } else {
        // Normal state - reset filter
        this.el.style.filter = 'none';
      }
    }
  }

  // AGENT_MOD: Helper method to identify which animation is being used
  getAnimationKey(animation) {
    for (const [key, anim] of Object.entries(this.animations)) {
      if (anim === animation) {
        return key;
      }
    }
    return null;
  }
}

export default (label, options) => {
  // Pink Ghost
  if (label === 'pinky') {
    options = Object.assign(
      {
        type: SPRITE_PINKY,
        dir: 'd',
        defaultAnimation: 'down',
        getChaseTarget: function () {
          var t = this.pacmanData.tile;
          var dir = this.pacmanData.dir;
          return t.get(dir).get(dir).get(dir).get(dir);
        },
        animations: {
          ...animations,
          // AGENT_MOD: Use fusion.svg for Pinky (Pink Ghost)
          ...createSvgAnimations('img/fusion.svg'),
        },
      },
      options
    );
  }
  // Red Ghost
  if (label === 'blinky') {
    options = Object.assign(
      {
        type: SPRITE_BLINKY,
        dir: 'l',
        waitTime: 0,
        scatterTarget: 25,
        defaultAnimation: 'left',
        animations: {
          ...animations,
          // AGENT_MOD: Use dsl.svg for Blinky (Red Ghost)
          ...createSvgAnimations('img/dsl.svg'),
        },
      },
      options
    );
  }
  // Cyan Ghost
  if (label === 'inky') {
    options = Object.assign(
      {
        type: SPRITE_INKY,
        dir: 'u',
        waitTime: 6,
        scatterTarget: 979,
        defaultAnimation: 'up',
        getChaseTarget: function () {
          var pacmanTile = this.pacmanData.tile;
          var blinkyTile = this.blinky.getTile();
          var dir = this.pacmanData.dir;

          pacmanTile = pacmanTile.get(dir).get(dir); // Two tiles in front of pacman

          return this.map.getTile(
            pacmanTile.col + pacmanTile.col - blinkyTile.col,
            pacmanTile.row + pacmanTile.row - blinkyTile.row
          );
        },
        animations: {
          ...animations,
          // AGENT_MOD: Use vkd.svg for Inky (Cyan Ghost)
          ...createSvgAnimations('img/vkd.svg'),
        },
      },
      options
    );
  }
  // Orange Ghost
  if (label === 'sue') {
    options = Object.assign(
      {
        type: SPRITE_SUE,
        dir: 'u',
        waitTime: 8,
        scatterTarget: 953,
        defaultAnimation: 'up',
        getChaseTarget: function () {
          var t = this.pacmanData.tile;
          var d = getDistance(t, this.getTile());
          if (d > 16 * t.w) return t;
          else return this.scatterTarget;
        },
        animations: {
          ...animations,
          // AGENT_MOD: Use vum.svg for Sue (Orange Ghost)
          ...createSvgAnimations('img/vum.svg'),
        },
      },
      options
    );
  }
  // AGENT_MOD: Fifth Ghost - Mobile
  if (label === 'mobile') {
    options = Object.assign(
      {
        type: SPRITE_MOBILE,
        dir: 'u', // AGENT_MOD: Start with vertical direction for bouncing
        waitTime: 12,
        scatterTarget: 27,
        defaultAnimation: 'up', // AGENT_MOD: Match the initial direction
        getChaseTarget: function () {
          // Similar to Blinky but with slight variation - target 2 tiles ahead
          var t = this.pacmanData.tile;
          var dir = this.pacmanData.dir;
          return t.get(dir).get(dir);
        },
        animations: {
          ...animations,
          // AGENT_MOD: Use mobile.svg for Mobile Ghost
          ...createSvgAnimations('img/mobile.svg'),
        },
      },
      options
    );
  }

  // AGENT_MOD: Return SvgGhost instead of regular Ghost for SVG sprite handling
  return new SvgGhost(options);
};
