import React from "react";
import { DesmosEmbeddingDTO } from "../../../IsaacApiTypes";
import { DesmosCookieHandler } from "../handlers/InterstitialCookieHandler";

interface DesmosEmbeddingProps {
    doc: DesmosEmbeddingDTO;
}

export const DesmosEmbedding = ({doc}: DesmosEmbeddingProps) => {
    const { calculatorId, calculatorType="calculator", altText } = doc;
    // calculatorType currently supports an undefined value (becomes "calculator" here, which represents standard 2d), and "3d".
    const baseURL = calculatorId ? `https://www.desmos.com/${calculatorType}/${calculatorId}?embed` : `https://www.desmos.com/${calculatorType}?embed`;

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
