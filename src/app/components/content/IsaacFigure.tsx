import React, { useContext, useRef, useState } from 'react';
import {FigureDTO} from "../../../IsaacApiTypes";
import {apiHelper} from "../../services";
import {IsaacContentValueOrChildren} from "./IsaacContentValueOrChildren";
import {DragAndDropRegionContext, FigureNumberingContext, InlineContext} from "../../../IsaacAppTypes";
import {Markup} from "../elements/markup";
import InlineDropRegion from '../elements/markup/portals/InlineDropZones';
import { closeActiveModal, openActiveModal, useAppDispatch } from '../../state';
import { FigureModal } from './IsaacImage';
import InlineEntryZoneBase from '../elements/markup/portals/InlineEntryZone';

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
    const dropRegionContext = useContext(DragAndDropRegionContext);
    const inlineRegionContext = useContext(InlineContext);
    const clozeDropRootElement = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);

    return <div className="figure-panel">
        <FigureNumberingContext.Consumer>
            {figureNumbers => {
                const figureString = figId && Object.keys(figureNumbers).includes(figId) ?
                    `Figure\u00A0${figureNumbers[figId]}` : "Figure";
                return <figure>
                    <div className="w-100 d-flex justify-content-center p-3 pb-5" ref={clozeDropRootElement}>
                        <div className="position-relative w-max-content">
                            <button className="figure-fullscreen" aria-label="Expand figure" onClick={() => {
                                dispatch(openActiveModal(FigureModal({
                                    path, 
                                    altText: doc.altText,
                                    caption: <IsaacFigureCaption doc={doc} figId={figId} figureString={figureString} />,
                                    toggle: () => dispatch(closeActiveModal())
                                })));
                            }}>
                                <i className="icon icon-fullscreen icon-md" />
                            </button>
                            {doc.dropZones && (dropRegionContext || inlineRegionContext) && path && doc.dropZones.map((dropZone, i) => {
                                const zoneId = dropZone.id;
                                const parentId = dropRegionContext ? `figure-drop-target-${zoneId}` : `inline-question-${zoneId}`;
                                const parentElement = document.getElementById(parentId);

                                return <div 
                                    className="position-absolute" id={parentId} key={i}
                                    style={{
                                        left: `calc(${dropZone.left}% - (max(${parentElement?.clientWidth}px, ${dropZone.minWidth}) * ${(dropZone.left)/100})`,
                                        top: `calc(${dropZone.top}% - (${parentElement?.clientHeight}px * ${(dropZone.top)/100})`,
                                        width: dropZone.width ? `${dropZone.width}%` : undefined,
                                        minWidth: dropZone.minWidth,
                                        height: dropRegionContext ? "24px" : "34px",
                                    }}
                                >
                                    {dropRegionContext
                                        ? <InlineDropRegion 
                                            divId={parentId}
                                            zoneId={zoneId}
                                            emptyWidth="100%"
                                            emptyHeight="100%"
                                            rootElement={clozeDropRootElement.current || undefined}
                                        />
                                        : inlineRegionContext && <InlineEntryZoneBase
                                            inlineSpanId={parentId}
                                            className="figure-inline-region"
                                            width="100%"
                                            minWidth="100%" // on a figure, the input size is determined by the region size (i.e. the parent), so all sizes are 100%
                                            height="100%"
                                            root={clozeDropRootElement.current || document.body}
                                        />
                                    }

                                </div>; 
                            })}

                            {!doc.clickUrl && <img src={path} alt={doc.altText} ref={imageRef} />}
                            {doc.clickUrl && <a href={doc.clickUrl}><img src={path} alt={doc.altText} ref={imageRef} /></a>}
                        </div>
                    </div>
                    <IsaacFigureCaption doc={doc} figId={figId} figureString={figureString} />
                </figure>;
            }}
        </FigureNumberingContext.Consumer>
    </div>;
};
