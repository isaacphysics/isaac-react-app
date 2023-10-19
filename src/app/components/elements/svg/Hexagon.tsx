import { generatePolygon, SVGShapeProps } from "./SVGUtils";

export interface HexagonProportions {
  halfWidth: number;
  quarterHeight: number;
  padding: number;
}
export function calculateHexagonProportions(unitLength: number, padding: number): HexagonProportions {
  return {
    halfWidth: unitLength,
    quarterHeight: unitLength / Math.sqrt(3),
    padding: padding,
  };
}

function generateHexagonPoints(halfWidth: number, quarterHeight: number) {
  return (
    "" +
    1 * halfWidth +
    " " +
    0 * quarterHeight +
    ", " +
    2 * halfWidth +
    " " +
    1 * quarterHeight +
    ", " +
    2 * halfWidth +
    " " +
    3 * quarterHeight +
    ", " +
    1 * halfWidth +
    " " +
    4 * quarterHeight +
    ", " +
    0 * halfWidth +
    " " +
    3 * quarterHeight +
    ", " +
    0 * halfWidth +
    " " +
    1 * quarterHeight
  );
}

export interface HexagonProps<T> extends SVGShapeProps<T> {
  halfWidth: number;
  quarterHeight: number;
}

export function Hexagon<T>(props: HexagonProps<T>) {
  const { halfWidth, quarterHeight } = props;
  const points = generateHexagonPoints(halfWidth, quarterHeight);
  const perimeter = 6 * 2 * quarterHeight;
  return generatePolygon(props, points, perimeter);
}
