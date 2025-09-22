/**
 * SVG Pac-Man Generator
 * Creates purple Pac-Man with different mouth states for animation
 */

const PURPLE_COLOR = '#7030A0';
const SVG_SIZE = 60; // Match the Character default size

class SVGPacman {
    /**
     * Generate SVG Pac-Man with specified mouth opening and direction
     * @param {number} frame - Animation frame (0-3)
     * @param {string} direction - Direction ('left', 'right', 'up', 'down')
     * @returns {string} SVG string
     */
    static generateSVG(frame = 0, direction = 'right') {
        const center = SVG_SIZE / 2;
        const radius = center - 3;
        
        // Animation frames: closed mouth, small opening, wide opening, small opening
        const mouthOpenings = [0, 45, 90, 45]; // Degrees for mouth opening
        const mouthAngle = mouthOpenings[frame % 4];
        
        // Calculate rotation based on direction
        const rotations = {
            'right': 0,
            'down': 90,
            'left': 180,
            'up': 270
        };
        const rotation = rotations[direction] || 0;
        
        let pathData;
        
        if (mouthAngle === 0) {
            // Frame 0: Perfect complete circle (no mouth)
            pathData = `M ${center - radius} ${center} 
                        A ${radius} ${radius} 0 0 1 ${center} ${center - radius}
                        A ${radius} ${radius} 0 0 1 ${center + radius} ${center}
                        A ${radius} ${radius} 0 0 1 ${center} ${center + radius}
                        A ${radius} ${radius} 0 0 1 ${center - radius} ${center} Z`;
        } else {
            // Frames 1-3: Complete circle with triangular pizza slice cut OUT
            const halfAngleRad = (mouthAngle / 2) * Math.PI / 180;
            
            // Points where the pizza slice would be cut from the circle edge
            const sliceTop_X = center + radius * Math.cos(-halfAngleRad);
            const sliceTop_Y = center + radius * Math.sin(-halfAngleRad);
            const sliceBottom_X = center + radius * Math.cos(halfAngleRad);
            const sliceBottom_Y = center + radius * Math.sin(halfAngleRad);
            
            // Draw the remaining circle (everything EXCEPT the pizza slice)
            const remainingAngle = 360 - mouthAngle;
            const largeArcFlag = remainingAngle > 180 ? 1 : 0;
            
            // Start from bottom of cut, arc around the back to top of cut
            pathData = `M ${sliceBottom_X} ${sliceBottom_Y}
                        A ${radius} ${radius} 0 ${largeArcFlag} 1 ${sliceTop_X} ${sliceTop_Y}
                        L ${center} ${center}
                        L ${sliceBottom_X} ${sliceBottom_Y} Z`;
        }
        
        // Eye positioning - position BEFORE rotation so it ends up in the right place AFTER rotation
        const eyeOffset = radius * 0.3;
        let eyeX, eyeY;
        
        // Position eye so it appears at the top-left of Pac-Man's face AFTER rotation
        switch (direction) {
            case 'right':
                // No rotation (0°) - eye should be top-left
                eyeX = center - eyeOffset;
                eyeY = center - eyeOffset; 
                break;
            case 'left':
                // 180° rotation - position eye at bottom-right so it rotates to top-left
                eyeX = center + eyeOffset;
                eyeY = center + eyeOffset; 
                break;
            case 'up':
                // 270° rotation - position eye at bottom-left so it rotates to top-left
                eyeX = center - eyeOffset;
                eyeY = center + eyeOffset;
                break;
            case 'down':
                // 90° rotation - position eye at top-right so it rotates to top-left
                eyeX = center + eyeOffset;
                eyeY = center - eyeOffset;
                break;
            default:
                // Default is left direction - same as left case
                eyeX = center + eyeOffset;
                eyeY = center + eyeOffset;
        }
        
        return `
            <svg width="${SVG_SIZE}" height="${SVG_SIZE}" xmlns="http://www.w3.org/2000/svg">
                <g transform="rotate(${rotation} ${center} ${center})">
                    <!-- Circle with pizza slice cut OUT (the slice is missing) -->
                    <path d="${pathData}" fill="${PURPLE_COLOR}" stroke="#5a2470" stroke-width="1.5"/>
                    <!-- Eye positioned relative to the body -->
                    <circle cx="${eyeX}" cy="${eyeY}" r="2.5" fill="#000000"/>
                </g>
            </svg>
        `.trim();
    }
    
    /**
     * Create a data URL for the SVG
     * @param {number} frame - Animation frame (0-3)
     * @param {string} direction - Direction ('left', 'right', 'up', 'down')
     * @returns {string} Data URL
     */
    static generateDataURL(frame = 0, direction = 'right') {
        const svg = this.generateSVG(frame, direction);
        return `data:image/svg+xml;base64,${btoa(svg)}`;
    }
    
    /**
     * Create all animation frames for a direction
     * @param {string} direction - Direction ('left', 'right', 'up', 'down')
     * @returns {Array<string>} Array of data URLs
     */
    static generateAnimationFrames(direction = 'right') {
        return [0, 1, 2, 3].map(frame => this.generateDataURL(frame, direction));
    }
    
    /**
     * Create a canvas with the SVG drawn on it
     * @param {number} frame - Animation frame (0-3)
     * @param {string} direction - Direction ('left', 'right', 'up', 'down')
     * @returns {Promise<HTMLCanvasElement>} Canvas element
     */
    static async generateCanvas(frame = 0, direction = 'right') {
        return new Promise((resolve, reject) => {
            const canvas = document.createElement('canvas');
            canvas.width = SVG_SIZE;
            canvas.height = SVG_SIZE;
            const ctx = canvas.getContext('2d');
            
            const img = new Image();
            img.onload = () => {
                ctx.drawImage(img, 0, 0);
                resolve(canvas);
            };
            img.onerror = reject;
            img.src = this.generateDataURL(frame, direction);
        });
    }
    
    /**
     * Create a sprite sheet canvas with all frames for all directions
     * @returns {Promise<HTMLCanvasElement>} Canvas with sprite sheet
     */
    static async generateSpriteSheet() {
        const canvas = document.createElement('canvas');
        canvas.width = SVG_SIZE * 4; // 4 frames
        canvas.height = SVG_SIZE * 4; // 4 directions
        const ctx = canvas.getContext('2d');
        
        const directions = ['right', 'down', 'left', 'up'];
        
        const promises = [];
        for (let dirIndex = 0; dirIndex < directions.length; dirIndex++) {
            for (let frame = 0; frame < 4; frame++) {
                promises.push(
                    this.generateCanvas(frame, directions[dirIndex]).then(frameCanvas => {
                        ctx.drawImage(frameCanvas, frame * SVG_SIZE, dirIndex * SVG_SIZE);
                    })
                );
            }
        }
        
        await Promise.all(promises);
        return canvas;
    }
}

export default SVGPacman;