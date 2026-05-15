import classNames from "classnames";
import React, { useState } from "react";
import { InputGroup } from "reactstrap";

interface ToggleState<T> {
    value: T;
    icon: string;
}

interface StyledMultiToggleProps<T> {
    states: ToggleState<T>[];
    initialValue: T;
    onChange?: (value: T) => void;
}

const StyledMultiToggle = <T,>({ states, initialValue, onChange }: StyledMultiToggleProps<T>) => {
    const [value, setValue] = useState<typeof states[number]['value']>(initialValue);

    return <InputGroup className="styled-triple-toggle">
        {states.map((state, index) => (
            <button key={index} 
                className={classNames("toggle-button py-0 px-2 flex-grow-1 vertical-center", {"bg-primary": value === state.value})} 
                onClick={() => {
                    setValue(state.value);
                    onChange?.(state.value);
                }}
            >
                <i className={classNames("icon", state.icon, {"icon-color-white": value === state.value})} />
            </button>
        ))}
    </InputGroup>;
};

export const StyledTripleToggle = ({onChange, initialValue = undefined}: Omit<StyledMultiToggleProps<boolean | undefined>, "states">) => StyledMultiToggle({
    states: [
        { value: false, icon: "icon-cross" },
        { value: undefined, icon: "icon-dash" },
        { value: true, icon: "icon-tick" }
    ],
    initialValue,
    onChange
});
