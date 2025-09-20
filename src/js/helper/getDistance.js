// Distance between two tiles.
export default (tileA, tileB) => {
  // AGENT_MOD: Add safety checks for undefined tiles or missing coordinates
  if (
    !tileA ||
    !tileB ||
    typeof tileA.x === 'undefined' ||
    typeof tileA.y === 'undefined' ||
    typeof tileB.x === 'undefined' ||
    typeof tileB.y === 'undefined'
  ) {
    return Infinity; // Return large distance for invalid tiles
  }

  const x = tileA.x,
    x1 = tileB.x,
    y = tileA.y,
    y1 = tileB.y;
  return Math.sqrt(Math.pow(x - x1, 2) + Math.pow(y - y1, 2));
};
