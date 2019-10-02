import React from "react";

export interface EditContentButtonProps {
    canonicalSourceFile?: string,
    className?: string,
}

export const EditContentButton = ({canonicalSourceFile, className}: EditContentButtonProps) => {
    return <div>
        <a href={canonicalSourceFile} className={`btn btn-primary mt-3 ${className ? ` ${className}` : ""}`} target="_blank">View in the Content Editor</a>
    </div>
};
