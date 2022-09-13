import React from "react";

export interface SVGShapeProps<T> extends React.SVGProps<SVGPolygonElement> {
    states?: T[];
    selector?: (t: T) => boolean;
    children?: React.ReactNode;
    properties?: {
        fill?: {colour: string};
        stroke?: { colour: string; width: number };
        clickable?: boolean;
    };
}

export function calculateDashArray<T>(elements: T[] | undefined, evaluator: (t: T) => boolean, perimeterLength: number) {
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

export function generatePolygon<T>(props : SVGShapeProps<T>, points : string, perimeter : number) {
    const polygonAttributes: React.SVGProps<SVGPolygonElement> = {
        ...props,
        points: points,
        stroke: props.properties?.stroke?.colour,
        strokeWidth: props.properties?.stroke?.width,
        fill: props.properties?.fill?.colour,
        pointerEvents: props.properties?.clickable ? 'visible' : props.pointerEvents,
        strokeDasharray: calculateDashArray(props.states, props.selector || (() => true), perimeter) || props.strokeDasharray
    };
    // @ts-ignore Remove invalid polygon element properties to stop loads of console errors
    delete polygonAttributes.quarterHeight; delete polygonAttributes.halfWidth;
    return <polygon {...polygonAttributes}>
        {props.children}
    </polygon>;
}
