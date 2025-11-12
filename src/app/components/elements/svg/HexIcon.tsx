import React from "react";
import classNames from "classnames";
import { isPhy, Subject } from "../../../services";

export interface IconProps extends React.HTMLAttributes<HTMLDivElement> {
    icon?: string;
    subject?: Subject;
    size?: "sm" | "md" | "lg" | "xl";
    altText?: string;
    color?: string;
}

export const HexIcon = (props: IconProps) => {
    const {icon, subject, size, className, altText, color, ...rest} = props;
    return <div {...rest} className={classNames({"d-flex pe-3": isPhy}, className)} {...(subject && {"data-bs-theme": subject})} aria-label={altText}>
        {isPhy && <div className={`phy-hex-icon icon-${size ?? "xl"}`}/>}
        <i className={classNames(`icon icon-${size ?? "xl"}`, icon)} color={color}/>
    </div>;
};
