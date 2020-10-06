import React, {useState} from "react";
import {Alert, Button, Col, Row} from "reactstrap";
import * as ApiTypes from "../../../IsaacApiTypes";
import {ContentDTO} from "../../../IsaacApiTypes";
import {IsaacContentValueOrChildren} from "./IsaacContentValueOrChildren";
import {useDispatch, useSelector} from "react-redux";
import {logAction} from "../../state/actions";
import {AppState} from "../../state/reducers";
import {DOCUMENT_TYPE, NOT_FOUND} from "../../services/constants";
import {resourceFound} from "../../services/validation";
import {determineFastTrackPrimaryAction, determineFastTrackSecondaryAction} from "../../services/fastTrack";
import {RouteComponentProps, withRouter} from "react-router";
import queryString from "query-string";
import {useCurrentExamBoard} from "../../services/examBoard";

export const IsaacQuickQuestion = withRouter(({doc, location}: {doc: ApiTypes.IsaacQuickQuestionDTO} & RouteComponentProps) => {
    const {board, questionHistory: questionHistoryUrl}: {board?: string; questionHistory?: string} = queryString.parse(location.search);
    const questionHistory = questionHistoryUrl?.split(",") || [];

    const dispatch = useDispatch();
    const page = useSelector((state: AppState) => state?.doc && state.doc !== NOT_FOUND ? state.doc : undefined);
    const pageCompleted = useSelector((state: AppState) => state?.questions ? state.questions.pageCompleted : false);
    const examBoard = useCurrentExamBoard();
    const isFastTrackPage = page?.type === DOCUMENT_TYPE.FAST_TRACK_QUESTION;

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
    const fastTrackInfo = {doc, correct: false, page, pageCompleted, questionHistory, board, examBoard, canSubmit: true}

    const secondaryAction = determineFastTrackSecondaryAction(fastTrackInfo);

    return <form onSubmit={e => e.preventDefault()}>
        <div className="question-component p-md-5">
            <div className={!isFastTrackPage ? "quick-question" : ""}>
                <div className="question-content clearfix">
                    <IsaacContentValueOrChildren {...doc} />
                </div>
                {!isFastTrackPage ?
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
                    <Col sm="12" md={!isFastTrackPage ? {size: 10, offset: 1} : {}}>
                        <Alert color="secondary" className="overflow-auto">
                            <IsaacContentValueOrChildren {...answer} />
                        </Alert>
                    </Col>
                </Row>}
            </div>
        </div>
    </form>;
});
