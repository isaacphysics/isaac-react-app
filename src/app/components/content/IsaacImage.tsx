import React from 'react';
import {ImageDTO} from "../../../IsaacApiTypes";
import {apiHelper} from "../../services/api";
import {IsaacContentValueOrChildren} from "./IsaacContentValueOrChildren";

interface IsaacImageProps {
    doc: ImageDTO;
}

export const IsaacImage = ({doc}: IsaacImageProps) => {
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
