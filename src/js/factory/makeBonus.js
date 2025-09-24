import Animation from '../engine/Animation.js';
import Bonus, { animations, animationBase } from '../Bonus.js';

export default (index, options) => {
    // AGENT_MOD: Use letter-c.svg for cherry (index 0), original sprite for others
    const defaultAnimation = index === 0 ? 
        new Animation({
            imageURL: 'img/letter-c.svg',
            numberOfFrame: 1,
            delta: 0,
            refreshRate: 180,
            offsetX: 0,
            offsetY: 0
        }) :
        new Animation({
            ...animationBase,
            offsetX: 60 * index
        });

    return new Bonus({
        animations: {
            ...animations,
            default: defaultAnimation
        },
        ...options
    });
};
