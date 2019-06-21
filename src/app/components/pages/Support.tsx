import React from "react";
import {Col, Container, Row} from "reactstrap";
import {withRouter} from "react-router-dom";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {Redirect, RouteComponentProps} from "react-router";
import {Tabs} from "../elements/Tabs";
import {history} from "../../services/history";
import {fromPairs} from "lodash";
import {PageFragment} from "../elements/PageFragment";

interface Params {
    type?: "student" | "teacher";
    category?: string;
}

const support = {
    student: {
        title: "Student Support",
        categories: {
            general: {category: "general", title: "General Questions", icon: "faq"},
            homework: {category: "homework", title: "Finding Homework", icon: "faq"},
            questions: {category: "questions", title: "Answering Questions", icon: "faq"},
        }
    },
    teacher: {
        title: "Teacher Support",
        categories: {
            general: { category: "general", title: "General Questions", icon: "faq" },
            assignments: { category: "assignments", title: "Assigning Work", icon: "faq" },
            progress: { category: "progress", title: "Viewing Student Progress", icon: "faq" },
            suggestions: { category: "suggestions", title: "Teaching Suggestions", icon: "teacher-hat" },
            direct: { category: "direct", title: "One-to-One Support", icon: "teacher-hat" },
        }
    }
};

function supportPath(type?: string, category?: string) {
    return `/support/${type || "student"}/${category || "general"}`;
}

export const SupportPageComponent = ({match: {params: {type, category}}}: RouteComponentProps<Params>) => {

    if (type == undefined) {
        return <Redirect to={supportPath()}/>;
    }

    if (category == undefined) {
        return <Redirect to={supportPath(type)} />;
    }

    const section = support[type];
    const categoryNames = Object.keys(section.categories);
    const categoryIndex = categoryNames.indexOf(category);

    function activeTabChanged(tabIndex: number) {
        history.push(supportPath(type, categoryNames[tabIndex - 1]));
    }

    return <Container>
        <Row>
            <Col>
                <TitleAndBreadcrumb currentPageTitle={section.title} subTitle="Help with ..." />
            </Col>
        </Row>
        <Row>
            <Col className="py-4">
                <Tabs defaultActiveTab={categoryIndex + 1} activeTabChanged={activeTabChanged}>
                    {/* eslint-disable-next-line react/jsx-key */}
                    {fromPairs(Object.values(section.categories).map(category => [category.title, <PageFragment name={`support_${type}_${category.category}`} />]))}
                </Tabs>
            </Col>
        </Row>
    </Container>;
};

export const Support = withRouter(SupportPageComponent);
