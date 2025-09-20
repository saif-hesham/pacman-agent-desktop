// AGENT_MOD: Dynamic maze renderer - generates visual maze from map data
export default class MazeRenderer {
  constructor(mapData, scalingFactor = 1) {
    this.mapData = mapData;
    this.scalingFactor = scalingFactor;
    this.tileSize = 32 * scalingFactor; // AGENT_MOD: Use 32px like the game engine, not 16px
    this.colors = {
      wall: '#0066cc', // Slightly darker blue - less prominent
      wallBorder: '#3388dd', // Softer border color
      dot: '#ffff88', // Yellow dots
      pill: '#ffff88', // Yellow power pills
      empty: '#000000', // Black empty space
      tunnel: '#000000', // Black tunnel areas
      ghostHouse: '#ff69b4', // Pink ghost house
    };
  }

  // Generate CSS-based maze visualization
  renderMaze(containerElement) {
    // AGENT_MOD: Add error checking for map data
    if (
      !this.mapData ||
      !Array.isArray(this.mapData) ||
      this.mapData.length === 0
    ) {
      console.error('MazeRenderer: Invalid map data provided', this.mapData);
      return null;
    }

    // Clear any existing maze elements
    this.clearMaze(containerElement);

    // Create maze container
    const mazeContainer = document.createElement('div');
    mazeContainer.className = 'dynamic-maze-container';
    mazeContainer.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 0;
      pointer-events: none;
    `;

    console.log(
      'Creating maze container with dimensions:',
      this.mapData.length,
      'x',
      this.mapData[0].length
    );
    console.log(
      'Using scaling factor:',
      this.scalingFactor,
      'tile size:',
      this.tileSize
    );

    // Process each row and column
    const rows = this.mapData.length;
    const cols = this.mapData[0].length;

    console.log('MazeRenderer: Processing maze', rows, 'x', cols); // Debug info

    let wallCount = 0;
    let dotCount = 0;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const char = this.mapData[row][col];
        const tile = this.createTile(char, row, col, rows, cols);
        if (tile) {
          mazeContainer.appendChild(tile);

          // Count different tile types
          if (char === '=') wallCount++;
          if (char === '.') dotCount++;
        }
      }
    }

    console.log(`Created ${wallCount} walls and ${dotCount} dots`);
    console.log('Maze container children:', mazeContainer.children.length);

    containerElement.appendChild(mazeContainer);

    // AGENT_MOD: Store reference for syncing
    this.mazeContainer = mazeContainer;

    return mazeContainer;
  }

  // Create individual tile element based on character
  createTile(char, row, col, totalRows, totalCols) {
    const tile = document.createElement('div');
    tile.className = `maze-tile maze-tile-${char}`;

    // AGENT_MOD: Add data attributes for syncing
    tile.setAttribute('data-row', row);
    tile.setAttribute('data-col', col);

    // Position the tile
    tile.style.cssText = `
      position: absolute;
      left: ${col * this.tileSize}px;
      top: ${row * this.tileSize}px;
      width: ${this.tileSize}px;
      height: ${this.tileSize}px;
    `;

    // Style based on character type
    switch (char) {
      case '=': // Wall
        this.styleWall(tile, row, col, totalRows, totalCols);
        break;
      case '.': // Dot
        this.styleDot(tile);
        break;
      case '*': // Power pill
        this.stylePill(tile);
        break;
      case 't': // Tunnel - AGENT_MOD: Leave tunnels as empty space, no styling
        return null;
      case 'h': // Ghost house
        this.styleGhostHouse(tile);
        break;
      case '-': // Empty space - AGENT_MOD: Don't render anything for empty space
        return null;
      default:
        return null; // Don't render unknown characters
    }

    return tile;
  }

  // Style wall tiles with borders for classic Pac-Man look
  styleWall(tile, row, col, totalRows, totalCols) {
    // AGENT_MOD: Simple solid wall approach with proper sizing
    tile.style.cssText += `
      background-color: transparent;
    `;

    // Create wall element as child (similar to dots)
    const wall = document.createElement('div');
    wall.style.cssText = `
      width: ${this.tileSize - 12}px;
      height: ${this.tileSize - 12}px;
      background-color: ${this.colors.wall};
      border: 1px solid ${this.colors.wallBorder};
      box-sizing: border-box;
      position: absolute;
      top: 5px;
      left: 5px;
      z-index: -1;
      border-radius: 2px;
    `;

    tile.appendChild(wall);
    console.log(
      `Wall element created at ${row},${col} with size ${this.tileSize - 10}px`
    );
  }

  // Determine wall corner styling based on adjacent walls
  getWallCorners(row, col, totalRows, totalCols) {
    // Check adjacent tiles to determine which corners should be rounded
    const hasTopWall = row > 0 && this.mapData[row - 1][col] === '=';
    const hasBottomWall =
      row < totalRows - 1 && this.mapData[row + 1][col] === '=';
    const hasLeftWall = col > 0 && this.mapData[row][col - 1] === '=';
    const hasRightWall =
      col < this.mapData[row].length - 1 && this.mapData[row][col + 1] === '=';

    // Simple corner rounding for isolated walls
    if (!hasTopWall && !hasBottomWall && !hasLeftWall && !hasRightWall) {
      return '50%'; // Completely isolated - make circular
    }

    return '2px'; // Default small radius
  }

  // Style dot tiles
  styleDot(tile) {
    tile.style.cssText += `
      background-color: transparent;
    `;

    // Create dot element
    const dot = document.createElement('div');
    dot.className = 'dynamic-dot'; // AGENT_MOD: Add class for identification
    dot.style.cssText = `
      width: 4px;
      height: 4px;
      background-color: ${this.colors.dot};
      border-radius: 50%;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      animation: dotPulse 2s ease-in-out infinite;
    `;

    tile.appendChild(dot);

    // AGENT_MOD: Store reference for dynamic removal
    tile.dynamicDot = dot;
  }

  // Style power pill tiles
  stylePill(tile) {
    tile.style.cssText += `
      background-color: transparent;
    `;

    // Create pill element
    const pill = document.createElement('div');
    pill.className = 'dynamic-pill'; // AGENT_MOD: Add class for identification
    pill.style.cssText = `
      width: 12px;
      height: 12px;
      background-color: ${this.colors.pill};
      border-radius: 50%;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      animation: pillPulse 1s ease-in-out infinite;
      box-shadow: 0 0 8px ${this.colors.pill};
    `;

    tile.appendChild(pill);

    // AGENT_MOD: Store reference for dynamic removal
    tile.dynamicPill = pill;
  }

  // Style ghost house
  styleGhostHouse(tile) {
    tile.style.backgroundColor = this.colors.ghostHouse;
    tile.style.border = `1px solid ${this.colors.wallBorder}`;
    tile.style.opacity = '0.3';
  }

  // Clear existing maze elements
  clearMaze(containerElement) {
    const existingMaze = containerElement.querySelector(
      '.dynamic-maze-container'
    );
    if (existingMaze) {
      existingMaze.remove();
    }
  }

  // Update maze when map data changes
  updateMaze(containerElement, newMapData) {
    this.mapData = newMapData;
    this.renderMaze(containerElement);
  }

  // Add CSS animations for dots and pills
  static addAnimationCSS() {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes dotPulse {
        0%, 100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        50% { opacity: 0.6; transform: translate(-50%, -50%) scale(1.2); }
      }
      
      @keyframes pillPulse {
        0%, 100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        50% { opacity: 0.8; transform: translate(-50%, -50%) scale(1.1); }
      }
      
      .maze-tile {
        transition: all 0.1s ease;
      }
      
      .maze-tile:hover {
        filter: brightness(1.2);
      }
    `;
    document.head.appendChild(style);
  }

  // AGENT_MOD: Sync dynamic dots with game tile system
  syncWithGameTiles(mapTiles) {
    if (!this.mazeContainer) return;

    // Find all dynamic dots and pills in the maze
    const dynamicDots = this.mazeContainer.querySelectorAll('.dynamic-dot');
    const dynamicPills = this.mazeContainer.querySelectorAll('.dynamic-pill');

    // Update visibility based on game tile state
    mapTiles.forEach((tile, index) => {
      const row = Math.floor(index / this.mapData[0].length);
      const col = index % this.mapData[0].length;

      // Find corresponding dynamic element
      const tileElement = this.mazeContainer.querySelector(
        `.maze-tile[data-row="${row}"][data-col="${col}"]`
      );

      if (tileElement) {
        const dynamicDot = tileElement.querySelector('.dynamic-dot');
        const dynamicPill = tileElement.querySelector('.dynamic-pill');

        // Hide dots/pills that have been eaten
        if (tile.code === '.' && !tile.item) {
          if (dynamicDot) dynamicDot.style.display = 'none';
        }
        if (tile.code === '*' && !tile.item) {
          if (dynamicPill) dynamicPill.style.display = 'none';
        }
      }
    });
  }
}
