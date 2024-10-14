import classNames from "classnames";
import React from "react";
import {Button, Card, CardBody, CardFooter, CardTitle, Container, ContainerProps} from "reactstrap";
import { isAppLink } from "../../../services";
import { Link } from "react-router-dom";

export interface IconCardContentProps {
    title: string;
    icon: {src: string, altText?: string};
    bodyText: string;
    tag?: string;
    clickUrl?: string;
    buttonText?: string;
    disabled?: boolean;
    buttonStyle?: "outline" | "link";
}

export interface IconCardProps extends ContainerProps {
    card: IconCardContentProps;
}

export const IconCard = ({card, ...props}: IconCardProps) => {
    const {title, icon, bodyText, tag, clickUrl, buttonText, disabled, buttonStyle} = card;
    return <Container {...props} className={classNames("icon-card-container px-3 my-3", props?.className ?? "")}>
        <Card className={"icon-card border-0"}>
            <img src={icon.src} alt={icon.altText ?? ""}/>
            {tag && <div className="icon-card-tag">
                <span><b>{tag}</b></span>
            </div>}
            <div className="d-flex flex-column h-100 icon-card-main-content">
                <CardTitle className="px-4 mt-4">
                    <h3 className="mb-0">{title}</h3>
                </CardTitle>
                <CardBody className="pt-2 pb-1 px-4">
                    <p className="mb-0">{bodyText}</p>
                </CardBody>
                {clickUrl && isAppLink(clickUrl) && <CardFooter className={"border-top-0 p-4"}>
                    <Button className={classNames({"d-flex align-items-center" : buttonStyle === "link"})} disabled={disabled} outline={buttonStyle === "outline"} color={buttonStyle === "link" ? "link" : "secondary"} tag={Link} to={clickUrl}>
                        {buttonText || "See more"}
                    </Button>
                </CardFooter>}
            </div>
        </Card>
    </Container>;
};