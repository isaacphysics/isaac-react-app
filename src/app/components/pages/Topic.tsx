import React, {useEffect} from "react"
import {Link, withRouter} from "react-router-dom";
import {connect} from "react-redux";
import {AppState} from "../../state/reducers";
import {fetchTopicDetails} from "../../state/actions";
import {ShowLoading} from "../handlers/ShowLoading";
import {IsaacContent} from "../content/IsaacContent";
import {Button, Col, Container, Row} from "reactstrap";
import {IsaacTopicSummaryPageDTO} from "../../../IsaacApiTypes";
import {DOCUMENT_TYPE, TAG_ID} from "../../services/constants";
import {LinkToContentSummaryList} from "../elements/ContentSummaryListGroupItem";

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

    const relatedConcepts = topicPage && topicPage.relatedContent &&
        topicPage.relatedContent.filter(content => content.type === DOCUMENT_TYPE.CONCEPT);
    const relatedQuestions = topicPage && topicPage.relatedContent &&
        topicPage.relatedContent.filter(content => content.type === DOCUMENT_TYPE.QUESTION);

    return <ShowLoading until={topicPage}>
        {topicPage && <Container id="topic-page">
            <Row>
                <Col>
                    {/* TODO Breadcrumbs */}
                    <h1 className="h-title">{topicPage.title}</h1>
                </Col>
            </Row>
            <Row>
                <Col md={{size: 8, offset: 2}} className="py-3">
                    {topicPage.children && topicPage.children.map((child, index) =>
                        <IsaacContent key={index} doc={child}/>)
                    }
                    {relatedConcepts && <LinkToContentSummaryList items={relatedConcepts} className="my-4" />}
                    {relatedQuestions && <LinkToContentSummaryList items={relatedQuestions} className="my-4" />}
                    <Button tag={Link} to="/page/coming_soon" color="secondary" block>More coming soon&hellip;</Button>
                </Col>
            </Row>
        </Container>}
    </ShowLoading>;
};

export const Topic = withRouter(connect(stateToProps, actionsToProps)(TopicPageComponent));
