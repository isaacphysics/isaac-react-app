import React from "react";
import {IsaacCard} from "./IsaacCard";
import {IsaacCardDeckDTO} from "../../../IsaacApiTypes";
import {Col, Container, Row} from "reactstrap";
import classNames from "classnames";

interface IsaacCardDeckProps {
    doc: IsaacCardDeckDTO,
    className?: string
}

export const IsaacCardDeck = ({doc, className}: IsaacCardDeckProps) => {
    return <Container>
        {doc.title && <Row className="my-4">
            <Col>
                <h3 className="h-title text-center">{doc.title}</h3>
            </Col>
        </Row>}
        <Row className={classNames("card-deck isaac-cards-body my-3", className)}>
            {doc?.cards?.map((props, i) => <IsaacCard key={i} doc={props}/>)}
        </Row>
    </Container>

};