import React from 'react';
import {FigureDTO} from "../../../IsaacApiTypes";
import {apiHelper} from "../../services/api";
import {IsaacContentValueOrChildren} from "./IsaacContentValueOrChildren";

interface IsaacFigureProps {
    doc: FigureDTO;
}

// TODO add figure counting and linking
export const IsaacFigure = ({doc}: IsaacFigureProps) => {
    const path = doc.src && apiHelper.determineImageUrl(doc.src);

    return <div>
        <figure>
            <div className="text-center">
                {!doc.clickUrl && <img src={path} alt={doc.altText} />}
                {doc.clickUrl && <a href={doc.clickUrl}><img src={path} alt={doc.altText} /></a>}
            </div>
        </figure>
        <div className="text-center caption">
            <IsaacContentValueOrChildren encoding={doc.encoding} value={doc.value}>
                {doc.children}
            </IsaacContentValueOrChildren>
        </div>
    </div>;
};
