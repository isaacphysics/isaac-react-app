import React, {useEffect} from "react";
import {withRouter} from "react-router-dom";
import {connect} from "react-redux";
import {Button, Col, Container, Row} from "reactstrap";
import queryString from "query-string";
import {fetchDoc} from "../../state/actions";
import {ShowLoading} from "../handlers/ShowLoading";
import {IsaacContent} from "../content/IsaacContent";
import {AppState} from "../../state/reducers";
import {ContentDTO} from "../../../IsaacApiTypes";
import {BreadcrumbTrail} from "../elements/BreadcrumbTrail";
import {DOCUMENT_TYPE} from "../../services/constants";

const stateToProps = (state: AppState, {match: {params: {questionId}}, location: {search}}: any) => {
    return {
        doc: state ? state.doc : null,
        urlQuestionId: questionId,
        queryParams: queryString.parse(search)
    };
};
const dispatchToProps = {fetchDoc};

interface QuestionPageProps {
    doc: ContentDTO | null;
    urlQuestionId: string;
    queryParams: {board?: string};
    history: any;
    fetchDoc: (documentType: DOCUMENT_TYPE, questionId: string) => void;
}
const QuestionPageComponent = (props: QuestionPageProps) => {
    const {doc, urlQuestionId, queryParams, history, fetchDoc} = props;

    useEffect(
        () => {fetchDoc(DOCUMENT_TYPE.QUESTION, urlQuestionId);},
        [urlQuestionId]
    );

    const goBackToBoard = () => {
        history.push(`/gameboards#${queryParams.board}`);
    };

    return <ShowLoading until={doc}>
        {doc && <div className="pattern-01">
            <Container>
                {/*FastTrack progress bar*/}
                {/*Print options*/}
                {/*High contrast option*/}
                <Row>
                    <Col>
                        <BreadcrumbTrail currentPageTitle={doc.title} />
                        <h1 className="h-title">{doc.title}</h1>
                    </Col>
                </Row>
                <Row>
                    <Col md={{size: 8, offset: 2}} className="py-4 question-panel">
                        <IsaacContent doc={doc} />

                        {/* Superseded notice */}

                        <p>{doc.attribution}</p>

                        {queryParams && queryParams.board &&
                            <Button color="secondary" onClick={goBackToBoard}>Back to board</Button>
                        }

                        {/*FooterPods related-content="questionPage.relatedContent"*/}
                    </Col>
                </Row>
            </Container>
        </div>}
    </ShowLoading>;
};

export const Question = withRouter(connect(stateToProps, dispatchToProps)(QuestionPageComponent));
