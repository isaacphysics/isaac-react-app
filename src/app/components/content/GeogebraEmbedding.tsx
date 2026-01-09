import React, { useCallback, useEffect, useRef, useState } from "react";
import { GeogebraEmbeddingDTO } from "../../../IsaacApiTypes";
import { GeogebraCookieHandler } from "../handlers/InterstitialCookieHandler";
import {v4 as uuid_v4} from "uuid";
import { siteSpecific } from "../../services";

const deployggbSrc = siteSpecific(
    'https://cdn.isaacscience.org',
    'https://cdn.adacomputerscience.org'
) + "/vendor/geogebra/deployggb.js";

function loadDeployggbIfNotPresent() {
    const deployggbScriptId = "deployggb-script";
    if (!('deployggb' in window) && !document.getElementById(deployggbScriptId)) {
        const deployggbScript = document.createElement('script');
        deployggbScript.id = deployggbScriptId;
        deployggbScript.src = deployggbSrc;
        deployggbScript.type = 'text/javascript';
        deployggbScript.async = true;
        document.head.appendChild(deployggbScript);
    }
}

interface GeogebraEmbeddingProps {
    doc: GeogebraEmbeddingDTO;
}

interface GeogebraPlainElementProps extends GeogebraEmbeddingDTO {
    parentRef: React.RefObject<HTMLElement>;
}

const GeogebraPlainElement = (props: GeogebraPlainElementProps) => {
    const { materialId, appType, allowNewInputs, parentRef } = props;
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
            appName: appType,
            width: size.width, 
            height: Math.max(500, size.height ?? 0), 
            showAlgebraInput: !materialId || allowNewInputs,
            showMenuBar: true, // without this, the panel size sliding adjustments don't work..?
            showToolBar: false, 
            enableFileFeatures: false,
            showZoomButtons: true,
            borderColor: "#FFFFFF00"
        };

        const app = new (window as any).GGBApplet(params, true);
        app.inject("ggb-element-" + uuid);
    }, [size.height, materialId, uuid, size.width, appType, allowNewInputs]);

    return <div id={"ggb-element-" + uuid} />;
};

export const GeogebraEmbedding = ({doc}: GeogebraEmbeddingProps) => {
    const { materialId, appType, allowNewInputs, altText } = doc;
    const figureRef = useRef<HTMLElement>(null);

    loadDeployggbIfNotPresent();
    
    return <div className="figure-panel">
        <GeogebraCookieHandler afterAcceptedElement={<>
            <figure className="position-relative" ref={figureRef}>
                <GeogebraPlainElement materialId={materialId} appType={appType} allowNewInputs={allowNewInputs} parentRef={figureRef} />

                {altText && <figcaption className="text-center figure-caption">
                    {altText}
                </figcaption>}
            </figure>
        </>} />
    </div>;
};
