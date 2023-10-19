import { generatePolygon, SVGShapeProps } from "./SVGUtils";

export interface OctagonProportions {
  halfWidth: number;
  halfHeight: number;
  padding: number;
}
export function calculateOctagonProportions(unitLength: number, padding: number): OctagonProportions {
  return {
    halfWidth: unitLength,
    halfHeight: unitLength,
    padding: padding,
  };
}

function generateOctagonPoints(halfWidth: number, halfHeight: number) {
  const root2over2 = 0.70710678118;
  return (
    "" +
    halfWidth +
    " " +
    0 +
    ", " +
    halfWidth * (1 + root2over2) +
    " " +
    halfHeight * (1 - root2over2) +
    ", " +
    2 * halfWidth +
    " " +
    halfHeight +
    ", " +
    halfWidth * (1 + root2over2) +
    " " +
    halfHeight * (1 + root2over2) +
    ", " +
    halfWidth +
    " " +
    2 * halfHeight +
    ", " +
    halfWidth * (1 - root2over2) +
    " " +
    halfHeight * (1 + root2over2) +
    ", " +
    0 +
    " " +
    halfHeight +
    ", " +
    halfWidth * (1 - root2over2) +
    " " +
    halfHeight * (1 - root2over2)
  );
}

interface OctagonProps<T> extends SVGShapeProps<T> {
  halfWidth: number;
  halfHeight: number;
}

export function Octagon<T>(props: OctagonProps<T>) {
  const { halfWidth, halfHeight } = props;
  const points = generateOctagonPoints(halfWidth, halfHeight);
  const perimeter = 2 * halfWidth * 0.38268343236; // ~= sin(pi/8)
  return generatePolygon(props, points, perimeter);
}
