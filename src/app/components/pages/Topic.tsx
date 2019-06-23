import React, {ChangeEvent, useEffect, useMemo, useState} from "react"
import {Link, withRouter} from "react-router-dom";
import {connect} from "react-redux";
import {AppState, user} from "../../state/reducers";
import {fetchTopicSummary} from "../../state/actions";
import {ShowLoading} from "../handlers/ShowLoading";
import {IsaacContent} from "../content/IsaacContent";
import {ContentSummaryDTO, IsaacTopicSummaryPageDTO} from "../../../IsaacApiTypes";
import {LinkToContentSummaryList} from "../elements/ContentSummaryListGroupItem";
import {filterAndSeparateRelatedContent} from "../../services/topics";
import {Button, Col, Container, Input, Label, Row} from "reactstrap";
import {ALL_TOPICS_CRUMB, DOCUMENT_TYPE, EXAM_BOARD, TAG_ID} from "../../services/constants";
import {UserPreferencesDTO} from "../../../IsaacAppTypes";
import {determineExamBoardFrom} from "../../services/examBoard";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";

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

    const [examBoardFilter, setExamBoardFilter] = useState(determineExamBoardFrom(userPreferences));
    useMemo(() => {
        setExamBoardFilter(determineExamBoardFrom(userPreferences));
    }, [userPreferences]);

    let [relatedConcepts, relatedQuestions]: [ContentSummaryDTO[] | null, ContentSummaryDTO[] | null] = [null, null];
    if (topicPage && topicPage.relatedContent) {
        [relatedConcepts, relatedQuestions] = topicPage && topicPage.relatedContent &&
            filterAndSeparateRelatedContent(topicPage.relatedContent, examBoardFilter);
    }

    return <ShowLoading until={topicPage}>
        {topicPage && <Container id="topic-page">
            <Row>
                <Col>
                    <TitleAndBreadcrumb
                        intermediateCrumbs={[ALL_TOPICS_CRUMB]}
                        currentPageTitle={topicPage.title as string}
                    />
                </Col>
            </Row>
            <Row className="pb-5">
                <Col md={{size: 8, offset: 2}} className="py-3">
                    {topicPage.children && topicPage.children.map((child, index) =>
                        <IsaacContent key={index} doc={child}/>)
                    }

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
