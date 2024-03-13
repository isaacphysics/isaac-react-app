import React from "react";
import {Link} from "react-router-dom";
import {Badge, Button, Col, Container, Row} from "reactstrap";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {Tag} from "../../../IsaacAppTypes";
import {
    STAGE,
    TAG_ID,
    tags} from "../../services";
import {PageFragment} from "../elements/PageFragment";
import {RenderNothing} from "../elements/RenderNothing";
import {MetaDescription} from "../elements/MetaDescription";
import classNames from "classnames";

const renderTopic = (topic: Tag) => {
    if (!topic.hidden) {
        return <>
            {topic.comingSoonDate
                ? <span className={"font-weight-semi-bold"}>{topic.title}</span>
                : <Link
                    to={topic.comingSoonDate ? "/coming_soon" : `/topics/${topic.id}`}
                    className={classNames("font-weight-semi-bold", {"text-muted": topic.comingSoonDate})}
                >
                    {topic.title}
                </Link>
            }
            {" "}
            {topic.comingSoonDate && !topic.new &&
            <Badge color="light" className="border bg-white">Coming {topic.comingSoonDate}</Badge>}
            {topic.new && !topic.comingSoonDate && <Badge color="secondary">New</Badge>}
        </>;
    }
};

const topicColumn = (subTags: Tag[], stage: STAGE.ALL | STAGE.A_LEVEL | STAGE.GCSE) => {
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
                        </React.Fragment>;
                    }
                }
            )}
    </Col>;
};

export const AllTopics = () => {
    const subcategoryTags = tags.allSubcategoryTags;

    const charToCutAt = "D";
    const firstColTags = subcategoryTags.filter(function (subcategory) {return subcategory.title.charAt(0) <= charToCutAt;});
    const secondColTags = subcategoryTags.filter(function (subcategory) {return subcategory.title.charAt(0) > charToCutAt;});

    const metaDescription = "Discover our free computer science topics and questions. Learn or revise for your exams with us today.";

    return <div id={"topics-bg"}>
        <Container className={"mb-4"}>
            <TitleAndBreadcrumb currentPageTitle={"Topics"} />
            <MetaDescription description={metaDescription} />
            <Row>
                <Col lg={{size: 8, offset: 2}} className="pt-3 pt-md-4">
                    <PageFragment fragmentId={`${STAGE.ALL}_all_topics`} ifNotFound={RenderNothing} />
                </Col>
            </Row>
            <Row>
                <Col lg={{size: 8, offset: 2}} className="py-md-4 row">
                    {topicColumn(firstColTags, STAGE.ALL)}
                    {topicColumn(secondColTags, STAGE.ALL)}
                </Col>
            </Row>
        </Container>
        <section id={'topics-question-finder'}>
            <Container className={"mb-5 p-5 mx-auto"}>
                <Row className={"align-items-center justify-content-center"}>
                    <Col xs={12} lg={6}>
                        <h2 className={"font-size-1-75 mb-4"}>Check your understanding</h2>
                        <p>
                            Using the Question finder you can select topics and concepts and we’ll generate a random
                            selection questions for you to use. You can also specify your level and exam board.
                        </p>
                        <p><b>Students</b> might want to try our Question Finder to revise and get feedback on any
                            mistakes.</p>
                        <p><b>Teachers</b> might want to try our Question Finder to create quizzes and assign them to
                            students.</p>
                        <Button className={"mt-4"} tag={Link} to="/quizzes/new" color='dark-primary'>
                            Try our question finder
                        </Button>
                    </Col>
                    <Col xs={12} lg={6} className={"mt-4 mt-lg-0"}>
                        <picture>
                            <source srcSet="/assets/cs/decor/question-finder-dark.svg" type="image/svg"/>
                            <img className={"d-block w-100"} src={"/assets/cs/decor/question-finder-dark.svg"} alt="" />
                        </picture>
                    </Col>
                </Row>
            </Container>
        </section>
    </div>;
};
