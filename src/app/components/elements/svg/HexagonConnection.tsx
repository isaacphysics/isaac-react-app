import React from "react";
import { addHexagonKeyPoints, svgLine, svgMoveTo } from "../../../services";
import { HexagonProportions } from "./Hexagon";

function rightAngledConnectionLine(hexagonProperties: HexagonProportions, sourceIndex: number, targetIndex: number) {
  const hexagon = addHexagonKeyPoints(hexagonProperties);
  let result = "";
  const hexagonWidth = 2 * (hexagon.halfWidth + hexagon.padding);
  const sourceHexagonX = (sourceIndex - 1) * hexagonWidth;
  const targetHexagonX = (targetIndex - 1) * hexagonWidth;

  // First stroke
  result += svgMoveTo(sourceHexagonX + hexagon.x.right + hexagon.padding, hexagon.y.top + hexagon.quarterHeight);
  result += svgLine(sourceHexagonX + hexagon.x.right + hexagon.padding, hexagon.y.center);
  // Horizontal connection
  result += svgLine(targetHexagonX + hexagon.x.right + hexagon.padding, hexagon.y.center);
  // Last stroke
  result += svgLine(targetHexagonX + hexagon.x.right + hexagon.padding, hexagon.y.bottom - hexagon.quarterHeight);

  return result;
}

function fastTrackConnectionLine(hexagonProperties: HexagonProportions, sourceIndex: number, targetIndex: number) {
  const hexagon = addHexagonKeyPoints(hexagonProperties);
  let result = "";
  const hexagonWidth = 2 * (hexagon.halfWidth + hexagon.padding);
  const sourceHexagonX =
    sourceIndex <= targetIndex ? sourceIndex * hexagonWidth : Math.max(sourceIndex - 1, 0) * hexagonWidth;
  const targetHexagonX =
    targetIndex <= sourceIndex ? targetIndex * hexagonWidth : Math.max(targetIndex - 1, 0) * hexagonWidth;

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

function mobileConnectionLine(
  rowIndex: number | undefined,
  hexagonProperties: HexagonProportions,
  sourceIndex: number,
  targetIndex: number,
) {
  const hexagon = addHexagonKeyPoints(hexagonProperties);
  let result = "";
  let hexagonWidth = hexagon.x.right + 2 * hexagon.padding;

  if (rowIndex === 0) {
    const sourceHexagonX = sourceIndex * hexagonWidth;
    const targetHexagonY = hexagon.y.bottom + 2 * hexagon.padding + targetIndex * (hexagon.y.bottom + hexagon.padding);
    result += svgMoveTo(sourceHexagonX + hexagon.x.center, hexagon.y.bottom);

    // First stroke
    result += svgLine(sourceHexagonX + hexagon.x.center, hexagon.y.bottom + hexagon.padding);
    // Connections
    result += svgLine(hexagon.x.center, hexagon.y.bottom + hexagon.padding);
    result += svgLine(hexagon.x.center, targetHexagonY + hexagon.y.center);
    // Final stroke
    result += svgLine(hexagon.x.center + hexagon.padding, targetHexagonY + hexagon.y.center);
  } else {
    const sourceHexagonX = hexagon.x.center + hexagon.padding;
    const sourceHexagonY = hexagon.y.bottom + 2 * hexagon.padding + sourceIndex * (hexagon.y.bottom + hexagon.padding);
    const targetHexagonX = sourceHexagonX + hexagonWidth;
    const targetHexagonY = hexagon.y.bottom + 2 * hexagon.padding + targetIndex * (hexagon.y.bottom + hexagon.padding);
    const halfWayX = (targetHexagonX + sourceHexagonX + hexagon.x.right) / 2;

    // First stroke
    result += svgMoveTo(sourceHexagonX + hexagon.x.right, sourceHexagonY + hexagon.y.center);
    result += svgLine(halfWayX, sourceHexagonY + hexagon.y.center);
    // Connection
    result += svgLine(halfWayX, targetHexagonY + hexagon.y.center);
    // Final stroke
    result += svgLine(targetHexagonX, targetHexagonY + hexagon.y.center);
  }

  return result;
}

interface HexagonConnectionProps {
  sourceIndex: number;
  optionIndices?: number[];
  targetIndices: number[];
  hexagonProportions: HexagonProportions;
  connectionProperties: React.SVGProps<SVGPathElement> & { optionStrokeColour?: string };
  className?: string;
  mobile?: boolean;
  fastTrack?: boolean;
  rowIndex?: number;
}
export function HexagonConnection({
  sourceIndex,
  targetIndices,
  optionIndices = [],
  hexagonProportions,
  connectionProperties,
  className,
  fastTrack = false,
  mobile = false,
  rowIndex,
}: HexagonConnectionProps) {
  const filteredTargetIndices = targetIndices.filter((i) => ![sourceIndex, i].includes(-1)); // Filter "not found" selections
  const { optionStrokeColour, ...pathProperties } = connectionProperties;
  const connectionFunction = fastTrack
    ? fastTrackConnectionLine
    : mobile
    ? mobileConnectionLine.bind(null, rowIndex)
    : rightAngledConnectionLine;

  return (
    <g>
      {optionIndices
        .filter((o) => !targetIndices.includes(o))
        .map((optionIndex) => (
          <path
            className={`${className ?? ""}`}
            d={connectionFunction(hexagonProportions, sourceIndex, optionIndex)}
            {...{ ...pathProperties, stroke: optionStrokeColour }}
            key={`${sourceIndex}->${optionIndex}`}
          />
        ))}
      {filteredTargetIndices.map((targetIndex) => (
        <path
          className={`active ${className ?? ""}`}
          d={connectionFunction(hexagonProportions, sourceIndex, targetIndex)}
          {...pathProperties}
          key={`${sourceIndex}->${targetIndex}`}
        />
      ))}
    </g>
  );
}
