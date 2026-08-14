import React from "react";
import {Link} from "react-router-dom";
import {Badge, Button, Card, CardBody, Col, Container, Row} from "reactstrap";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {AdaTopicBase, Tag} from "../../../IsaacAppTypes";
import {
    Ada11To14TopicsToConcepts,
    PATHS,
    STAGE,
    TAG_ID,
    tags
} from "../../services";
import {PageFragment} from "../elements/PageFragment";
import {RenderNothing} from "../elements/RenderNothing";
import {MetaDescription} from "../elements/MetaDescription";
import classNames from "classnames";
import partition from "lodash/partition";
import { Tabs } from "../elements/Tabs";
import { useHistoryState } from "../../state/actions/history";
import { IconCard } from "../elements/cards/IconCard";
import { PageContainer } from "../elements/layout/PageContainer";

const TOPICS_STAGES = ["11-14", "14-19"] as const;

const renderLink = (topic: AdaTopicBase) => {
    if (!topic.hidden) {
        return <>
            {topic.comingSoonDate || !topic.url
                ? <span className={"fw-semi-bold"}>{topic.title}</span>
                : <Link
                    to={topic.url}
                    className={classNames("fw-semi-bold", {"text-muted": topic.comingSoonDate})}
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

// used for 14-19 content where the links are to topic pages
const topicColumn = (subTags: Tag[], stage: STAGE.ALL | STAGE.A_LEVEL | STAGE.GCSE) => {
    return <Col key={TAG_ID.computerScience + "_" + subTags[0].id} md={6}>
        {subTags.sort((a, b) => (a.title > b.title) ? 1 : -1)
            // Overwrite subcategory with stage properties
            .map(subcategory => ({...subcategory, ...subcategory.stageOverride?.[stage]}))
            .map(subcategory => {
                const subcategoryDescendentIds = tags.getRecursiveDescendents(subcategory.id).map(t => t.id);
                const topicTags = tags.getTopicTags(subcategoryDescendentIds);
                const topicComponents = topicTags
                    // Overwrite subcategory with stage properties
                    .map(topic => ({...topic, ...topic.stageOverride?.[stage]}))
                    // Add URL
                    .map(topic => ({...topic, url: topic.comingSoonDate ? undefined : `/topics/${topic.id}`}))
                    .map(topic => <li className="border-0 px-0 py-0 pb-1 bg-transparent" key={topic.id}>
                        {renderLink(topic)}
                    </li>);
                if (!subcategory.hidden && topicComponents.length > 0) {
                    return <Card key={subcategory.id} className="mb-4">
                        <CardBody>
                            <h3>{subcategory.title}</h3>
                            <ul className="list-unstyled mb-3 link-list">
                                {topicComponents}
                            </ul>
                        </CardBody>
                    </Card>;
                }
            })
        }
    </Col>;
};

// used for 11-14 content where the links are to concept pages rather than topics
const conceptColumn = (subTags: Tag[]) => {
    return <Col key={TAG_ID.computerScience + "_" + subTags[0].id} md={6}>
        {subTags.map(subcategory => {
            return <IconCard key={subcategory.id} className={classNames("mb-4")} 
                card={{
                    title: subcategory.title,
                    icon: {name: "icon-learning", size: "md", color: "secondary"},
                    className: classNames({"bg-cultured border-2 mt-3": subcategory.comingSoonDate}),
                    tag: subcategory.comingSoonDate,
                }}
            >
                <ul className="list-unstyled">
                    {Ada11To14TopicsToConcepts[subcategory.id]?.map((concept, index) => (
                        <li key={index} className="pb-1">
                            {renderLink(concept)}
                        </li>
                    ))}
                </ul>
            </IconCard>;
        })}
    </Col>;
};

const TopicsListing = ({tagCols, age}: {tagCols: Tag[][], age: typeof TOPICS_STAGES[number]}) => {
    if (!tagCols || tagCols.length === 0) {
        return null;
    }

    return <>
        <Container className={"mb-4"}>
            <Row>
                <Col lg={{size: 8, offset: 2}} className="py-md-4 row">
                    {tagCols.map(c => age === "11-14" ? conceptColumn(c) : topicColumn(c, STAGE.ALL))}
                </Col>
            </Row>
        </Container>
        <section id={'topics-question-finder'}>
            <Container className={"mb-7 p-7 mx-auto"}>
                <Row className={"align-items-center justify-content-center"}>
                    <Col xs={12} lg={6}>
                        <h2 className={"font-size-1-75 mb-4"}>Check your understanding</h2>
                        <p>
                            Using the question finder you can select topics and concepts and we’ll generate a random
                            selection of questions for you to use. You can also specify your level and exam board.
                        </p>
                        <p><b>Students</b> might want to try our question finder to revise and get feedback on any
                            mistakes.</p>
                        <p><b>Teachers</b> might want to try our question finder to create quizzes and assign them to
                            students.</p>
                        <Button className={"mt-4"} tag={Link} to={PATHS.QUESTION_FINDER} color='dark-primary'>
                            Try our question finder
                        </Button>
                    </Col>
                    <Col xs={12} lg={6} className={"mt-4 mt-lg-0"}>
                        <picture>
                            <source srcSet="/assets/cs/decor/question-finder-dark.png" type="image/png"/>
                            <img className={"d-block w-100"} src={"/assets/cs/decor/question-finder-dark.png"} alt="" />
                        </picture>
                    </Col>
                </Row>
            </Container>
        </section>
    </>;
};

export const AllTopics = () => {
    const coreAdvancedTags = tags.allSubcategoryTags.filter(s => !s.stageOverride?.[STAGE.CORE]?.hidden && !s.stageOverride?.[STAGE.ADVANCED]?.hidden);
    const ks4Tags = tags.getChildren(TAG_ID.computerScience11_14);
    const [stageTab, setStageTab] = useHistoryState<typeof TOPICS_STAGES[number]>("topics-tab", "14-19"); // TODO: replace with local storage solution

    const metaDescription = "Discover our free computer science topics and questions. Learn or revise for your exams with us today.";

    return <PageContainer id={"topics"}>
        <TitleAndBreadcrumb currentPageTitle={"Topics"} />
        <MetaDescription description={metaDescription} />
        <Row>
            <Col lg={{size: 8, offset: 2}} className="pt-3 pt-md-4">
                <PageFragment fragmentId={stageTab === "11-14" ? "11_14_topics_toptext" : "all_all_topics"} ifNotFound={RenderNothing} />
            </Col>
        </Row>
        <Tabs style={"buttons"} className={"mt-3"} tabContentClass={"mt-3"}
            activeTabOverride={TOPICS_STAGES.indexOf(stageTab) + 1}
            onActiveTabChange={(n) => {
                setStageTab(TOPICS_STAGES[n-1]);
            }}
            renderHiddenTabs={false}
        >
            {{
                ["11 to 14 years"]: <TopicsListing tagCols={partition(ks4Tags, s => !s.comingSoonDate || s.title.charAt(0) <= "A")} age="11-14" />,
                ["14 to 19 years"]: <TopicsListing tagCols={partition(coreAdvancedTags, s => s.title.charAt(0) <= "D")} age="14-19" />
            }}
        </Tabs>;
    </PageContainer>;
};
