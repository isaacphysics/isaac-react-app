import React, { useCallback, useEffect, useRef, useState } from "react";
import { GeogebraEmbeddingDTO } from "../../../IsaacApiTypes";
import { GeogebraCookieHandler } from "../handlers/InterstitialCookieHandler";
import "../../services/external/geogebra/deployggb";
import {v4 as uuid_v4} from "uuid";

interface GeogebraEmbeddingProps {
    doc: GeogebraEmbeddingDTO;
}

interface GeogebraPlainElementProps {
    materialId?: string;
    parentRef: React.RefObject<HTMLElement>;
}

const GeogebraPlainElement = (props: GeogebraPlainElementProps) => {
    const { materialId, parentRef } = props;
    const [size, setSize] = useState<{width: number | undefined, height: number | undefined}>({width: undefined, height: undefined});
    const uuid = uuid_v4();

    const recalculateSize = useCallback(() => {
        const width = parentRef.current?.clientWidth;
        const height = parentRef.current?.clientHeight;
        setSize({width, height});
    }, [parentRef]);

    useEffect(() => {
        const resizeObserver = new ResizeObserver(() => recalculateSize());
        resizeObserver.observe(parentRef.current as Element);
        return () => resizeObserver.disconnect();
    }, [parentRef, recalculateSize]);
    
    useEffect(() => {
        const params = {
            material_id: materialId, 
            // appName: "classic" | "graphing" | "geometry" | "3d", // TODO make configurable if no material id
            width: size.width, 
            height: Math.max(500, size.height ?? 0), 
            showToolBar: false, 
            showAlgebraInput: !materialId, // TODO: make configurable
            showMenuBar: false,
            showZoomButtons: true,
            borderColor: "#FFFFFF00"
        };
        const app = new GGBApplet(params, true);
        app.inject("ggb-element-" + uuid);
    }, [size.height, materialId, uuid, size.width]);

    return <div id={"ggb-element-" + uuid} />;
};

export const GeogebraEmbedding = ({doc}: GeogebraEmbeddingProps) => {
    const { appId, altText } = doc;
    const figureRef = useRef<HTMLElement>(null);
    
    return <div className="figure-panel">
        <GeogebraCookieHandler afterAcceptedElement={<>
            <figure className="position-relative" ref={figureRef}>
                <GeogebraPlainElement materialId={appId} parentRef={figureRef} />

                {altText && <figcaption className="text-center figure-caption">
                    {altText}
                </figcaption>}
            </figure>
        </>} />
    </div>;
};
