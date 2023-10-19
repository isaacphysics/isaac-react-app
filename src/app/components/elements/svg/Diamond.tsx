import { generatePolygon, SVGShapeProps } from "./SVGUtils";

export interface DiamondProportions {
  halfWidth: number;
  halfHeight: number;
  padding: number;
}

export function generateDiamondProportions(halfWidth: number, halfHeight: number, padding: number): DiamondProportions {
  return {
    halfWidth: halfWidth,
    halfHeight: halfHeight,
    padding: padding,
  };
}

interface DiamondProps<T> extends SVGShapeProps<T> {
  halfWidth: number;
  halfHeight: number;
}

export function Diamond<T>(props: DiamondProps<T>) {
  const { halfWidth, halfHeight } = props;
  const points = `${halfWidth} 0, ${2 * halfHeight} ${halfHeight}, ${halfWidth} ${2 * halfHeight}, 0 ${halfHeight}`;
  const perimeter = halfWidth * halfHeight * 2;
  return generatePolygon(props, points, perimeter);
}
