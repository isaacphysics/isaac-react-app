import React from "react";
import * as RS from "reactstrap";
import Select, {ValueType} from "react-select";
import {TAG_ID} from "../../../services/constants";

interface Item<T> {value: T; label: string;}
export interface Tier {id: string; name: string; for: string}
function unwrapValue<T>(f: React.Dispatch<React.SetStateAction<Item<T>[]>>) {
    return (value: ValueType<Item<T>>) => f(Array.isArray(value) ? value : !value ? [] : [value]);
}

interface HierarchyFilterProps {
    tiers: Tier[];
    choices: Item<TAG_ID>[][];
    selections: Item<TAG_ID>[][];
    setTierSelection: (tierIndex: number) => React.Dispatch<React.SetStateAction<Item<TAG_ID>[]>>
}
export function HierarchyFilter({tiers, choices, selections, setTierSelection}: HierarchyFilterProps) {
    return <React.Fragment>
        {tiers.map((tier, i) => <React.Fragment key={tier.for}>
            <RS.Label for={tier.for} className="pt-2 pb-0">{tier.name}: </RS.Label>
            <Select name={tier.for} onChange={unwrapValue(setTierSelection(i))} isMulti={true} options={choices[i]} value={selections[i]} />
        </React.Fragment>)}
    </React.Fragment>;
}
