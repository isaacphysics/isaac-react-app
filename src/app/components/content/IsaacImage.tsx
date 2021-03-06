import React from 'react';
import {ImageDTO} from "../../../IsaacApiTypes";
import {apiHelper} from "../../services/api";
import {IsaacContentValueOrChildren} from "./IsaacContentValueOrChildren";
import {TrustedMarkdown} from "../elements/TrustedMarkdown";

interface IsaacImageProps {
    doc: ImageDTO;
}

export const IsaacImage = ({doc}: IsaacImageProps) => {
    const path = doc.src && apiHelper.determineImageUrl(doc.src);

    return <div className="figure_panel">
        <figure>
            <div className="text-center">
                {!doc.clickUrl && <img src={path} alt={doc.altText} />}
                {doc.clickUrl && <a href={doc.clickUrl}><img src={path} alt={doc.altText} /></a>}
            </div>
            <div className="text-center figure-caption">
                <IsaacContentValueOrChildren encoding={doc.encoding} value={doc.value}>
                    {doc.children}
                </IsaacContentValueOrChildren>
                {doc.attribution && <span className="text-muted"><TrustedMarkdown markdown={doc.attribution}/></span>}
            </div>
        </figure>
    </div>;
};
