import {generatePolygon, SVGShapeProps} from "./SVGUtils";
import { useTranslation } from 'react-i18next'

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
    const { t } = useTranslation()
    const {width, height} = props;
    const points = t('00Width0Width2Height0Height2', '0 0, {{width}} 0, {{width2}} {{height}}, 0 {{height2}}', { width, width2: width, height, height2: height });
    const perimeter = 2 * (width + height);
    return generatePolygon(props, points, perimeter);
}
