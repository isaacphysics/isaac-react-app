import React, {ChangeEvent, useEffect, useState} from "react"
import {Link, withRouter} from "react-router-dom";
import {connect} from "react-redux";
import {AppState} from "../../state/reducers";
import {fetchTopicDetails} from "../../state/actions";
import {ShowLoading} from "../handlers/ShowLoading";
import {IsaacContent} from "../content/IsaacContent";
import {Button, Col, Container, Row, FormGroup, Label, Input} from "reactstrap";
import {IsaacTopicSummaryPageDTO} from "../../../IsaacApiTypes";
import {DOCUMENT_TYPE, EXAM_BOARD, TAG_ID} from "../../services/constants";
import {LinkToContentSummaryList} from "../elements/ContentSummaryListGroupItem";
import {BreadcrumbTrail} from "../content/BreadcrumbTrail";

const stateToProps = (state: AppState, {match: {params: {topicName}}}: any) => ({
    topicName: topicName,
    topicPage: state ? state.currentTopic : null
});
const actionsToProps = {fetchTopicDetails};

interface TopicPageProps {
    topicName: TAG_ID;
    topicPage: IsaacTopicSummaryPageDTO | null;
    fetchTopicDetails: (topicName: TAG_ID) => void;
}
const TopicPageComponent = ({topicName, topicPage, fetchTopicDetails}: TopicPageProps) => {
    useEffect(
        () => {fetchTopicDetails(topicName);},
        [topicName]
    );
    const [examBoardFilter, setExamBoardFilter] = useState(EXAM_BOARD.AQA);
    const examBoardTagMap = {
        AQA: "examboard_aqa",
        OCR: "examboard_ocr",
    };
    const examBoardFilteredContent = topicPage && topicPage.relatedContent &&
        topicPage.relatedContent.filter(content => content.tags && content.tags.includes(examBoardTagMap[examBoardFilter]));
    const relatedConcepts = examBoardFilteredContent &&
        examBoardFilteredContent.filter(content => content.type === DOCUMENT_TYPE.CONCEPT);
    const relatedQuestions = examBoardFilteredContent &&
        examBoardFilteredContent.filter(content => content.type === DOCUMENT_TYPE.QUESTION);

    return <ShowLoading until={topicPage}>
        {topicPage && <Container id="topic-page">
            <Row>
                <Col>
                    <BreadcrumbTrail currentPageTitle={topicPage.title} />
                    <h1 className="h-title">{topicPage.title}</h1>
                </Col>
            </Row>
            <Row className="pb-5">
                <Col md={{size: 8, offset: 2}} className="py-3">
                    {topicPage.children && topicPage.children.map((child, index) =>
                        <IsaacContent key={index} doc={child}/>)
                    }
                    <div className="text-center">
                        <Label className="d-inline-block pr-2" for="examBoardSelect">Exam Board</Label>
                        <Input
                            className="w-auto d-inline-block pl-1 pr-0"
                            type="select"
                            name="select"
                            id="examBoardSelect"
                            value={examBoardFilter}
                            onChange={(event: ChangeEvent<HTMLInputElement>) => setExamBoardFilter(event.target.value as EXAM_BOARD)}
                        >
                            <option value={EXAM_BOARD.AQA}>{EXAM_BOARD.AQA}</option>
                            <option value={EXAM_BOARD.OCR}>{EXAM_BOARD.OCR}</option>
                        </Input>
                    </div>
                    {relatedConcepts && <LinkToContentSummaryList items={relatedConcepts} className="my-4" />}
                    {relatedQuestions && <LinkToContentSummaryList items={relatedQuestions} className="my-4" />}
                    <Button tag={Link} to="/coming_soon" color="secondary" block>More coming soon&hellip;</Button>
                </Col>
            </Row>
        </Container>}
    </ShowLoading>;
};

export const Topic = withRouter(connect(stateToProps, actionsToProps)(TopicPageComponent));
