import React, {useState} from "react";
import {Alert, Button, Col, Row} from "reactstrap";
import * as ApiTypes from "../../../IsaacApiTypes";
import {ContentDTO} from "../../../IsaacApiTypes";
import {IsaacContentValueOrChildren} from "./IsaacContentValueOrChildren";
import {useDispatch} from "react-redux";
import {logAction} from "../../state/actions";
import {determineFastTrackSecondaryAction, useFastTrackInformation} from "../../services/fastTrack";
import {RouteComponentProps, withRouter} from "react-router";

export const IsaacQuickQuestion = withRouter(({doc, location}: {doc: ApiTypes.IsaacQuickQuestionDTO} & RouteComponentProps) => {
    const dispatch = useDispatch();
    const fastTrackInfo = useFastTrackInformation(doc, location);
    const [isVisible, setVisible] = useState(false);
    const answer: ContentDTO = doc.answer as ContentDTO;
    const secondaryAction = determineFastTrackSecondaryAction(fastTrackInfo);

    const toggle = () => {
        const isNowVisible = !isVisible;
        setVisible(isNowVisible);
        if (isNowVisible) {
            const eventDetails = {type: "QUICK_QUESTION_SHOW_ANSWER", questionId: doc.id};
            dispatch(logAction(eventDetails));
        }
    };

    return <form onSubmit={e => e.preventDefault()}>
        <div className="question-component p-md-5">
            <div className={!fastTrackInfo.isFastTrackPage ? "quick-question" : ""}>
                <div className="question-content clearfix">
                    <IsaacContentValueOrChildren {...doc} />
                </div>
                {!fastTrackInfo.isFastTrackPage ?
                    <Row>
                        <Col sm="12" md={{size: 10, offset: 1}}>
                            <Button color="secondary" block className={isVisible ? "active" : ""} onClick={toggle}>
                                {isVisible ? "Hide answer" : "Show answer"}
                            </Button>
                        </Col>
                    </Row>
                    :
                    <div className={`d-flex align-items-stretch flex-column-reverse flex-sm-row flex-md-column-reverse flex-lg-row mb-4`}>
                        {secondaryAction && <div className={`m-auto pt-3 pb-1 w-100 w-sm-50 w-md-100 w-lg-50 pr-sm-2 pr-md-0 pr-lg-3`}>
                            <input {...secondaryAction} className="h-100 btn btn-outline-primary btn-block" />
                        </div>}
                        <div className={`m-auto pt-3 pb-1 w-100 w-sm-50 w-md-100 w-lg-50 "pl-sm-2 pl-md-0 pl-lg-3`}>
                            <input
                                onClick={toggle} value={isVisible ? "Hide answer" : "Show answer"}
                                className={`h-100 btn btn-secondary btn-block {isVisible ? "active" : ""}`}
                            />
                        </div>
                    </div>
                }
                {isVisible && <Row>
                    <Col sm="12" md={!fastTrackInfo.isFastTrackPage ? {size: 10, offset: 1} : {}}>
                        <Alert color="secondary" className="overflow-auto">
                            <IsaacContentValueOrChildren {...answer} />
                        </Alert>
                    </Col>
                </Row>}
            </div>
        </div>
    </form>;
});
