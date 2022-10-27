import React, {useEffect} from "react";
import {Link, useHistory, useLocation} from "react-router-dom";
import {Badge, Col, Container, Row} from "reactstrap";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {Tag} from "../../../IsaacAppTypes";
import {
    EXAM_BOARD,
    EXAM_BOARDS_CS_A_LEVEL,
    EXAM_BOARDS_CS_GCSE,
    isCS,
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
import {Tabs} from "../elements/Tabs";
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

export const AllTopics = ({stage}: {stage: STAGE.A_LEVEL | STAGE.GCSE}) => {
    const history = useHistory();
    const location = useLocation();

    const stageExamBoards = Array.from({[STAGE.GCSE]: EXAM_BOARDS_CS_GCSE, [STAGE.A_LEVEL]: EXAM_BOARDS_CS_A_LEVEL}[stage]);

    useEffect(function recordMostRecentAllTopicsStage() {
        // We use local storage to try to do the right thing when user view topics on multiple tabs
        persistence.save(KEY.MOST_RECENT_ALL_TOPICS_PATH, stage);
    }, [stage]);

    // This assumes that the first tab (with index 1) is 'All', and that the rest correspond with stageExamBoards
    const activeTab = stageExamBoards.indexOf(location.hash.replace("#","").toLowerCase() as EXAM_BOARD) + 2 || 1;
    function setActiveTab(tabIndex: number) {
        if (tabIndex < 1 || tabIndex - 1 > stageExamBoards.length) return;
        const hash = tabIndex > 1 ? stageExamBoards[tabIndex - 2].toString() : "all"
        history.replace({...location, hash: `#${hash}`}) // This sets activeTab to the index corresponding to the hash
    }
    useEffect(function makeSureTheUrlHashRecordsTabState() { if (!location.hash) setActiveTab(activeTab); });

    const renderTopic = (topic: Tag) => {
        const TextTag = topic.comingSoonDate ? "span" : "strong";
        if (!topic.hidden) {
            return <React.Fragment>
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
            </React.Fragment>;
        }
    };

    const subcategoryTags = tags.allSubcategoryTags;

    const charToCutAt = "H";
    const firstColTags = subcategoryTags.filter(function (subcategory) {return subcategory.title.charAt(0) <= charToCutAt});
    const secondColTags = subcategoryTags.filter(function (subcategory) {return subcategory.title.charAt(0) > charToCutAt});

    const topicColumn = (subTags: Tag[]) => {
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

    const metaDescriptionMap = {
        [STAGE.A_LEVEL]: "Our free A level Computer Science topics cover the AQA, CIE, OCR, Eduqas, and WJEC exam specifications. Use our exam questions to learn or revise today.",
        [STAGE.GCSE]: "Discover our free GCSE Computer Science topics and questions. We cover AQA, Edexcel, Eduqas, OCR, and WJEC. Learn and revise for your exams with us today."
    };

    return <div className="pattern-02">
        <Container>
            <TitleAndBreadcrumb currentPageTitle={stage === STAGE.A_LEVEL ? "A level topics" : "GCSE topics"}/>
            {isCS && <MetaDescription description={metaDescriptionMap[stage]} />}

            <Tabs className="pt-3" tabContentClass="pt-3" activeTabOverride={activeTab} refreshHash={stage} onActiveTabChange={setActiveTab}>
                {
                    Object.assign(
                        {
                            All: <>
                                <Row>
                                    <Col lg={{size: 8, offset: 2}} className="bg-light-grey pt-md-4">
                                        <PageFragment fragmentId={`${stage}_all_topics`} ifNotFound={RenderNothing} />
                                    </Col>
                                </Row>
                                <Row>
                                    <Col lg={{size: 8, offset: 2}} className="bg-light-grey py-md-4 d-md-flex">
                                        {topicColumn(firstColTags)}
                                        {topicColumn(secondColTags)}
                                    </Col>
                                </Row>
                            </>
                        },
                        ...stageExamBoards.map(examBoard => ({
                            [examBoard.toUpperCase()]: <Row>
                                <Col lg={{size: 8, offset: 2}} className="bg-light-grey py-md-4">
                                    <PageFragment fragmentId={`${stage}_specification_${examBoard}`} />
                                </Col>
                            </Row>
                        }))
                    )
                }
            </Tabs>
        </Container>
    </div>;
};
