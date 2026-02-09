import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import {FigureRegion, FigureDTO} from "../../../IsaacApiTypes";
import {ALPHABET, apiHelper, FIGURE_DROP_ZONE_PLACEHOLDER_SIZE} from "../../services";
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

type ContextType = 'dropRegion' | 'inlineRegion';

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

    const generateFigureRegionObjects = useCallback(({figureRegions, contextType, root, style, label}: {
        figureRegions: FigureRegion[], 
        contextType: ContextType, 
        root?: HTMLElement | null, 
        style?: (figureRegion: FigureRegion, index: number) => React.CSSProperties,
        label?: (figureRegion: FigureRegion, index: number) => React.ReactNode
    }) => {
        return figureRegions.map((figureRegion, i) => {
            const zoneId = figureRegion.id;
            const parentId = contextType === 'dropRegion' ? `figure-drop-target-${zoneId}` : `inline-question-${zoneId}`;

            const region = <div 
                id={parentId} style={style?.(figureRegion, i)}
            >
                {contextType === 'dropRegion'
                    ? <InlineDropRegion 
                        divId={parentId}
                        zoneId={zoneId}
                        emptyWidth="100%"
                        emptyHeight="100%"
                        rootElement={root || undefined}
                        skipPortalling={true}
                    />
                    : <InlineEntryZoneBase
                        inlineSpanId={parentId}
                        className="figure-inline-region"
                        width="100%"
                        minWidth="100%" // on a figure, the input size is determined by the region size (i.e. the parent), so all sizes are 100%
                        height="100%"
                        root={root || document.body}
                    />
                }
            </div>;

            return <React.Fragment key={i}>
                {label 
                    ? <div className="d-flex gap-2 align-items-center">
                        {label(figureRegion, i)}
                        {region}
                    </div>
                    : region    
                }
            </React.Fragment>;
        });
    }, []);

    const generateFigureRegionObjectPlaceholders = useCallback(({figureRegions, style}: {
        figureRegions: FigureRegion[],
        style?: (figureRegion: FigureRegion, index: number) => React.CSSProperties,
    }) => {
        return figureRegions.map((figureRegion, i) => {
            return <div 
                key={i}
                style={style ? style(figureRegion, i) : {}}
                className="figure-region-placeholder"
            >
                {ALPHABET[i % ALPHABET.length]}
            </div>;
        });
    }, []);

    // TODO: if the image fails to load, you can't answer the question
    const dropRegionContext = useContext(DragAndDropRegionContext);
    const inlineRegionContext = useContext(InlineContext);
    const contextType: ContextType | null = dropRegionContext ? 'dropRegion' : inlineRegionContext ? 'inlineRegion' : null;
    const clozeDropRootElement = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);
    const [isCondensed, setIsCondensed] = useState(false);

    const regionHeight = contextType === 'dropRegion' ? "24px" : "34px";

    useEffect(() => {
        if (doc.condensedMaxWidth && imageRef.current) {
            const resizeObserver = new ResizeObserver(() => {
                const maxWidthPx = doc.condensedMaxWidth ? parseInt(doc.condensedMaxWidth.replace("px", "")) : null;
                setIsCondensed(maxWidthPx && imageRef.current ? imageRef.current.clientWidth < maxWidthPx : false);
            });
            resizeObserver.observe(imageRef.current);
            return () => resizeObserver.disconnect();
        }
    }, [doc.condensedMaxWidth]);

    return <div className="figure-panel">
        <FigureNumberingContext.Consumer>
            {figureNumbers => {
                const figureString = figId && Object.keys(figureNumbers).includes(figId) ?
                    `Figure\u00A0${figureNumbers[figId]}` : "Figure";
                return <figure>
                    <div className="w-100 d-flex flex-column align-items-center justify-content-center position-relative p-3 pb-5" ref={clozeDropRootElement}>
                        <button className="figure-fullscreen" aria-label="Expand figure" type="button" onClick={() => {
                            dispatch(openActiveModal(FigureModal({
                                path, 
                                altText: doc.altText,
                                caption: <IsaacFigureCaption doc={doc} figId={figId} figureString={figureString} />,
                                toggle: () => dispatch(closeActiveModal())
                            })));
                        }}>
                            <i className="icon icon-fullscreen icon-md" />
                        </button>
                        {(doc.figureRegions && contextType && path) 
                            ? <div className="position-relative w-fit-content align-self-center">
                                {!isCondensed
                                    ? generateFigureRegionObjects({
                                        figureRegions: doc.figureRegions, 
                                        contextType,
                                        root: clozeDropRootElement.current, 
                                        style: (region: FigureRegion) => ({
                                            position: 'absolute',
                                            left: `calc(${region.left}% - (max(${region.width}%, ${region.minWidth}) * ${(region.left)/100})`,
                                            top: `calc(${region.top}% - (${regionHeight} * ${(region.top)/100})`,
                                            width: region.width ? `${region.width}%` : undefined,
                                            minWidth: region.minWidth,
                                            height: regionHeight,
                                        })
                                    })
                                    : generateFigureRegionObjectPlaceholders({
                                        figureRegions: doc.figureRegions,
                                        style: (region) => ({
                                            position: 'absolute',
                                            left: `calc(${region.left}% - (${region.width}% * ${region.left/100}) + ((${region.width}% - ${FIGURE_DROP_ZONE_PLACEHOLDER_SIZE}) / 2))`, 
                                            top: `calc(${region.top}% - (${regionHeight} * ${region.top/100}) + ((${regionHeight} - ${FIGURE_DROP_ZONE_PLACEHOLDER_SIZE}) / 2))`,
                                        })
                                    })
                                }

                                {!doc.clickUrl && <img src={path} alt={doc.altText} ref={imageRef} />}
                                {doc.clickUrl && <a href={doc.clickUrl}><img src={path} alt={doc.altText} ref={imageRef} /></a>}
                            </div>
                            : <>
                                {!doc.clickUrl && <img src={path} alt={doc.altText} ref={imageRef} />}
                                {doc.clickUrl && <a href={doc.clickUrl}><img src={path} alt={doc.altText} ref={imageRef} /></a>}
                            </>
                        }

                        {doc.figureRegions && contextType && path && (
                            isCondensed 
                                ? <>
                                    <hr />
                                    <div className="d-flex flex-column w-100 gap-2 mt-3">
                                        {generateFigureRegionObjects({
                                            figureRegions: doc.figureRegions, 
                                            contextType,
                                            root: clozeDropRootElement.current, 
                                            style: (region) => ({
                                                position: 'relative',
                                                width: "10rem", // the usual "% of figure width" has no meaning here, so replace with a fixed width
                                                minWidth: region.minWidth,
                                                height: contextType === 'dropRegion' ? "" : "34px",
                                            }),
                                            label: (_, index) => <div className="figure-region-placeholder">{ALPHABET[index % ALPHABET.length]}</div>,
                                        })}
                                    </div>
                                </>
                                : null
                        )}
                    </div>
                    <IsaacFigureCaption doc={doc} figId={figId} figureString={figureString} />
                </figure>;
            }}
        </FigureNumberingContext.Consumer>
    </div>;
};
