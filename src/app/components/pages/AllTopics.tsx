import React from "react";
import {Link} from "react-router-dom";
import {Badge, Col, Container, Row} from "reactstrap";
import "../../services/tags";
import * as Tags from "../../services/tags";
import {Tag} from "../../services/tags";
import {BreadcrumbTrail} from "../elements/BreadcrumbTrail";

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
            {topic.comingSoon ?
                <Badge color="light" className="border-primary border bg-white">Coming Soon</Badge> :
                <Badge color="secondary">New</Badge>
            }
        </React.Fragment>;
    };

    return <div className="pattern-02">
        <Container>
            <BreadcrumbTrail currentPageTitle="All topics"/>

            <h1 className="h-title">All topics</h1>

            {/* Search topics TODO MT */}

            <Row className="my-4">
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
                                <ul className="list-unstyled">
                                    {topicTags.map((topic) => <li key={topic.id}>{renderTopic(topic)}</li>)}
                                </ul>
                            </React.Fragment>
                        })}
                    </Col>
                })}
            </Row>
        </Container>
    </div>;
};
