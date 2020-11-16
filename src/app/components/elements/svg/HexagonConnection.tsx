import React from "react";
import {addHexagonKeyPoints, svgLine, svgMoveTo} from "../../../services/svg";

export function calculateConnectionLine(
    hexagonProperties: {halfWidth: number; quarterHeight: number; padding: number},
    sourceIndex: number, targetIndex: number
) {
    const hexagon = addHexagonKeyPoints(hexagonProperties);
    let result = '';

    let hexagonWidth = 2 * (hexagon.halfWidth + hexagon.padding);

    let sourceHexagonX = (sourceIndex <= targetIndex ? sourceIndex * hexagonWidth : Math.max(sourceIndex - 1, 0) * hexagonWidth);
    let targetHexagonX = (targetIndex <= sourceIndex ? targetIndex * hexagonWidth : Math.max(targetIndex - 1, 0) * hexagonWidth);

    // First stroke
    if (sourceIndex <= targetIndex) {
        result += svgMoveTo(sourceHexagonX + hexagon.x.left, hexagon.y.top);
    } else {
        result += svgMoveTo(sourceHexagonX + hexagon.x.right, hexagon.y.top);
    }
    result += svgLine(sourceHexagonX + hexagon.x.center, hexagon.y.center);

    // Horizontal connection
    if (Math.abs(sourceIndex - targetIndex) > 1) {
        result += svgLine(targetHexagonX + hexagon.x.center, hexagon.y.center);
    }

    // Last stroke
    if (targetIndex <= sourceIndex) {
        result += svgLine(targetHexagonX + hexagon.x.left, hexagon.y.bottom);
    } else {
        result += svgLine(targetHexagonX + hexagon.x.right, hexagon.y.bottom);
    }

    return result;
}

interface HexagonConnectionProps {
    sourceIndex: number;
    targetIndex: number;
    hexagonProportions: {
        halfWidth: number;
        quarterHeight: number;
        padding: number;
    }
    connectionProperties: {
        fill: string;
        stroke: string;
        strokeWidth: number;
        strokeDasharray: number;
    }
}
export function HexagonConnection({sourceIndex, targetIndex, hexagonProportions, connectionProperties}: HexagonConnectionProps) {
    if ([sourceIndex, targetIndex].includes(-1)) {
        return <React.Fragment />;
    }
    return <path
        d={calculateConnectionLine(hexagonProportions, sourceIndex, targetIndex)}
        {...connectionProperties}
    />;
}
