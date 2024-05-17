import React from 'react';
import {ImageDTO} from "../../../IsaacApiTypes";
import {apiHelper} from "../../services";
import {IsaacContentValueOrChildren} from "./IsaacContentValueOrChildren";
import {Markup} from "../elements/markup";

interface IsaacImageProps {
    doc: ImageDTO;
}

export const IsaacImage = ({doc}: IsaacImageProps) => {
    const path = doc.src && apiHelper.determineImageUrl(doc.src);

    return <div className="figure-panel">
        <figure>
            <div className="text-center">
                {!doc.clickUrl && <img src={path} alt={doc.altText} />}
                {doc.clickUrl && <a href={doc.clickUrl}><img src={path} alt={doc.altText} /></a>}
            </div>
            <div className="text-center figure-caption">
                <IsaacContentValueOrChildren encoding={doc.encoding} value={doc.value}>
                    {doc.children}
                </IsaacContentValueOrChildren>
                {doc.attribution && <span className="text-muted">
                    <Markup trusted-markup-encoding={"markdown"}>
                        {doc.attribution}
                    </Markup>
                </span>}
            </div>
        </figure>
    </div>;
};
