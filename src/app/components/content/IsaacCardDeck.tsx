import React from "react";
import {IsaacCard} from "./IsaacCard";
import {IsaacCardDeckDTO} from "../../../IsaacApiTypes";
import {Col, Container, Row} from "reactstrap";

interface IsaacCardDeckProps {
    doc: IsaacCardDeckDTO,
    className?: string
}

export const IsaacCardDeck = ({doc, className}: IsaacCardDeckProps) => {
    const classNameString: string = className !== undefined ? className : "";
    return <Container>
        {doc.title && <Row className="my-4">
            <Col>
                <h3 className="h-title text-center">{doc.title}</h3>
            </Col>
        </Row>}
        <Row className={"card-deck isaac-cards-body my-3" + classNameString}>
            {doc?.cards?.map((props, i) => <IsaacCard key={i} doc={props}/>)}
        </Row>
    </Container>

};