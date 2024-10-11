import classNames from "classnames";
import React from "react";
import {Button, Card, CardBody, CardFooter, CardImg, CardTitle, Container, ContainerProps} from "reactstrap";
import { isAppLink } from "../../../services";
import { Link } from "react-router-dom";

export interface AdaCardContentProps {
    title: string;
    image: {src: string, altText?: string};
    bodyText: string;
    clickUrl?: string;
    buttonText?: string;
    disabled?: boolean;
    buttonStyle?: "outline" | "link";
}

export interface AdaCardProps extends ContainerProps {
    card: AdaCardContentProps;
}

export const AdaCard = ({card, ...props}: AdaCardProps) => {
    const {title, image, bodyText, clickUrl} = card;
    return <Container {...props} className={classNames("cs-card-container px-3 my-3", props?.className ?? "")}>
        <Card className={"cs-card border-0"}>
            {image && <CardImg src={card.image.src} alt={image.altText ?? ""}/>}
            <div className="d-flex flex-column h-100">
                <CardTitle className="px-4 mt-4">
                    <h3 className="mt-2 mb-0">{title}</h3>
                </CardTitle>
                <CardBody className="pt-2 pb-1 px-4">
                    <p className="mb-0">{bodyText}</p>
                </CardBody>
                {clickUrl && isAppLink(clickUrl) && <CardFooter className={"border-top-0 p-4"}>
                    <Button className={classNames({"d-flex align-items-center" : card.buttonStyle === "link"})} disabled={card.disabled} outline={card.buttonStyle === "outline"} color={card.buttonStyle === "link" ? "link" : "secondary"} tag={Link} to={clickUrl}>
                        {card?.buttonText || "See more"}
                    </Button>
                </CardFooter>}
            </div>
        </Card>
    </Container>;
};
