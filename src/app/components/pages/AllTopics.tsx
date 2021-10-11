import React, {useEffect} from "react";
import {Link, useLocation, useHistory} from "react-router-dom";
import {Badge, Col, Container, Row} from "reactstrap";
import "../../services/tagsPhy";
import tags from "../../services/tags";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {Tag} from "../../../IsaacAppTypes";
import {EXAM_BOARDS_CS_A_LEVEL, EXAM_BOARDS_CS_GCSE, STAGE, TAG_ID} from "../../services/constants";
import queryString from "query-string";
import {PageFragment} from "../elements/PageFragment";
import {Tabs} from "../elements/Tabs";

export const AllTopics = () => {
    const history = useHistory();

    const location = useLocation();
    const params = queryString.parse(location.search);

    const stageString = (params.stage ? (Array.isArray(params.stage) ? params.stage[0] : params.stage) : "a_level").toLowerCase();
    const stage = stageString === STAGE.GCSE ? STAGE.GCSE : STAGE.A_LEVEL;
    const stageExamBoards = Array.from({[STAGE.GCSE]: EXAM_BOARDS_CS_GCSE, [STAGE.A_LEVEL]: EXAM_BOARDS_CS_A_LEVEL}[stage]);

    // This assumes that the first tab (with index 1) is 'All', and that the rest correspond with stageExamBoards
    const activeTab = stageExamBoards.indexOf(location.hash.replace("#","").toLowerCase()) + 2 || 1;
    const setActiveTab = (tabIndex: number) => {
        if (tabIndex < 1 || tabIndex - 1 > stageExamBoards.length) return;
        const hash = tabIndex > 1 ? stageExamBoards[tabIndex - 2].toString() : "all"
        history.replace({...location, hash: `#${hash}`}) // This sets activeTab to the index corresponding to the hash
    }
    useEffect(() => {
        if (!location.hash) {
            // Make sure there is a hash on the URL
            setActiveTab(activeTab);
        }
    })

    const renderTopic = (topic: Tag) => {
        const TextTag = topic.comingSoon ? "span" : "strong";
        const LinkTag = topic.comingSoon ? "span" : Link;
        if (!topic.hidden) {
            return <React.Fragment>
                <LinkTag
                    to={topic.comingSoon ? "/coming_soon" : `/topics/${topic.id}`}
                    className={topic.comingSoon ? "text-muted" : ""}
                >
                    <TextTag>
                        {topic.title}
                    </TextTag>
                </LinkTag>
                {" "}
                {topic.comingSoon && !topic.new &&
                <Badge color="light" className="border bg-white">Coming {topic.comingSoon}</Badge>}
                {topic.new && !topic.comingSoon && <Badge color="secondary">New</Badge>}
            </React.Fragment>;
        }
    };

    const subcategoryTags = tags.allSubcategoryTags;

    const charToCutAt = stage === STAGE.A_LEVEL ? "H" : "F";
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

    return <div className="pattern-02">
        <Container>
            <TitleAndBreadcrumb currentPageTitle={stage === STAGE.A_LEVEL ? "A level topics" : "GCSE topics"}/>

            <Tabs className="pt-3" tabContentClass="pt-3" activeTabOverride={activeTab} refreshHash={stage} onActiveTabChange={setActiveTab}>
                {
                    Object.assign(
                        {
                            All: <>
                                <Row>
                                    <Col lg={{size: 8, offset: 2}} className="bg-light-grey pt-md-4">
                                        <PageFragment fragmentId={`${stage}_all_topics`} renderFragmentNotFound={false} />
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
