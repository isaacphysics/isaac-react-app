import React, {useEffect} from "react"
import {Link, withRouter} from "react-router-dom";
import {connect} from "react-redux";
import {AppState} from "../../state/reducers";
import {fetchTopicDetails} from "../../state/actions";
import {ShowLoading} from "../handlers/ShowLoading";
import {IsaacContent} from "../content/IsaacContent";
import {Button, Col, Container, ListGroup, ListGroupItem, Row} from "reactstrap";
import {ContentSummaryDTO, IsaacTopicSummaryPageDTO} from "../../../IsaacApiTypes";
import {DOCUMENT_TYPE, TAG_ID} from "../../services/constants";

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

    const renderLink = (contentSummaryDTO: ContentSummaryDTO, index: number) => {
        let linkDestination, icon;
        let itemClasses = "p-0 ";
        switch (contentSummaryDTO.type) {
            case (DOCUMENT_TYPE.QUESTION):
                itemClasses += "text-info";
                linkDestination = `/questions/${contentSummaryDTO.id}`;
                icon = "❓";
                break;
            case (DOCUMENT_TYPE.CONCEPT): default:
                itemClasses += "";
                linkDestination = `/concepts/${contentSummaryDTO.id}`;
                icon = "📝";
        }
        return <ListGroupItem key={index} className={itemClasses}>
            <Link to={linkDestination}>
                <ListGroup tag="div" className="list-group-horizontal">
                    <ListGroupItem tag="span" className="topic-link-section">{icon}</ListGroupItem>
                    <ListGroupItem tag="span" className="w-100 topic-link-section">{contentSummaryDTO.title}</ListGroupItem>
                    <ListGroupItem tag="span" className="float-right topic-link-section">&gt;</ListGroupItem>
                </ListGroup>
            </Link>
        </ListGroupItem>;
    };

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
                    {relatedConcepts && <ListGroup className="my-4">
                        {relatedConcepts.map(renderLink)}
                    </ListGroup>}
                    {relatedQuestions && <ListGroup  className="my-4">
                        {relatedQuestions.map(renderLink)}
                    </ListGroup>}
                    <Button tag={Link} to="/coming_soon" color="secondary" block>More coming soon&hellip;</Button>
                </Col>
            </Row>
        </Container>}
    </ShowLoading>;
};

export const Topic = withRouter(connect(stateToProps, actionsToProps)(TopicPageComponent));
