import React from "react";
import {ExternalLink} from "./ExternalLink";
import {EDITOR_URL} from "../../services/constants";
import {ContentDTO} from "../../../IsaacApiTypes";
import {isaacApi} from "../../state/slices/api";

export interface EditContentButtonProps {
    doc?: ContentDTO & {canonicalSourceFile?: string};
    className?: string;
}

export const EditContentButton = ({doc, className}: EditContentButtonProps) => {
    const segueEnvironment = isaacApi.endpoints.getSegueEnvironment.useQueryState().currentData;
    if (segueEnvironment === "DEV" && doc?.canonicalSourceFile) {
        return <div className="not-mobile">
            <ExternalLink href={EDITOR_URL + doc.canonicalSourceFile} className={className || ""}>
                <h3>{doc.published ? "Published" : "Unpublished"} ✎</h3>
            </ExternalLink>
        </div>;
    } else {
        return null; // does not render
    }
};
