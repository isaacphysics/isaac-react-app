import classNames from "classnames";
import React from "react";
import {Button, Card, CardBody, CardFooter, CardTitle, Container, ContainerProps} from "reactstrap";
import { isAppLink } from "../../../services";
import { Link } from "react-router-dom";
import { IconProps } from "../svg/HexIcon";
import { ExternalLink } from "../ExternalLink";

export interface IconCardContentProps {
    title: string;
    icon: IconProps | string;
    bodyText?: string;
    tag?: string;
    clickUrl?: string;
    onButtonClick?: () => void;
    buttonText?: string;
    disabled?: boolean;
    buttonStyle?: "outline" | "link" | "card";
    className?: string;
}

export interface IconCardProps extends ContainerProps {
    card: IconCardContentProps;
}

export const IconCard = ({card, children, ...props}: IconCardProps) => {
    const {title, icon, bodyText, tag, clickUrl, onButtonClick, buttonText, disabled, buttonStyle} = card;
    const {name, altText, size, color, raw} = typeof icon === "string" ? {name: icon} : icon;

    return <Container {...props} className={classNames("icon-card-container px-3 my-3", props?.className ?? "")}>
        <Card className={classNames("icon-card border-0", card.className)} tag={buttonStyle === "card" ? Link : Card} to={clickUrl}>
            <i className={classNames(`icon icon-${size ?? "md"}`, {"icon-raw": raw}, name)} color={color ?? "tertiary"} aria-label={altText}/>
            {tag && <div className="icon-card-tag">
                <span><b>{tag}</b></span>
            </div>}
            <div className={classNames("d-flex flex-column h-100 icon-card-main-content", {"pb-4" : !clickUrl || buttonStyle === "card"})}>
                <CardTitle className="px-4 mt-4">
                    <h3 className="mb-0">{title}</h3>
                </CardTitle>
                {(children || bodyText) && <CardBody className="pt-2 pb-1 px-4">
                    {children ?? <p className="mb-0">{bodyText}</p>}
                </CardBody>}
                {clickUrl && buttonStyle !== "card" && <CardFooter className={"border-top-0 p-4 pt-3"}>
                    {isAppLink(clickUrl) ? 
                        <Button onClick={onButtonClick} className={classNames("text-start", {"d-flex align-items-center": buttonStyle === "link"})} disabled={disabled} outline={buttonStyle === "outline"} color={buttonStyle === "link" ? "link" : "secondary"} tag={Link} to={clickUrl}>
                            {buttonText || "See more"}
                        </Button> :
                        <ExternalLink asButton href={clickUrl}>
                            {buttonText || "See more"}
                        </ExternalLink>
                    }
                </CardFooter>}
            </div>
        </Card>
    </Container>;
};
