import {Button, Card, CardBody, CardFooter, CardTitle, Container, ContainerProps} from "reactstrap";
import classNames from "classnames";
import {Link} from "react-router-dom";
import React from "react";
import { IconProps } from "../svg/HexIcon";

export interface PromptBannerContentProps {
    title: string;
    icon: IconProps | string;
    bodyText?: string;
    color?: string;
    buttons?: {
        primary?: {
            text: string;
            style?: "outline" | "link" | "card";
            disabled?: boolean;
            clickUrl: string;
        },
        secondary?: {
            text: string;
            style?: "outline" | "link" | "card";
            disabled?: boolean;
            clickUrl: string;
        },
        link?: {
            text: string;
            disabled?: boolean;
            clickUrl: string;
        }
    },
    className?: string;
}

export interface PromptBannerProps extends ContainerProps {
    card: PromptBannerContentProps;
}

export const PromptBanner = ({card, ...props}: PromptBannerProps) => {
    const {title, icon, bodyText, color, buttons} = card;
    const {name, altText, size, color: iconColor, raw} = typeof icon === "string" ? {name: icon} : icon;

    return <Container {...props} className={classNames( "icon-card-container px-3 my-3", props?.className ?? "")}>
        <Card className={classNames("icon-card prompt-banner", `bg-${color ?? "cyan-100"}`, card.className)}>
            <div className={"d-flex flex-column h-100 icon-card-main-content"}>
                <CardTitle className={classNames("px-4 mt-4 d-flex flex-column flex-md-row align-items-start gap-2")}>
                    <i className={classNames(`icon icon-${size ?? "md"}`, {"icon-raw": raw}, name)} color={iconColor ?? "tertiary"} aria-label={altText}/>
                    <h3 className="my-0">{title}</h3>
                </CardTitle>
                
                {bodyText && <CardBody className="pt-2 pb-1 px-4">
                    <p className="mb-0">{bodyText}</p>
                </CardBody>}
                
                {buttons && <CardFooter className={"border-top-0 p-4 pt-3"}>
                    <div className={"d-flex flex-column flex-md-row align-items-center justify-content-between"}>
                        <div className={"w-100 w-md-auto"}>
                            {buttons.primary &&
                            <Button className={"w-100 w-md-auto"} disabled={buttons.primary.disabled} outline={buttons.primary.style === "outline"} tag={Link} to={buttons.primary.clickUrl}>
                                {buttons.primary.text}
                            </Button>
                            }
                            {buttons.secondary &&
                            <Button className={"w-100 w-md-auto mt-2 mt-md-auto mx-md-2 mx-auto"} disabled={buttons.secondary.disabled} outline={buttons.secondary.style === "outline"} tag={Link} to={buttons.secondary.clickUrl}>
                                {buttons.secondary.text}
                            </Button>
                            }
                        </div>
                        {buttons.link &&
                            <Button className={"w-100 w-md-auto mt-2 mt-md-0"} disabled={buttons.link.disabled} color={"link"} tag={Link} to={buttons.link.clickUrl}>
                                {buttons.link.text}
                            </Button>
                        }
                    </div>
                </CardFooter>}
            </div>
        </Card>
    </Container>;
};
