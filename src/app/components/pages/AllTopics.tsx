import React from "react";
import {Link, useLocation} from "react-router-dom";
import {Badge, Col, Container, Row} from "reactstrap";
import "../../services/tagsPhy";
import tags from "../../services/tags";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {Tag} from "../../../IsaacAppTypes";
import {STAGE, TAG_ID} from "../../services/constants";
import queryString from "query-string";
import {PageFragment} from "../elements/PageFragment";
import {Tabs} from "../elements/Tabs";

export const AllTopics = () => {
    const search = useLocation().search;
    const params = queryString.parse(search);

    const stageString = (params.stage ? (Array.isArray(params.stage) ? params.stage[0] : params.stage) : "a_level").toLowerCase();
    const stage = stageString === STAGE.GCSE ? STAGE.GCSE : STAGE.A_LEVEL;

    const renderTopic = (topic: Tag) => {
        const TextTag = topic.comingSoon ? "span" : "strong";
        if (!topic.hidden) {
            return <React.Fragment>
                <Link
                    to={topic.comingSoon ? "/coming_soon" : `/topics/${topic.id}`}
                    className={topic.comingSoon ? "text-muted" : ""}
                >
                    <TextTag>
                        {topic.title}
                    </TextTag>
                </Link>
                {" "}
                {topic.comingSoon && !topic.new &&
                <Badge color="light" className="border bg-white">Coming {topic.comingSoon}</Badge>}
                {topic.new && !topic.comingSoon && <Badge color="secondary">New</Badge>}
            </React.Fragment>;
        }
    };

    const subcategoryTags = tags.allSubcategoryTags.map(tag => {
        if (!tag.stages || tag.stages.includes(stage)) {
            return tag;
        } else {
            return {...tag, hidden: true};
        }
    });

    const firstColTags = subcategoryTags.filter(function (subcategory) {return subcategory.title.charAt(0) <= "H"});
    const secondColTags = subcategoryTags.filter(function (subcategory) {return subcategory.title.charAt(0) > "H"});

    const topicColumn = (subTags: Tag[]) => {
        return <Col key={TAG_ID.computerScience + "_" + subTags[0].id} md={6}>
            {subTags.sort((a, b) => (a.title > b.title) ? 1 : -1).map((subcategory) => {
                const subcategoryDescendentIds = tags.getDescendents(subcategory.id).map(t => t.id);
                const topicTags = tags.getTopicTags(subcategoryDescendentIds);
                const topicComponents =
                    topicTags.map(topic => (topic.stages?.includes(stage) || stage === STAGE.A_LEVEL) ? topic : {...topic, comingSoon: "soon!"})
                    .map(topic =>
                        <li
                            className="border-0 px-0 py-0 pb-1 bg-transparent"
                            key={topic.id}
                        >
                            {renderTopic(topic)}
                        </li>
                    );
                if (!subcategory.hidden && topicComponents.length > 0) {
                    return <React.Fragment key={subcategory.id}>
                        <h3>{subcategory.title}</h3>
                        <ul className="list-unstyled mb-3 link-list">
                            {topicComponents}
                        </ul>
                    </React.Fragment>
                }
            })}
        </Col>
    };

    return <div className="pattern-02">
        <Container>
            <TitleAndBreadcrumb currentPageTitle={stage === STAGE.A_LEVEL ? "A level topics" : "GCSE topics"}/>

            {/* Search topics TODO MT */}

            <Tabs className="pt-3" tabContentClass="pt-3">{{
                All: <>
                    {/* Add exposition for what 'All' tab is (in relation to other exam board pages for clarification) TODO CP */}
                    <Row>
                        <Col lg={{size: 8, offset: 2}} className="bg-light-grey py-md-4 d-md-flex">
                            {topicColumn(firstColTags)}
                            {topicColumn(secondColTags)}
                        </Col>
                    </Row>
                </>,
                AQA: <div className="bg-light-grey py-md-3"><PageFragment fragmentId="a_level_specification_aqa" /></div>,
                OCR: <div className="bg-light-grey py-md-3"><PageFragment fragmentId="a_level_specification_ocr" /></div>
            }}</Tabs>
        </Container>
    </div>;
};
