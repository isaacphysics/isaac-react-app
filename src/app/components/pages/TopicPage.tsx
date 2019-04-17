import React, {useEffect} from "react"
import {Link, withRouter} from "react-router-dom";
import {connect} from "react-redux";
import {AppState} from "../../state/reducers";
import {ContentLinkDTO, LinkType, TopicDTO} from "../../../IsaacAppTypes";
import {fetchTopicDetails} from "../../state/actions";
import {ShowLoading} from "../handlers/ShowLoading";
import {IsaacContent} from "../content/IsaacContent";
import {Badge, ListGroup, ListGroupItem} from "reactstrap";

const stateToProps = (state: AppState, {match: {params: {topicName}}}: any) => ({
    topicName: topicName,
    topic: state ? state.currentTopic : null
});
const actionsToProps = {fetchTopicDetails};

interface TopicPageProps {
    topicName: string,
    topic: TopicDTO | null,
    fetchTopicDetails: (topicName: string) => void
}
const TopicPageComponent = ({topicName, topic, fetchTopicDetails}: TopicPageProps) => {
    useEffect(
        () => {fetchTopicDetails(topicName);},
        [topicName]
    );

    const renderLink = (contentLink: ContentLinkDTO, index: number) => {
        const itemClasses = contentLink.type === LinkType.QUESTION ? "list-group-item-info" : "list-group-item-light";
        const linkClasses = contentLink.comingSoon ? "disabled" : "";
        const comingSoonBadge = contentLink.comingSoon && <Badge color="light">Coming Soon</Badge>;
        return (
            <ListGroupItem key={index} className={itemClasses}>
                <Link to={contentLink.destination} className={linkClasses}>
                    {contentLink.value}{" "}{comingSoonBadge}
                    <span className="float-right">&gt;</span>
                </Link>
            </ListGroupItem>
        )
    };

    return (
        <ShowLoading until={topic}>
            {topic &&
                <React.Fragment>
                    <h1>{topic.title}</h1>
                    <hr/>
                    <IsaacContent doc={topic.description}/>
                    <ListGroup>
                    {topic.contentLinks.map(renderLink)}
                    </ListGroup>
                </React.Fragment>
            }
        </ShowLoading>
    )
};

export const TopicPage = withRouter(connect(stateToProps, actionsToProps)(TopicPageComponent));
