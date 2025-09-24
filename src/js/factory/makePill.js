import Animation, { ANIMATION_VERTICAL } from '../engine/Animation.js';
import Item from '../Item.js';

const animationBase = {
  imageURL: 'img/heart-hi-dark.svg',
  numberOfFrame: 2,
  delta: 48,
  refreshRate: 450,
  type: ANIMATION_VERTICAL,
};

export default options =>
  new Item({
    width: 48,
    height: 48,
    animations: {
      white: new Animation({
        ...animationBase,
      }),
      yellow: new Animation({
        ...animationBase,
        offsetX: 24 + 8,
      }),
      red: new Animation({
        ...animationBase,
        offsetX: (24 + 8) * 2,
      }),
    },
    ...options,
  });
