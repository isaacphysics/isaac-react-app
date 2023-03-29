import React from "react";

interface CircleProps {
    radius: number;
    offsetX?: number;
    offsetY?: number;
    className?: string;
    properties?: {
        fill?: string;
        stroke?: { colour: string; width: number };
    };
}

export const Circle = ({radius, offsetX=0, offsetY=0, properties, className}: CircleProps) => {
    return <circle
        className={className}
        r={radius} cx={radius + offsetX} cy={radius + offsetY}
        fill={properties?.fill}
        stroke={properties?.stroke?.colour}
        strokeWidth={properties?.stroke?.width}
    />;
};
