import React from "react";
import classNames from "classnames";
import { isPhy, Subject } from "../../../services";

export interface IconProps {
    name?: string;
    size?: "sm" | "md" | "lg" | "xl";
    altText?: string;
    color?: string;
    raw?: boolean;
}

export interface HexIconProps extends React.HTMLAttributes<HTMLDivElement> {
    icon: IconProps | string;
    subject?: Subject;
    hideHex?: boolean;
}

export const HexIcon = (props: HexIconProps) => {
    const {icon, subject, hideHex, className, ...rest} = props;
    const {name, altText, size, color, raw} = typeof icon === "string" ? {name: icon} : icon;

    return <div {...rest} className={classNames({"d-flex pe-3": isPhy}, className)} {...(subject && {"data-bs-theme": subject})} aria-label={altText}>
        {isPhy && !hideHex && <div className={`phy-hex-icon icon-${size ?? "xl"}`}/>}
        <i className={classNames(`icon icon-${size ?? "xl"}`, {"icon-raw": raw}, name)} color={color}/>
    </div>;
};
