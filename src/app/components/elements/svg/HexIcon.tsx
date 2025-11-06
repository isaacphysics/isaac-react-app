import React from "react";
import classNames from "classnames";
import { isPhy, Subject } from "../../../services";

export interface HexIconProps extends React.HTMLAttributes<HTMLDivElement> {
    icon: string | undefined;
    subject?: Subject;
    size?: "md" | "lg" | "xl";
    alt?: string;
}

export const HexIcon = (props: HexIconProps) => {
    const {icon, subject, size, className, ...rest} = props;
    return <div {...rest} className={classNames("d-flex pe-3", className)} {...(subject && {"data-bs-theme": subject})}>
        {isPhy && <div className={`phy-hex-icon icon-${size ?? "xl"}`}/>}
        <i className={classNames(`icon icon-${size ?? "xl"}`, icon)} alt={props.alt}/>
    </div>;
};
