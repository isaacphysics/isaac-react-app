import React from "react";
import {useGetSegueEnvironmentQuery} from "../../state";
import {ExternalLink} from "./ExternalLink";
import {EDITOR_URL} from "../../services";
import {ContentDTO} from "../../../IsaacApiTypes";

export interface EditContentButtonProps {
    doc?: ContentDTO & {canonicalSourceFile?: string};
    className?: string;
}

export const EditContentButton = ({doc, className}: EditContentButtonProps) => {
    const {data: segueEnvironment} = useGetSegueEnvironmentQuery();
    if (segueEnvironment === "DEV" && doc?.canonicalSourceFile) {
        return <div className="not-mobile">
            <h4>
                <ExternalLink href={EDITOR_URL + doc.canonicalSourceFile} className={className}>
                    {doc.published ? "Published" : "Unpublished"} ✎
                </ExternalLink>
            </h4>
        </div>;
    } else {
        return null; // does not render
    }
};
