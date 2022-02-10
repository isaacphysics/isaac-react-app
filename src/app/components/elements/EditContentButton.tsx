import React from "react";
import {useSelector} from "react-redux";
import {selectors} from "../../state/selectors";
import {ExternalLink} from "./ExternalLink";
import {EDITOR_URL} from "../../services/constants";
import {ContentDTO} from "../../../IsaacApiTypes";

export interface EditContentButtonProps {
    doc?: ContentDTO & {canonicalSourceFile?: string};
    className?: string;
}

export const EditContentButton = ({doc, className}: EditContentButtonProps) => {
    const segueEnvironment = useSelector(selectors.segue.environmentOrUnknown);
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
