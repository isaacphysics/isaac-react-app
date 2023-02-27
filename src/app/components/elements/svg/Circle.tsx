import React from "react";

interface CircleProps {
    radius: number;
    className?: string;
    properties?: {
        fill?: string;
        stroke?: { colour: string; width: number };
    };
}

export const Circle = ({radius, properties, className}: CircleProps) => {
    return <circle
        className={className}
        r={radius} cx={radius} cy={radius}
        fill={properties?.fill}
        stroke={properties?.stroke?.colour}
        strokeWidth={properties?.stroke?.width}
    />;
};
