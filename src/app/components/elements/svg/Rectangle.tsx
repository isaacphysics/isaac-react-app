import { generatePolygon, SVGShapeProps } from "./SVGUtils";

export interface RectangleProportions {
  width: number;
  height: number;
  padding: number;
}

export function generateSquareProportions(sideLength: number, padding: number): RectangleProportions {
  return {
    width: sideLength,
    height: sideLength,
    padding: padding,
  };
}

interface RectangleProps<T> extends SVGShapeProps<T> {
  width: number;
  height: number;
}

export function Rectangle<T>(props: RectangleProps<T>) {
  const { width, height } = props;
  const points = `0 0, ${width} 0, ${width} ${height}, 0 ${height}`;
  const perimeter = 2 * (width + height);
  return generatePolygon(props, points, perimeter);
}
