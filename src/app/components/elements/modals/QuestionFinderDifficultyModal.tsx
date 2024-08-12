import React from "react";
import { Col } from "reactstrap";
import { siteSpecific } from "../../../services";
import { closeActiveModal, store } from "../../../state";
import { ActiveModal } from "../../../../IsaacAppTypes";

const QuestionFinderDifficultyModal = () => {
    return <Col>
        {siteSpecific(<p>
            Practice questions let you directly apply one idea.
            <ul>
                <li>
                    P1 covers revision of a previous stage or topics near the beginning of a course
                </li>
                <li>
                    P3 covers later topics.
                </li>
            </ul>
            Challenge questions are solved by combining multiple concepts and creativity.
            <ul>
                <li>
                    C1 can be attempted near the beginning of your course
                </li>
                <li>
                    C3 require more creativity and could be attempted later in a course.
                </li>
            </ul>
        </p>, <p>
            We split our questions into two categories:
            <ul>
                <li>
                    Practice questions focus on one concept
                </li>
                <li>
                    Challenge questions combine multiple concepts
                </li>
            </ul>
        </p>)}
    </Col>;
};

export const questionFinderDifficultyModal = () : ActiveModal => {
    return {
        closeAction: () => store.dispatch(closeActiveModal()),
        title: siteSpecific("Difficulty Levels", "What do the difficulty levels mean?"),
        body: <QuestionFinderDifficultyModal />,
    };
};
