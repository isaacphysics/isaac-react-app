import {useState} from "react";

export function useAssignmentProgressAccessibilitySettings() {
    const [colourBlind, setColourBlind] = useState(false);
    const [formatAsPercentage, setFormatAsPercentage] = useState(false);
    return {colourBlind, setColourBlind, formatAsPercentage, setFormatAsPercentage};
}
