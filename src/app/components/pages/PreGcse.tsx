import React from "react";
import {Col, Container, Row} from "reactstrap";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {IsaacCard} from "../content/IsaacCard";

export const PreGcse = () => {
    return<Container>
        <Row className="pb-4">
            <Col>
                <TitleAndBreadcrumb currentPageTitle={"11-14 Resources"} />
            </Col>
        </Row>
        <Row className="mb-3">
            <Col>
                <p className="subtitle">
                    Isaac Physics provides you with a huge range of resources to support your learning of Physics, in the classroom or at home – all for free.
                </p>
            </Col>
        </Row>
        <Row className="card-deck isaac-cards-body mb-5">
            <IsaacCard doc={{title: "Year 7 & 8 - Coming Soon", subtitle: "Do look here again in mid-July!", disabled: true,
                clickUrl: "", image: {src: "/assets/phy/key_stage_sprite.svg#teacher-hat"}
            }}/>
            <IsaacCard doc={{title: "Year 9 - Step Up to GCSE", subtitle: "New resources for a strong foundation in Physics.",
                clickUrl: "/books/step_up_phys", image: {src: "/assets/phy/key_stage_sprite.svg#skills-book-cover"}
            }}/>
        </Row>
    </Container>
};
