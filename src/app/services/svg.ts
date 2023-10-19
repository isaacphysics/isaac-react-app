export function svgMoveTo(x: number, y: number) {
  return "M" + x + " " + y;
}

export function svgLine(x: number, y: number) {
  return "L" + x + " " + y;
}

export function addHexagonKeyPoints<T extends { halfWidth: number; quarterHeight: number }>(hexagon: T) {
  return {
    ...hexagon,
    x: {
      left: 0,
      leftDiag: (Math.sqrt(3) * hexagon.quarterHeight) / 2,
      center: hexagon.halfWidth,
      rightDiag: hexagon.halfWidth * 2 - (Math.sqrt(3) * hexagon.quarterHeight) / 2,
      right: hexagon.halfWidth * 2,
    },
    y: {
      top: 0,
      topDiag: hexagon.quarterHeight / 2,
      center: 2 * hexagon.quarterHeight,
      bottomDiag: (7 * hexagon.quarterHeight) / 2,
      bottom: 4 * hexagon.quarterHeight,
    },
  };
}
