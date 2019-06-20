import React, {useState} from "react";
import {Alert, Row, Col, Button} from "reactstrap";
import * as ApiTypes from "../../../IsaacApiTypes";
import {ContentDTO} from "../../../IsaacApiTypes";
import {IsaacContentValueOrChildren} from "./IsaacContentValueOrChildren";
import {connect} from "react-redux";
import {logAction} from "../../state/actions";


interface IsaacQuickQuestionProps {
    doc: ApiTypes.IsaacQuickQuestionDTO;
    logAction: (eventDetails: object) => void;
}
export const IsaacQuickQuestionComponent = (props: IsaacQuickQuestionProps) => {
    const {doc, logAction} = props;

    const [isVisible, setVisible] = useState(false);

    const toggle = () => {
        const isNowVisible = !isVisible;
        setVisible(isNowVisible);
        if (isNowVisible) {
            const eventDetails = {type: "QUICK_QUESTION_SHOW_ANSWER", questionId: doc.id};
            logAction(eventDetails);
        }
    };

    const answer: ContentDTO = doc.answer as ContentDTO;

    return <div className="question-component p-md-5">
        <div className="quick-question">
            <div className="question-content">
                <IsaacContentValueOrChildren {...doc} />
            </div>
            <Row>
                <Col sm="12" md={{size: 10, offset: 1}}>
                    <Button color="secondary" block className={isVisible ? "active": ""} onClick={toggle}>
                        {isVisible ? "Hide answer" : "Show answer"}
                    </Button>
                </Col>
            </Row>
            {isVisible &&
            <Row>
                <Col sm="12" md={{size: 10, offset: 1}}>
                    <Alert color="secondary">
                        <IsaacContentValueOrChildren {...answer} />
                    </Alert>
                </Col>
            </Row>
            }
        </div>
    </div>
    ;
};

export const IsaacQuickQuestion = connect(null, {logAction: logAction})(IsaacQuickQuestionComponent);
