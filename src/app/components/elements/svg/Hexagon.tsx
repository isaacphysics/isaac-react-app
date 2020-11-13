import React from "react"

function generateHexagonPoints(halfWidth: number, quarterHeight: number) {
    return '' + 1 * halfWidth + ' ' + 0 * quarterHeight +
        ', ' + 2 * halfWidth + ' ' + 1 * quarterHeight +
        ', ' + 2 * halfWidth + ' ' + 3 * quarterHeight +
        ', ' + 1 * halfWidth + ' ' + 4 * quarterHeight +
        ', ' + 0 * halfWidth + ' ' + 3 * quarterHeight +
        ', ' + 0 * halfWidth + ' ' + 1 * quarterHeight;
}

function calculateDashArray<T>(elements: T[] | undefined, evaluator: (t: T) => boolean, perimeterLength: number) {
    if (elements === undefined) {
        return null;
    }
    let sectionLength = perimeterLength / elements.length;
    let recordingDash = true;
    let lengthCollector = 0;
    let dashArray = [];
    for (let element of elements) {
        let shouldRecordDash = evaluator(element);
        if (shouldRecordDash === recordingDash) {
            lengthCollector += sectionLength;
        } else {
            dashArray.push(lengthCollector);
            recordingDash = !recordingDash;
            lengthCollector = sectionLength;
        }
    }
    dashArray.push(lengthCollector);
    return dashArray.join(',');
}

interface HexagonProps<T> {
    states?: T[],
    selector?: (t: T) => boolean,
    halfWidth: number,
    quarterHeight: number,
    properties: {
        fill: {colour: string},
        stroke: { colour: string; width: number },
        clickable?: boolean
    },
}
export function Hexagon<T>({halfWidth, quarterHeight, properties, states, selector = () => true}: HexagonProps<T>) {
    let polygonAttributes: {strokeWidth: number; fill: string; stroke: string; points: string; strokeDasharray?: string; pointerEvents?: string} = {
        points: generateHexagonPoints(halfWidth, quarterHeight),
        stroke: properties.stroke.colour,
        strokeWidth: properties.stroke.width,
        fill: properties.fill.colour,
    };
    const perimeter = 6 * 2 * (quarterHeight);
    const dashArray = calculateDashArray(states, selector, perimeter);
    if (dashArray) {
        polygonAttributes.strokeDasharray = dashArray;
    }
    if (properties.clickable) {
        polygonAttributes.pointerEvents = 'visible';
    }
    return <polygon {...polygonAttributes} />;
}
