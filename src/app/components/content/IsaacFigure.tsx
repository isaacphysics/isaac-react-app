import React from 'react';
import {FigureDTO} from "../../../IsaacApiTypes";
import {apiHelper} from "../../services/api";
import {IsaacContentValueOrChildren} from "./IsaacContentValueOrChildren";
import {FigureNumberingContext} from "../../../IsaacAppTypes";
import {TrustedMarkdown} from "../elements/TrustedMarkdown";

interface IsaacFigureProps {
    doc: FigureDTO;
}

export function extractFigureId(id: string) {
    return id.replace(/.*?([^|]*)$/g, '$1');
}

export const IsaacFigure = ({doc}: IsaacFigureProps) => {
    const path = doc.src && apiHelper.determineImageUrl(doc.src);

    const figId = doc.id && extractFigureId(doc.id);

    return <div className="figure_panel">
        <FigureNumberingContext.Consumer>
            {figureNumbers => <figure>
                <div className="text-center">
                    {!doc.clickUrl && <img src={path} alt={doc.altText} />}
                    {doc.clickUrl && <a href={doc.clickUrl}><img src={path} alt={doc.altText} /></a>}
                </div>
                <div className="text-center figure-caption">
                    {doc.children && doc.children.length > 0 && figId && <div><strong className="text-secondary">Figure&nbsp;{figureNumbers[figId]}</strong></div>}
                    <IsaacContentValueOrChildren encoding={doc.encoding} value={doc.value && figId && `<strong class="text-secondary">Figure&nbsp;${figureNumbers[figId]}:</strong> ${doc.value}`}>
                        {doc.children}
                    </IsaacContentValueOrChildren>
                    {doc.attribution && <span className="text-muted"><TrustedMarkdown markdown={doc.attribution}/></span>}
                </div>
            </figure>}
        </FigureNumberingContext.Consumer>
    </div>;
};
