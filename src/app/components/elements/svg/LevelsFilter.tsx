import React from "react";
import Select from "react-select";
import * as RS from "reactstrap";
import {Item, unwrapValue} from "../../../services/select";

interface LevelsFilterProps {
    id: string;
    levelOptions: Item<number>[];
    levels: Item<number>[];
    setLevels: React.Dispatch<React.SetStateAction<Item<number>[]>>
}

export function LevelsFilterSelect({levelOptions, levels, setLevels, id}: LevelsFilterProps) {
    return <Select id={id} onChange={unwrapValue(setLevels)} isMulti value={levels} options={levelOptions} />
}
