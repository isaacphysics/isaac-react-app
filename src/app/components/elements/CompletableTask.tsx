import React from "react";
import classNames from "classnames";
import { Button } from "reactstrap";
import { Link } from "react-router-dom";
import { Spacer } from "./Spacer";

interface CompletableTaskProps extends React.HTMLAttributes<HTMLDivElement> {
    complete?: boolean;
    disabled?: boolean;
    action?: {
        title: string;
        to?: string;
        onClick?: () => void;
    };
    tag?: React.ElementType;
}

export const CompletableTask = (props: CompletableTaskProps) => {
    const { complete, disabled, action, children, tag : Tag = "div", className, ...rest } = props;
    return <Tag {...rest} className={classNames("d-flex flex-column flex-md-row gap-2 p-3 border-radius-2 bg-cultured-grey align-items-start align-items-md-center", {"text-silver-grey": disabled}, className)}>
        <div className="d-flex gap-3 align-items-center">
            <div className="position-relative d-flex align-self-start">
                <input type="radio" readOnly disabled={disabled} className={classNames("styled-checkbox-readonly rounded-pill", {"checked": complete})} checked={complete} />
                {complete && <div className="tick" />}
            </div>
            {children}
        </div>
        <Spacer />
        {action && !complete && !disabled && <Button
            className="bg-transparent fs-6 py-1 px-3 my-md-n2 justify-self-end w-100 w-md-auto"
            tag={action.to ? Link : undefined}
            to={action.to}
            onClick={action.onClick}
            outline
        >
            {action.title}
        </Button>}
    </Tag>;
};
