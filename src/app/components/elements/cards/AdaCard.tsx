import classNames from "classnames";
import React from "react";
import {Button, Card, CardBody, CardFooter, CardImg, CardTitle, Container, ContainerProps} from "reactstrap";
import { isAppLink } from "../../../services";
import { Link } from "react-router-dom";
import { ExternalLink } from "../ExternalLink";

export interface AdaCardContentProps {
    title: string;
    image: {src: string, altText?: string, className?: string};
    bodyText: string;
    clickUrl?: string;
    buttonText?: string;
    buttonStyle?: "outline" | "link" | "card";
    disabled?: boolean;
    className?: string;
}

export interface AdaCardProps extends ContainerProps {
    card: AdaCardContentProps;
}

export const AdaCard = ({card, ...props}: AdaCardProps) => {
    const {title, image, bodyText, clickUrl, buttonText, buttonStyle, disabled} = card;
    return <Container {...props} className={classNames("cs-card-container px-3 my-3", props?.className ?? "")}>
        <Card className={classNames("cs-card border-0", card.className)} tag={buttonStyle === "card" ? Link : Card}>
            {image && <CardImg src={image.src} alt={image.altText ?? ""} className={image.className ?? ""}/>}
            <div className={classNames("d-flex flex-column h-100", {"pb-4" : !clickUrl || buttonStyle === "card"})}>
                <CardTitle className="px-4 mt-4">
                    <h3 className="mt-2 mb-0">{title}</h3>
                </CardTitle>
                <CardBody className="pt-2 pb-1 px-4">
                    <p className="mb-0">{bodyText}</p>
                </CardBody>
                {clickUrl && buttonStyle !== "card" && <CardFooter className={"border-top-0 p-4"}>
                    <Button 
                        className={classNames({"d-flex align-items-center" : buttonStyle === "link"}, {"external-link": !isAppLink(clickUrl)})} 
                        disabled={disabled} outline={buttonStyle === "outline"} color={buttonStyle === "link" ? "link" : "secondary"} 
                        tag={isAppLink(clickUrl) ? Link : ({children, className}) => ExternalLink({href: clickUrl, children, className})} to={clickUrl}
                    >
                        {buttonText || "See more"}
                    </Button>
                </CardFooter>}
            </div>
        </Card>
    </Container>;
};
