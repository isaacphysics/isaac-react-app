import React from "react";
import {Link} from "react-router-dom";
import {Badge, Col, Container, Row} from "reactstrap";
import "../../services/tagsPhy";
import tags from "../../services/tags";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {Tag} from "../../../IsaacAppTypes";
import {TAG_ID} from "../../services/constants";

export const AllTopics = () => {

    // This points the relevant new tags to existing topic summary pages
    const topicSummaryMap: {[topicId: string]: string} = {
        [TAG_ID.proceduralProgramming]: "procedural_and_structured_programming",
        [TAG_ID.eventDrivenProgramming]: "guis",
        [TAG_ID.searching]: "searching_sorting_pathfinding",
        [TAG_ID.modelsOfComputation]: "theory_of_computation",
        [TAG_ID.operatingSystems]: "operating_systems_and_software",
        [TAG_ID.numberRepresentation]: "number_bases",
        [TAG_ID.stringHandling]: "string_manipulation",
    };

    const renderTopic = (topic: Tag) => {
        const TextTag = topic.comingSoon ? "span" : "strong";
        if (!topic.hidden) {
            return <React.Fragment>
                <Link
                    to={topic.comingSoon ? "/coming_soon" : `/topics/${topicSummaryMap[topic.id] || topic.id}`}
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

    const categoryDescendentIds = tags.getDescendents(TAG_ID.computerScience).map(t => t.id);
    const subcategoryTags = tags.getSubcategoryTags(categoryDescendentIds);

    return <div className="pattern-02">
        <Container>
            <TitleAndBreadcrumb currentPageTitle="All topics"/>

            {/* Search topics TODO MT */}

            <Row>
                <Col lg={{size: 8, offset: 2}} className="bg-light-grey py-md-4 d-md-flex">
                    <Col key={TAG_ID.computerScience} md={6}>
                    {subcategoryTags.sort((a, b) => (a.title > b.title) ? 1 : -1).map((subcategory) => {
                        const subcategoryDescendentIds = tags.getDescendents(subcategory.id).map(t => t.id);
                        const topicTags = tags.getTopicTags(subcategoryDescendentIds);
                        console.log(topicTags);
                        if (subcategory.title.charAt(0) < "H" && !subcategory.hidden) {
                            return <React.Fragment key={subcategory.id}>
                                <h3>{subcategory.title}</h3>
                                <ul className="list-unstyled mb-3 link-list">
                                    {topicTags.map((topic) =>
                                        <li
                                            className="border-0 px-0 py-0 pb-1 bg-transparent"
                                            key={topic.id}
                                        >
                                            {renderTopic(topic)}
                                        </li>
                                    )}
                                </ul>
                            </React.Fragment>
                        }
                    })}
                    </Col>
                    <Col key={TAG_ID.computerScience + "_2"} md={6}>
                        {subcategoryTags.sort((a, b) => (a.title > b.title) ? 1 : -1).map((subcategory) => {
                                const subcategoryDescendentIds = tags.getDescendents(subcategory.id).map(t => t.id);
                                const topicTags = tags.getTopicTags(subcategoryDescendentIds);
                                if (subcategory.title.charAt(0) > "H" && !subcategory.hidden) {
                                    return <React.Fragment key={subcategory.id}>
                                        <h3>{subcategory.title}</h3>
                                        <ul className="list-unstyled mb-3 link-list">
                                            {topicTags.map((topic) =>
                                                <li
                                                    className="border-0 px-0 py-0 pb-1 bg-transparent"
                                                    key={topic.id}
                                                >
                                                    {renderTopic(topic)}
                                                </li>
                                            )}
                                        </ul>
                                    </React.Fragment>
                                }
                            })}
                    </Col>
                </Col>
            </Row>
        </Container>
    </div>;
};
