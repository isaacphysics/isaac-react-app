import React, { ReactNode } from "react";
import { Button, ButtonProps } from "reactstrap";
import { Spacer } from "./Spacer";
import classNames from "classnames";

interface AffixProps {
    affix: ReactNode;
    position: "prefix" | "suffix";
    type: "text" | "icon" | "icon-img";
}

export interface AffixButtonProps extends ButtonProps {
    affix: AffixProps;
}

const renderAffix = (affix: AffixProps, className?: string) => {
    switch (affix.type) {
        case "text":
            return <span className={classNames(className)}>{affix.affix}</span>;
        case "icon":
            return <i className={classNames("icon", affix.affix as string, className)}/>;
        case "icon-img":
            return <img src={affix.affix as string} className={classNames(className)} alt=""/>;
    }
};

export const AffixButton = (props: AffixButtonProps) => {
    const { affix, children, className, ...rest } = props;
    return <Button {...rest} className={classNames("d-inline-flex align-items-center", className)}>
        {affix.position !== "suffix" && <>
            {renderAffix(affix, "me-2")}
            <Spacer/>
        </>}
        {children}
        {affix.position === "suffix" && <>
            <Spacer/>
            {renderAffix(affix, "ms-2")}
        </>}
    </Button>;
};
