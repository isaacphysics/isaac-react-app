import React, { useContext, useEffect, useRef, useState } from 'react';
import {FigureDTO} from "../../../IsaacApiTypes";
import {apiHelper} from "../../services";
import {IsaacContentValueOrChildren} from "./IsaacContentValueOrChildren";
import {ClozeDropRegionContext, FigureNumberingContext} from "../../../IsaacAppTypes";
import {Markup} from "../elements/markup";
import InlineDropRegion from '../elements/markup/portals/InlineDropZones';
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

    // TODO: if the image fails to load, you can't answer the question
    const clozeContext = useContext(ClozeDropRegionContext);
    const clozeDropRootElement = useRef<HTMLDivElement>(null);

    return <div className="figure-panel">
        <FigureNumberingContext.Consumer>
            {figureNumbers => {
                const figureString = figId && Object.keys(figureNumbers).includes(figId) ?
                    `Figure\u00A0${figureNumbers[figId]}` : "Figure";
                return <figure>
                    <div className="w-100 d-flex justify-content-center" ref={clozeDropRootElement}>
                        <div className="position-relative w-max-content">
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
                            {doc.dropZones && clozeContext && path && doc.dropZones.map((dropZone, i) => {
                                const index = dropZone.index ?? clozeContext.zoneIds.size + i;
                                const dropZoneElement = document.getElementById(`figure-drop-target-${index}`);
                                return <div 
                                    className="position-absolute" id={`figure-drop-target-${index}`} key={i}
                                    // style={{left: `calc(16px + ${dropZone.left}% - ${(100 + 16) * dropZone.left/100}px)`, top: `calc(32px + ${dropZone.top}% - ${(34 + 16) * dropZone.top/100}px)`}}
                                    style={{
                                        left: `calc(16px + ${dropZone.left}% - ((${dropZoneElement?.clientWidth}px + 16px + 16px) * ${(dropZone.left)/100})`, 
                                        top: `calc(8px + 16px + ${dropZone.top}% - ((${dropZoneElement?.clientHeight}px + 32px + 16px) * ${(dropZone.top)/100})`
                                    }}
                                >
                                    <InlineDropRegion 
                                        id={`figure-drop-target-${index}`}
                                        index={index}
                                        emptyWidth={dropZone.minWidth.endsWith("px") ? dropZone.minWidth.replace("px", "") : undefined}
                                        emptyHeight={dropZone.minHeight.endsWith("px") ? dropZone.minHeight.replace("px", "") : undefined}
                                        rootElement={clozeDropRootElement.current || undefined}
                                    />
                                </div>; 
                            })}

                            {!doc.clickUrl && <img src={path} alt={doc.altText} />}
                            {doc.clickUrl && <a href={doc.clickUrl}><img src={path} alt={doc.altText} /></a>}
                        </div>
                    </div>
                    <IsaacFigureCaption doc={doc} figId={figId} figureString={figureString} />
                </figure>;
            }}
        </FigureNumberingContext.Consumer>
    </div>;
};
