import React from "react";
import { Col, Row } from "reactstrap";
import { difficultyLabelMap, siteSpecific } from "../../../services";
import { closeActiveModal, store } from "../../../state";
import { DifficultyIcons } from "../svg/DifficultyIcons";
import { Difficulty } from "../../../../IsaacApiTypes";
import { ActiveModal } from "../../../../IsaacAppTypes";

const DifficultyPanel = ({difficulty, explanation} : {difficulty: Difficulty, explanation: string}) => {
    return <Col className="mb-4">
        <Row>
            <div className="d-flex flex-row align-items-center">
                <b>{difficultyLabelMap[difficulty]}</b>
                <div className="hierarchy-tags text-center w-max-content ps-2 hierarchy-tag-offset">
                    <DifficultyIcons blank difficulty={difficulty} />
                </div>
            </div>
        </Row>
        <Row>
            <div>
                {explanation}
            </div>
        </Row>
    </Col>;
};

const QuestionFinderDifficultyModal = () => {
    return <Col>
        <DifficultyPanel difficulty={"practice_1"} explanation={"A question which requires one core concept to be directly applied."}/>
        <DifficultyPanel difficulty={"practice_2"} explanation={"A question which requires one advanced concept to be directly applied."}/>
        <DifficultyPanel difficulty={"challenge_1"} explanation={"A question which requires the application of multiple core concepts."}/>
        <DifficultyPanel difficulty={"challenge_2"} explanation={"A question which includes the application of multiple concepts (core and/or advanced), which must be selected and combined with skill."}/>
    </Col>;
};

export const questionFinderDifficultyModal = () : ActiveModal => {
    return {
        closeAction: () => store.dispatch(closeActiveModal()),
        title: `Difficulty ${siteSpecific("Levels", "levels")}`,
        body: <QuestionFinderDifficultyModal />,
    };
};