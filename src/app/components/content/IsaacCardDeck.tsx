import React from "react";
import {IsaacCard} from "./IsaacCard";
import {IsaacCardDeckDTO} from "../../../IsaacApiTypes";
import {Col, Container, Row} from "reactstrap";
import classNames from "classnames";
import {isPhy, siteSpecific} from "../../services";


const MAX_CARDS_IN_CONTENT_DEFINED_DECK = 3;
interface IsaacCardDeckProps {
    doc: IsaacCardDeckDTO,
    className?: string
    containerClassName?: string
}
export const IsaacCardDeck = ({doc, className, containerClassName}: IsaacCardDeckProps) => {
    const noCards = Math.min(doc?.cards?.length || MAX_CARDS_IN_CONTENT_DEFINED_DECK, MAX_CARDS_IN_CONTENT_DEFINED_DECK);
    return <Container className={classNames("px-0", containerClassName)}>
        {doc.title && <Row className="my-4">
            <Col>
                <h3 className={classNames("h-title", {"text-center": isPhy})}>{doc.title}</h3>
            </Col>
        </Row>}
        {
            siteSpecific(
                <Row xs={12} className={classNames(`d-flex flex-row card-deck row-cols-1 row-cols-sm-2 row-cols-xl-${noCards} justify-content-between isaac-cards-body`, className)}>
                    {doc?.cards?.map((props, i) => <div key={i} className="card-container p-3"> 
                        <IsaacCard doc={props} imageClassName={props.imageClassName}/>
                    </div>)}
                </Row>
                ,
                <Row className={classNames(`d-flex flex-row card-deck row-cols-1 row-cols-md-2 justify-content-between my-3`, className)}>
                    {doc?.cards?.map((props, i) => <IsaacCard key={i} doc={props}/>)}
                </Row>
            )
        }
    </Container>;
};
