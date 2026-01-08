import React from "react";
import { GeogebraEmbeddingDTO } from "../../../IsaacApiTypes";

interface GeogebraEmbeddingProps {
    doc: GeogebraEmbeddingDTO;
}

export const GeogebraEmbedding = ({doc}: GeogebraEmbeddingProps) => {
    const { appId, altText } = doc;
    const baseURL = appId ? `https://geogebra.com/classic/${appId}?embed` : "https://geogebra.com/classic?embed";

    return <div className="figure-panel">
        <figure>
            <iframe
                title={altText || "Geogebra Calculator"}
                src={baseURL}
                width="100%"
                height="500px"
                allowFullScreen
            />
            {altText && <figcaption className="text-center figure-caption">
                {altText}
            </figcaption>}
        </figure>
    </div>;
};
