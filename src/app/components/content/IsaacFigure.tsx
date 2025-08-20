import React, { useContext, useRef, useState } from 'react';
import {FigureDTO} from "../../../IsaacApiTypes";
import {apiHelper} from "../../services";
import {IsaacContentValueOrChildren} from "./IsaacContentValueOrChildren";
import {DragAndDropRegionContext, FigureNumberingContext} from "../../../IsaacAppTypes";
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
    const dropRegionContext = useContext(DragAndDropRegionContext);
    const clozeDropRootElement = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);
    const [imageScaleFactor, setImageScaleFactor] = useState({x: 1, y: 1});

    const recalculateImageScaleFactor = () => {
        const newScaleFactor = imageRef.current ? {x: imageRef.current.width / imageRef.current.naturalWidth, y: imageRef.current.height / imageRef.current.naturalHeight} : {x: 1, y: 1};
        setImageScaleFactor(newScaleFactor);
    };


    // TODO: switch "minWidth" and "minHeight" props in figure DZs to be "width" and "height", which specify a percentage width/height of the figure itself,
    // and include a basic, unchangeable min-width and min-height on all dropzones (something like 100px / 30px).

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
                            {doc.dropZones && dropRegionContext && path && doc.dropZones.map((dropZone, i) => {
                                const zoneId = dropZone.id;
                                const dropZoneElement = document.getElementById(`figure-drop-target-${zoneId}`);
                                return <div 
                                    className="position-absolute" id={`figure-drop-target-${zoneId}`} key={i}
                                    style={{
                                        left: `calc(${dropZone.left}% - (${dropZoneElement?.clientWidth}px * ${(dropZone.left)/100})`,
                                        top: `calc(${dropZone.top}% - (${dropZoneElement?.clientHeight}px * ${(dropZone.top)/100})`
                                    }}
                                >
                                    <InlineDropRegion 
                                        divId={`figure-drop-target-${zoneId}`}
                                        zoneId={zoneId}
                                        emptyWidth={dropZone.minWidth.endsWith("px") ? parseInt(dropZone.minWidth.replace("px", "")) * imageScaleFactor.x : undefined}
                                        emptyHeight={dropZone.minHeight.endsWith("px") ? parseInt(dropZone.minHeight.replace("px", "")) * imageScaleFactor.y : undefined}
                                        rootElement={clozeDropRootElement.current || undefined}
                                    />
                                </div>; 
                            })}

                            {!doc.clickUrl && <img src={path} alt={doc.altText} ref={imageRef} onLoad={recalculateImageScaleFactor} />}
                            {doc.clickUrl && <a href={doc.clickUrl}><img src={path} alt={doc.altText} ref={imageRef} onLoad={recalculateImageScaleFactor} /></a>}
                        </div>
                    </div>
                    <IsaacFigureCaption doc={doc} figId={figId} figureString={figureString} />
                </figure>;
            }}
        </FigureNumberingContext.Consumer>
    </div>;
};
