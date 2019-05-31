import React, {ChangeEvent, useEffect, useMemo, useState} from "react"
import {Link, withRouter} from "react-router-dom";
import {connect} from "react-redux";
import {AppState} from "../../state/reducers";
import {fetchTopicSummary} from "../../state/actions";
import {ShowLoading} from "../handlers/ShowLoading";
import {IsaacContent} from "../content/IsaacContent";
import {ContentSummaryDTO, IsaacTopicSummaryPageDTO} from "../../../IsaacApiTypes";
import {LinkToContentSummaryList} from "../elements/ContentSummaryListGroupItem";
import {BreadcrumbTrail} from "../elements/BreadcrumbTrail";
import {filterAndSeparateRelatedContent} from "../../services/topics";
import {Button, Col, Container, Input, Label, Row} from "reactstrap";
import {DOCUMENT_TYPE, EXAM_BOARD, TAG_ID} from "../../services/constants";
import {UserPreferencesDTO} from "../../../IsaacAppTypes";

const stateToProps = (state: AppState, {match: {params: {topicName}}}: {match: {params: {topicName: TAG_ID}}}) => ({
    topicName: topicName,
    topicPage: state ? state.currentTopic : null,
    userPreferences: state ? state.userPreferences : null
});
const actionsToProps = {fetchTopicSummary};

interface TopicPageProps {
    topicName: TAG_ID;
    topicPage: IsaacTopicSummaryPageDTO | null;
    fetchTopicSummary: (topicId: TAG_ID) => void;
    userPreferences: UserPreferencesDTO | null;
}
const TopicPageComponent = ({topicName, topicPage, fetchTopicSummary, userPreferences}: TopicPageProps) => {
    useEffect(
        () => {fetchTopicSummary(topicName)},
        [topicName]
    );

    const [examBoardFilter, setExamBoardFilter] = useState(
        userPreferences && userPreferences.EXAM_BOARD && userPreferences.EXAM_BOARD.AQA ?
            EXAM_BOARD.AQA :
            EXAM_BOARD.OCR
    );

    let [relatedConcepts, relatedQuestions]: [ContentSummaryDTO[] | null, ContentSummaryDTO[] | null] = [null, null];
    if (topicPage && topicPage.relatedContent) {
        [relatedConcepts, relatedQuestions] = topicPage && topicPage.relatedContent &&
            filterAndSeparateRelatedContent(topicPage.relatedContent, examBoardFilter);
    }

    useMemo(() => {
        setExamBoardFilter(
            userPreferences && userPreferences.EXAM_BOARD && userPreferences.EXAM_BOARD.AQA ?
                EXAM_BOARD.AQA :
                EXAM_BOARD.OCR
        );
    }, [userPreferences]);

    return <ShowLoading until={topicPage}>
        {topicPage && <Container id="topic-page">
            <Row>
                <Col>
                    <BreadcrumbTrail
                        intermediateCrumbs={[{title: "All topics", to: "/topics"}]}
                        currentPageTitle={topicPage.title as string}
                    />
                    <h1 className="h-title">{topicPage.title}</h1>
                </Col>
            </Row>
            <Row className="pb-5">
                <Col md={{size: 8, offset: 2}} className="py-3">
                    {topicPage.children && topicPage.children.map((child, index) =>
                        <IsaacContent key={index} doc={child}/>)
                    }

                    <div className="text-center mb-4">
                        <Label className="d-inline-block pr-2" for="examBoardSelect">Exam Board</Label>
                        <Input
                            className="w-auto d-inline-block pl-1 pr-0"
                            type="select"
                            name="select"
                            id="examBoardSelect"
                            value={examBoardFilter}
                            onChange={(event: ChangeEvent<HTMLInputElement>) => setExamBoardFilter(
                                (event.target.value == EXAM_BOARD.AQA ? EXAM_BOARD.AQA : EXAM_BOARD.OCR)
                            )}
                        >
                            <option value={EXAM_BOARD.OCR}>{EXAM_BOARD.OCR}</option>
                            <option value={EXAM_BOARD.AQA}>{EXAM_BOARD.AQA}</option>
                        </Input>
                    </div>

                    {relatedConcepts && <LinkToContentSummaryList items={relatedConcepts} className="my-4" />}
                    {relatedQuestions && <LinkToContentSummaryList items={relatedQuestions} className="my-4" />}

                    <Button tag={Link} to="/coming_soon" color="secondary" block size="lg" className="my-4">
                        More coming soon&hellip;
                    </Button>
                </Col>
            </Row>
        </Container>}
    </ShowLoading>;
};

export const Topic = withRouter(connect(stateToProps, actionsToProps)(TopicPageComponent));
