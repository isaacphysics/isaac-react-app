import React from 'react';
import {FigureDTO} from "../../../IsaacApiTypes";
import {apiHelper} from "../../services";
import {IsaacContentValueOrChildren} from "./IsaacContentValueOrChildren";
import {FigureNumberingContext} from "../../../IsaacAppTypes";
import {Markup} from "../elements/markup";
import { closeActiveModal, openActiveModal, useAppDispatch } from '../../state';
import { FigureModal } from './IsaacImage';

interface IsaacFigureProps {
    doc: FigureDTO;
}

export function extractFigureId(id: string) {
    return id.replace(/.*?([^|]*)$/g, '$1');
}

const IsaacFigureCaption = ({doc, figId, figureString}: {doc: FigureDTO, figId?: string, figureString?: string}) => {
    return <figcaption className="text-center figure-caption">
        {doc.children && doc.children.length > 0 && figId && <div>
            <strong className="text-theme figure-reference">{figureString}</strong>
        </div>}
        <IsaacContentValueOrChildren
            encoding={doc.encoding}
            value={doc.value && figId && `<strong class="text-theme figure-reference">${figureString}:</strong> ${doc.value}`}
        >
            {doc.children}
        </IsaacContentValueOrChildren>
        {doc.attribution && <span className="text-muted">
            <Markup trusted-markup-encoding={"markdown"}>
                {doc.attribution}
            </Markup>
        </span>}
    </figcaption>;
};

export const IsaacFigure = ({doc}: IsaacFigureProps) => {
    const dispatch = useAppDispatch();
    const path = doc.src && apiHelper.determineImageUrl(doc.src);

    const figId = doc.id && extractFigureId(doc.id);

    return <div className="figure-panel">
        <FigureNumberingContext.Consumer>
            {figureNumbers => {
                const figureString = figId && Object.keys(figureNumbers).includes(figId) ?
                    `Figure\u00A0${figureNumbers[figId]}` : "Figure";
                return <figure>
                    <div className="text-center position-relative">
                        <button className="figure-fullscreen" onClick={() => {
                            dispatch(openActiveModal(FigureModal({
                                path, 
                                altText: doc.altText,
                                caption: <IsaacFigureCaption doc={doc} figId={figId} figureString={figureString} />,
                                toggle: () => dispatch(closeActiveModal())
                            })));
                        }}>
                            <i className="icon icon-fullscreen icon-md" />
                        </button>
                        {!doc.clickUrl && <img src={path} alt={doc.altText} />}
                        {doc.clickUrl && <a href={doc.clickUrl}><img src={path} alt={doc.altText} /></a>}
                    </div>
                    <IsaacFigureCaption doc={doc} figId={figId} figureString={figureString} />
                </figure>;
            }}
        </FigureNumberingContext.Consumer>
    </div>;
};
