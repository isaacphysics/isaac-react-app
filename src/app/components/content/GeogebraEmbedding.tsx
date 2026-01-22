import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { GeogebraEmbeddingDTO } from "../../../IsaacApiTypes";
import { GeogebraCookieHandler } from "../handlers/InterstitialCookieHandler";
import {v4 as uuid_v4} from "uuid";
import { siteSpecific } from "../../services";
import { Button } from "reactstrap";

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
    startInert?: boolean;
}

const GeogebraPlainElement = (props: GeogebraPlainElementProps) => {
    const { materialId, appType, allowNewInputs, parentRef } = props;
    const [size, setSize] = useState<{width: number | undefined, height: number | undefined}>({width: undefined, height: undefined});
    const [isInert, setIsInert] = useState(props.startInert ?? true);
    const uuid = useMemo(() => uuid_v4(), []);

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

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const GGBApplet = (window as any).GGBApplet;
        if (!GGBApplet) return;

        const app = new GGBApplet(params, true);
        app.inject("ggb-element-" + uuid);
    }, [size.height, materialId, uuid, size.width, appType, allowNewInputs]);

    return <>
        {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */ /* the button maintains accessibility */}
        {isInert && <div className="geogebra-embedding-wrapper" onClick={() => setIsInert(false)}>
            <Button color="primary" onClick={() => setIsInert(false)}>Click to open GeoGebra content</Button>
        </div>}
        <div id={"ggb-element-" + uuid} {...{ inert: isInert ? '' : undefined }} />
    </>;
};

export const GeogebraEmbedding = ({doc}: GeogebraEmbeddingProps) => {
    const { materialId, appType, allowNewInputs, altText } = doc;
    const figureRef = useRef<HTMLElement>(null);
    const [justAcceptedCookie, setJustAcceptedCookie] = useState(false);

    loadDeployggbIfNotPresent();
    
    return <div className="figure-panel">
        <GeogebraCookieHandler onAccepted={() => setJustAcceptedCookie(true)} afterAcceptedElement={<>
            <figure className="position-relative" ref={figureRef}>
                <GeogebraPlainElement materialId={materialId} appType={appType} allowNewInputs={allowNewInputs} parentRef={figureRef} startInert={!justAcceptedCookie} />

                {altText && <figcaption className="text-center figure-caption">
                    {altText}
                </figcaption>}
            </figure>
        </>} />
    </div>;
};
