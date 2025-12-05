import classNames from "classnames";
import React from "react";
import {Button, Card, CardBody, CardFooter, CardImg, CardTitle} from "reactstrap";
import { isAppLink } from "../../../services";
import { Link } from "react-router-dom";
import { ExternalLink } from "../ExternalLink";

export interface AdaCardContentProps {
    title: string;
    image: {src: string, altText?: string, className?: string};
    bodyText?: string;
    clickUrl?: string;
    buttonText?: string;
    buttonStyle?: "outline" | "link" | "card";
    buttonAltText?: string;
    disabled?: boolean;
    className?: string;
}

export interface AdaCardProps extends React.HTMLAttributes<HTMLDivElement> {
    card: AdaCardContentProps;
}

export const AdaCard = ({card, ...props}: AdaCardProps) => {
    const {title, image, bodyText, clickUrl, buttonText, buttonStyle, buttonAltText, disabled} = card;
    return <div {...props} className={classNames("cs-card-container", props?.className ?? "")}>
        <Card className={classNames("cs-card border-0", card.className)} tag={buttonStyle === "card" ? Link : Card}>
            {image && <CardImg src={image.src} alt={image.altText ?? ""} className={image.className ?? ""}/>}
            <div className={classNames("d-flex flex-column h-100", {"pb-4" : !clickUrl || buttonStyle === "card"})}>
                <CardTitle className="px-4 mt-4">
                    <h3 className="mt-2 mb-0">{title}</h3>
                </CardTitle>
                <CardBody className="pt-2 pb-1 px-4">
                    {bodyText 
                        ? <p className="mb-0">{bodyText}</p>
                        : props.children                    
                    }
                </CardBody>
                {clickUrl && buttonStyle !== "card" && <CardFooter className={"border-top-0 p-4"}>
                    {isAppLink(clickUrl) ? 
                        <Button className={classNames({"d-flex align-items-center" : buttonStyle === "link"})} disabled={disabled}
                            outline={buttonStyle === "outline"} color={buttonStyle === "link" ? "link" : "secondary"} 
                            tag={Link} to={clickUrl} aria-label={buttonAltText}
                        >
                            {buttonText || "See more"}
                        </Button> :
                        <ExternalLink asButton href={clickUrl}>
                            {buttonText || "See more"}
                        </ExternalLink>
                    }
                </CardFooter>}
            </div>
        </Card>
    </div>;
};
