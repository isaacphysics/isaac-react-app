import React from "react";
import {useSelector} from "react-redux";
import {segue} from "../../state/selectors";

export interface EditContentButtonProps {
    canonicalSourceFile?: string;
    className?: string;
}

export const EditContentButton = ({canonicalSourceFile, className}: EditContentButtonProps) => {
    const segueEnvironment = useSelector(segue.environmentOrUnknown);
    if (segueEnvironment === "DEV") {
        return <div>
            <a href={canonicalSourceFile} className={`btn btn-primary mt-3 ${className ? ` ${className}` : ""}`} target="_blank" rel="noopener">
                View in the Content Editor
            </a>
        </div>;
    } else {
        return null; // does not render
    }
};
