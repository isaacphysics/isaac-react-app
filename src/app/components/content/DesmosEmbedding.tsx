import React from "react";
import { DesmosEmbeddingDTO } from "../../../IsaacApiTypes";
import { DesmosCookieHandler } from "../handlers/InterstitialCookieHandler";

interface DesmosEmbeddingProps {
    doc: DesmosEmbeddingDTO;
}

export const DesmosEmbedding = ({doc}: DesmosEmbeddingProps) => {
    const { calculatorId, altText } = doc;
    const baseURL = calculatorId ? `https://www.desmos.com/calculator/${calculatorId}?embed` : "https://www.desmos.com/calculator?embed";

    return <div className="figure-panel">
        <DesmosCookieHandler afterAcceptedElement={
            <figure>
                <iframe
                    title={altText || "Desmos Calculator"}
                    src={baseURL}
                    width="100%"
                    height="500px"
                    allowFullScreen
                />
                {altText && <figcaption className="text-center figure-caption">
                    {altText}
                </figcaption>}
            </figure>
        } />
    </div>;
};
