import {useState} from "react";

export function usePageSettings() {
    const [colourBlind, setColourBlind] = useState(false);
    const [formatAsPercentage, setFormatAsPercentage] = useState(false);

    const pageSettings = {colourBlind, setColourBlind, formatAsPercentage, setFormatAsPercentage};
    return pageSettings;
}
