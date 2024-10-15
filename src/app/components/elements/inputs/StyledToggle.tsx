import React from "react";

interface StyledToggleProps extends React.HTMLProps<HTMLInputElement> {
    falseLabel: string;
    trueLabel: string;
}

// this element acts as a <input type="checkbox"> element with custom styling. all props are passed to the input element.
const StyledToggle = ({falseLabel, trueLabel, ...rest}: StyledToggleProps) => {
    return <label className="styled-toggle">
        <input type="checkbox" {...rest}/>
        <span>{falseLabel}</span>
        <span>{trueLabel}</span>
    </label>;
};

export default StyledToggle;
