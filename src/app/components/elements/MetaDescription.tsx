import React from "react";
import {Helmet} from "react-helmet";
import {isDefined} from "../../services/miscUtils";
import {RenderNothing} from "./RenderNothing";

export function MetaDescription(props: { description?: string }) {
    if (isDefined(props.description)) {
        return <Helmet>
            <meta name="description" content={props.description} />
            <meta property="og:description" content={props.description} />
        </Helmet>;
    }
    return RenderNothing;
}
