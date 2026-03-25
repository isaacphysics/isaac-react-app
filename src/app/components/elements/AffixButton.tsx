import React, { ReactNode } from "react";
import { Button, ButtonProps } from "reactstrap";
import { Spacer } from "./Spacer";
import classNames from "classnames";
import { IconProps } from "./svg/HexIcon";

interface AffixProps {
    affix: ReactNode | IconProps;
    position: "prefix" | "suffix" | "center";
    type: "text" | "icon" | "icon-img";
    affixClassName?: string;
}

export interface AffixButtonProps extends ButtonProps {
    affix: AffixProps;
}

const renderAffix = (affix: AffixProps, className?: string) => {         
    if (affix.type === "text") {
        return <span className={classNames(className)}>{affix.affix as ReactNode}</span>;
    } else if (affix.type === "icon") {
        const {name, altText, size, color, raw} = typeof affix.affix === "string" ? {name: affix.affix} : affix.affix as IconProps;
        return <i className={classNames(className, "icon", size ? `icon-${size}` : "", {"icon-raw": raw}, name)} color={color} aria-label={altText}/>;
    } else {
        return <img src={affix.affix as string} className={classNames(className)} alt=""/>;
    }
};

export const AffixButton = (props: AffixButtonProps) => {
    const { affix, children, className, ...rest } = props;
    return <Button {...rest} className={classNames("d-inline-flex align-items-center", className)}>
        {affix.position === "prefix" && <>
            {renderAffix(affix, affix.affixClassName || "me-2")}
            <Spacer/>
        </>}
        {affix.position === "center" ? <>
            <Spacer/>
            {renderAffix(affix, affix.affixClassName)}
            <Spacer/>
        </> : children}
        {affix.position === "suffix" && <>
            <Spacer/>
            {renderAffix(affix, affix.affixClassName || "ms-2")}
        </>}
    </Button>;
};

export interface IconButtonProps extends ButtonProps {
    icon: IconProps | string;
    affixClassName?: string;
}

export const IconButton = (props: IconButtonProps) => {
    const { icon, className, affixClassName, ...rest } = props;
    return <AffixButton {...rest} className={classNames(className, "p-3")} affix={{affix: icon, position: "center", type: "icon", affixClassName}}/>;
};
