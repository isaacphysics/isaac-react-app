import React from "react";
import classNames from "classnames";

interface CompletableTaskProps extends React.HTMLAttributes<HTMLDivElement> {
    complete?: boolean;
    disabled?: boolean;
    tag?: React.ElementType;
}

export const CompletableTask = (props: CompletableTaskProps) => {
    const { complete, disabled, children, tag : Tag = "div", className, ...rest } = props;
    return <Tag {...rest} className={classNames("d-flex gap-3 p-3 border-radius-2 bg-cultured-grey align-items-center", {"text-grey": disabled}, className)}>
        <div className="position-relative">
            <input type="radio" readOnly className={classNames("styled-checkbox-readonly rounded-pill", {"checked": complete})} checked={complete} disabled={disabled} />
            {complete && <div className="tick" />}
        </div>
        {children}
    </Tag>;
};
