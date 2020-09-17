import React from "react";
import {IsaacCard} from "./IsaacCard";
import {IsaacCardDeckDTO} from "../../../IsaacApiTypes";

interface IsaacCardDeckProps {
    doc: IsaacCardDeckDTO,
    className?: string
}

export const IsaacCardDeck = ({doc, className}: IsaacCardDeckProps) => {
    const classNameString: string = className !== undefined ? className : "";
    return <div className={"card-deck isaac-cards-body " + classNameString}>
        {doc?.cards?.map((props, i) => <IsaacCard key={i} doc={props}/>)}
    </div>
};