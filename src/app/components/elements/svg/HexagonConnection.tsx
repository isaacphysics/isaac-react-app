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
        result += svgMoveTo(sourceHexagonX + hexagon.x.leftDiag, hexagon.y.topDiag);
    } else {
        result += svgMoveTo(sourceHexagonX + hexagon.x.rightDiag, hexagon.y.topDiag);
    }
    result += svgLine(sourceHexagonX + hexagon.x.center, hexagon.y.center);

    // Horizontal connection
    if (Math.abs(sourceIndex - targetIndex) > 1) {
        result += svgLine(targetHexagonX + hexagon.x.center, hexagon.y.center);
    }

    // Last stroke
    if (targetIndex <= sourceIndex) {
        result += svgLine(targetHexagonX + hexagon.x.leftDiag, hexagon.y.bottomDiag);
    } else {
        result += svgLine(targetHexagonX + hexagon.x.rightDiag, hexagon.y.bottomDiag);
    }

    return result;
}

interface HexagonConnectionProps {
    sourceIndex: number;
    optionIndices?: number[];
    targetIndices: number[];
    hexagonProportions: {
        halfWidth: number;
        quarterHeight: number;
        padding: number;
    };
    connectionProperties: React.SVGProps<SVGPathElement> & {
        optionStrokeColour?: string;
    };
}
export function HexagonConnection({sourceIndex, targetIndices, hexagonProportions, connectionProperties, optionIndices=[]}: HexagonConnectionProps) {
    const filteredTargetIndices = targetIndices.filter(i => ![sourceIndex, i].includes(-1)); // Filter "not found" selections
    const {optionStrokeColour, ...pathProperties} = connectionProperties;
    return <g>
        {optionIndices.filter(o => !targetIndices.includes(o)).map(optionIndex => <path
            d={calculateConnectionLine(hexagonProportions, sourceIndex, optionIndex)}
            {...{...pathProperties, stroke: optionStrokeColour}} key={`${sourceIndex}->${optionIndex}`}
        />)}
        {filteredTargetIndices.map(targetIndex => <path
            d={calculateConnectionLine(hexagonProportions, sourceIndex, targetIndex)}
            {...pathProperties} key={`${sourceIndex}->${targetIndex}`}
        />)}
    </g>;
}
