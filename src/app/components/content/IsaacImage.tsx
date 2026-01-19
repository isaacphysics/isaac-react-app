import React from 'react';
import {ImageDTO} from "../../../IsaacApiTypes";
import {apiHelper} from "../../services";
import {IsaacContentValueOrChildren} from "./IsaacContentValueOrChildren";
import {Markup} from "../elements/markup";
import { closeActiveModal, openActiveModal, useAppDispatch } from '../../state';
import { ActiveModalProps } from '../../../IsaacAppTypes';

interface FigureModalProps {
    path?: string;
    altText?: string;
    caption?: React.ReactNode;
    toggle: () => void;
}

export const FigureModal = ({path, altText, caption, toggle}: FigureModalProps) : ActiveModalProps => {
    return {
        closeAction: toggle,
        size: "xxl",
        title: "Image preview",
        body: <div className="figure-panel">
            <figure className="text-center">
                <img src={path} alt={altText} />
                {caption}
            </figure>
        </div>
    };
};

interface IsaacImageProps {
    doc: ImageDTO;
}

const IsaacImageCaption = ({doc}: {doc: ImageDTO}) => {
    return (!!doc.children?.length || !!doc.attribution || !!doc.value) && <figcaption className="text-center figure-caption">
        <IsaacContentValueOrChildren encoding={doc.encoding} value={doc.value}>
            {doc.children}
        </IsaacContentValueOrChildren>
        {doc.attribution && <span className="text-muted">
            <Markup trusted-markup-encoding={"markdown"}>
                {doc.attribution}
            </Markup>
        </span>}
    </figcaption>;
};

export const IsaacImage = ({doc}: IsaacImageProps) => {
    const dispatch = useAppDispatch();
    const path = doc.src && apiHelper.determineImageUrl(doc.src);

    return <div className="figure-panel">
        <figure>
            <div className="text-center position-relative p-3 pb-5">
                <button className="figure-fullscreen" aria-label="Expand image" onClick={() => {
                    dispatch(openActiveModal(FigureModal({
                        path, 
                        altText: doc.altText, 
                        caption: <IsaacImageCaption doc={doc} />, 
                        toggle: () => dispatch(closeActiveModal())
                    })));
                }}>
                    <i className="icon icon-fullscreen icon-md" />
                </button>
                {!doc.clickUrl && <img src={path} alt={doc.altText} />}
                {doc.clickUrl && <a href={doc.clickUrl}><img src={path} alt={doc.altText} /></a>}
            </div>
            <IsaacImageCaption doc={doc} />
        </figure>
    </div>;
};
