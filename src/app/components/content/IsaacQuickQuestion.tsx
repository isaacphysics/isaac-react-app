import React, {useState} from "react";
import {Alert, Button, Col, Row} from "reactstrap";
import * as ApiTypes from "../../../IsaacApiTypes";
import {ContentDTO} from "../../../IsaacApiTypes";
import {IsaacContentValueOrChildren} from "./IsaacContentValueOrChildren";
import {useDispatch} from "react-redux";
import {logAction} from "../../state/actions";


export const IsaacQuickQuestion = ({doc}: {doc: ApiTypes.IsaacQuickQuestionDTO}) => {
    const dispatch = useDispatch();
    const [isVisible, setVisible] = useState(false);

    const toggle = () => {
        const isNowVisible = !isVisible;
        setVisible(isNowVisible);
        if (isNowVisible) {
            const eventDetails = {type: "QUICK_QUESTION_SHOW_ANSWER", questionId: doc.id};
            dispatch(logAction(eventDetails));
        }
    };

    const answer: ContentDTO = doc.answer as ContentDTO;

    return <div className="question-component p-md-5">
        <div className="quick-question clearfix">
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
            {isVisible && <Row>
                <Col sm="12" md={{size: 10, offset: 1}}>
                    <Alert color="secondary" className="overflow-auto">
                        <IsaacContentValueOrChildren {...answer} />
                    </Alert>
                </Col>
            </Row>}
        </div>
    </div>
    ;
};
