import React from "react";
import * as ApiTypes from "../../../IsaacApiTypes";
import {IsaacCard} from "./IsaacCard";

interface IsaacCardDeckProps {
    doc: ApiTypes.IsaacCardDeckDTO,
    className?: string
}

export const IsaacCardDeck = ({doc, className}: IsaacCardDeckProps) => {
    return <div className={"card-deck isaac-cards-body " + className}>
        {doc?.cards?.map((props, i) => <IsaacCard key={i} doc={props}/>)}
    </div>
};