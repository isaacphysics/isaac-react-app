import React, {useState} from "react";
import {Alert, Row, Col, Button} from "reactstrap";
import * as ApiTypes from "../../../IsaacApiTypes";
import {ContentDTO} from "../../../IsaacApiTypes";
import {IsaacContentValueOrChildren} from "./IsaacContentValueOrChildren";


interface IsaacQuickQuestionProps {
    doc: ApiTypes.IsaacQuickQuestionDTO;
}
export const IsaacQuickQuestion = (props: IsaacQuickQuestionProps) => {
    const {doc} = props;

    const [isVisible, setVisible] = useState(false);

    const answer: ContentDTO = doc.answer as ContentDTO;

    return <div className="question-component p-md-5">
        <div className="quick-question">
            <div className="question-content">
                <IsaacContentValueOrChildren {...doc} />
            </div>
            <Row>
                <Col sm="12" md={{size: 10, offset: 1}}>
                    <Button color="secondary" block className={isVisible ? "active": ""} onClick={() => setVisible(!isVisible)}>
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
