import React, {useEffect} from "react";
import {Link, useHistory} from "react-router-dom";
import {Badge, Col, Container, Row} from "reactstrap";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {Tag} from "../../../IsaacAppTypes";
import {
    isAda,
    KEY,
    persistence,
    STAGE,
    STAGE_NULL_OPTIONS,
    TAG_ID,
    tags,
    useQueryParams,
    useUserContext
} from "../../services";
import {PageFragment} from "../elements/PageFragment";
import {Redirect} from "react-router";
import {RenderNothing} from "../elements/RenderNothing";
import {MetaDescription} from "../elements/MetaDescription";

export function AllTopicsWithoutAStage() {
    const history = useHistory();
    const mostRecentAllTopicsPath = persistence.load(KEY.MOST_RECENT_ALL_TOPICS_PATH);
    const queryParams = useQueryParams(true);
    const userContext = useUserContext();

    // We will try our best to make links to /topics go to the expected place
    let stage: string;
    // Almost all cases use the most recent all topics path stored in local storage
    if (mostRecentAllTopicsPath) {
        stage = mostRecentAllTopicsPath;
    // If they are using the old link which used the query param we use that
    } else if (queryParams && queryParams.stage && !STAGE_NULL_OPTIONS.has(queryParams.stage as STAGE)) {
        stage = queryParams.stage;
    // The viewing context's stage seems a sensible next option
    } else if (userContext.stage && !STAGE_NULL_OPTIONS.has(userContext.stage)) {
        stage = userContext.stage;
    // Default to A Level
    } else {
        stage = STAGE.A_LEVEL;
    }

    useEffect(() => {
        // The redirect component doesn't seem to work.
        // Perhaps it is fighting against useUserContext()'s history.replace() - will need to investigate further
        history.push(`/topics/${stage}`);
    })
    return <Redirect to={`/topics/${stage}`} />;
}

const renderTopic = (topic: Tag) => {
    const TextTag = topic.comingSoonDate ? "span" : "strong";
    if (!topic.hidden) {
        return <>
            {topic.comingSoonDate ? <span><TextTag>{topic.title}</TextTag></span>
                :
                <Link
                    to={topic.comingSoonDate ? "/coming_soon" : `/topics/${topic.id}`}
                    className={topic.comingSoonDate ? "text-muted" : ""}
                >
                    <TextTag>
                        {topic.title}
                    </TextTag>
                </Link>
            }
            {" "}
            {topic.comingSoonDate && !topic.new &&
            <Badge color="light" className="border bg-white">Coming {topic.comingSoonDate}</Badge>}
            {topic.new && !topic.comingSoonDate && <Badge color="secondary">New</Badge>}
        </>;
    }
};

const topicColumn = (subTags: Tag[], stage: STAGE.A_LEVEL | STAGE.GCSE) => {
    return <Col key={TAG_ID.computerScience + "_" + subTags[0].id} md={6}>
        {subTags.sort((a, b) => (a.title > b.title) ? 1 : -1)
            // Overwrite subcategory with stage properties
            .map(subcategory => ({...subcategory, ...subcategory.stageOverride?.[stage]}))
            .map(subcategory => {
                    const subcategoryDescendentIds = tags.getDescendents(subcategory.id).map(t => t.id);
                    const topicTags = tags.getTopicTags(subcategoryDescendentIds);
                    const topicComponents =
                        topicTags
                            // Overwrite subcategory with stage properties
                            .map(topic => ({...topic, ...topic.stageOverride?.[stage]}))
                            .map(topic => <li className="border-0 px-0 py-0 pb-1 bg-transparent" key={topic.id}>
                                {renderTopic(topic)}
                            </li>);
                    if (!subcategory.hidden && topicComponents.length > 0) {
                        return <React.Fragment key={subcategory.id}>
                            <h3>{subcategory.title}</h3>
                            <ul className="list-unstyled mb-3 link-list">
                                {topicComponents}
                            </ul>
                        </React.Fragment>
                    }
                }
            )}
    </Col>
};

export const AllTopics = () => {
    // FIXME ADA review use of "a_level" and consider removing stage considerations entirely from this component
    const subcategoryTags = tags.allSubcategoryTags;

    const charToCutAt = "D";
    const firstColTags = subcategoryTags.filter(function (subcategory) {return subcategory.title.charAt(0) <= charToCutAt});
    const secondColTags = subcategoryTags.filter(function (subcategory) {return subcategory.title.charAt(0) > charToCutAt});

    return <div id={"topics-bg"}>
        <Container className={"mb-4"}>
            <TitleAndBreadcrumb currentPageTitle={"Topics"}/>
            {isAda && <MetaDescription description={"Our free Computer Science topics..." /* FIXME ADA wait for copy here */} />}
            <Row>
                <Col lg={{size: 8, offset: 2}} className="pt-md-4">
                    <PageFragment fragmentId={`a_level_all_topics`} ifNotFound={RenderNothing} />
                </Col>
            </Row>
            <Row>
                <Col lg={{size: 8, offset: 2}} className="py-md-4 row">
                    {topicColumn(firstColTags, STAGE.A_LEVEL)}
                    {topicColumn(secondColTags, STAGE.A_LEVEL)}
                </Col>
            </Row>
        </Container>
    </div>;
};
