import React from "react";
import classNames from "classnames";

interface CompletableTaskProps extends React.HTMLAttributes<HTMLDivElement> {
    complete?: boolean;
    disabled?: boolean;
    tag?: React.ElementType;
}

export const CompletableTask = (props: CompletableTaskProps) => {
    const { complete, disabled, children, tag : Tag = "div", className, ...rest } = props;
    return <Tag {...rest} className={classNames("d-flex gap-3 p-3 border-radius-2 bg-cultured-grey align-items-center", {"text-silver-grey": disabled}, className)}>
        <div className="position-relative d-flex align-self-start">
            <input type="radio" readOnly disabled={disabled} className={classNames("styled-checkbox-readonly rounded-pill", {"checked": complete})} checked={complete} />
            {complete && <div className="tick" />}
        </div>
        {children}
    </Tag>;
};
