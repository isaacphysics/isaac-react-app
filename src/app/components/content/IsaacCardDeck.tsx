import React from "react";
import {IsaacCard} from "./IsaacCard";
import {IsaacCardDeckDTO} from "../../../IsaacApiTypes";
import {CardDeck, Col, Container, Row} from "reactstrap";
import classNames from "classnames";
import {isPhy} from "../../services";

interface IsaacCardDeckProps {
    doc: IsaacCardDeckDTO,
    className?: string
}

export const IsaacCardDeck = ({doc, className}: IsaacCardDeckProps) => {
    return <Container className={"px-0"}>
        {doc.title && <Row className="my-4">
            <Col>
                <h3 className={classNames("h-title", {"text-center": isPhy})}>{doc.title}</h3>
            </Col>
        </Row>}
        <CardDeck className={classNames("card-deck isaac-cards-body my-3", className)}>
            {doc?.cards?.map((props, i) => <IsaacCard key={i} doc={props} imageClassName={props.imageClassName}/>)}
        </CardDeck>
    </Container>

};