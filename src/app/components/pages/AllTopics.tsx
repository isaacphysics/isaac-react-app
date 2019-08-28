import React from "react";
import {Link} from "react-router-dom";
import {Badge, Col, Container, Row} from "reactstrap";
import "../../services/tags";
import * as Tags from "../../services/tags";
import {Tag} from "../../services/tags";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";

export const AllTopics = () => {

    const renderTopic = (topic: Tag) => {
        const TextTag = topic.comingSoon ? "span" : "strong";
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
            {topic.comingSoon && !topic.new && <Badge color="light" className="border bg-white">Coming soon</Badge>}
            {topic.new && !topic.comingSoon && <Badge color="secondary">New</Badge>}
        </React.Fragment>;
    };

    return <div className="pattern-02">
        <Container>
            <TitleAndBreadcrumb currentPageTitle="All topics"/>

            {/* Search topics TODO MT */}

            <Row>
                <Col lg={{size: 8, offset: 2}} className="bg-light-grey py-md-4 d-md-flex">
                    {Tags.allCategoryTags.map((category) => {
                        const categoryDescendentIds = Tags.getDescendents(category.id).map(t => t.id);
                        const subcategoryTags = Tags.getAllSubcategoryTags(categoryDescendentIds);
                        return <Col key={category.id} md={6}>
                            <h2>{category.title}</h2>
                            {subcategoryTags.map((subcategory) => {
                                const subcategoryDescendentIds = Tags.getDescendents(subcategory.id).map(t => t.id);
                                const topicTags = Tags.getAllTopicTags(subcategoryDescendentIds);
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
                            })}
                        </Col>
                    })}
                </Col>
            </Row>
        </Container>
    </div>;
};
