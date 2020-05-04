import React from "react";
import {ExternalLink} from "./ExternalLink";
import {EDITOR_URL} from "../../services/constants";
import {ContentDTO} from "../../../IsaacApiTypes";
import {useSelector} from "react-redux";
import {AppState} from "../../state/reducers";

export interface EditContentButtonProps {
    doc: ContentDTO & {canonicalSourceFile?: string};
    className?: string;
}

export const EditContentButton = ({doc, className}: EditContentButtonProps) => {
    const segueEnvironment = useSelector((state: AppState) => state?.constants?.segueEnvironment || "unknown");
    return segueEnvironment === "DEV" && doc.canonicalSourceFile ?
        <div>
            <ExternalLink href={EDITOR_URL + doc.canonicalSourceFile} className={`pl-2 ${className ? ` ${className}` : ""}`}>
                <h3>{doc.published ? "Published" : "Unpublished"} ✎</h3>
            </ExternalLink>
        </div>
        :
        null;
};
