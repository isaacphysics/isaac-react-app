import React from "react";
import {Col, Container, Row} from "reactstrap";
import {withRouter} from "react-router-dom";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {Redirect, RouteComponentProps} from "react-router";
import {Tabs} from "../elements/Tabs";
import {history} from "../../services/history";
import {fromPairs} from "lodash";
import {PageFragment} from "../elements/PageFragment";

type SupportType = "student" | "teacher";

interface Params {
    type?: SupportType;
    category?: string;
}

interface SupportCategories {
    title: string;
    categories: {
        [category: string]: {
            category: string;
            title: string;
            icon: string;
        };
    };
}

const support: {student: SupportCategories; teacher: SupportCategories} = {
    student: {
        title: "Student Support",
        categories: {
            general: {category: "general", title: "General Questions", icon: "faq"},
            homework: {category: "homework", title: "Finding Homework", icon: "faq"},
        }
    },
    teacher: {
        title: "Teacher Support",
        categories: {
            general: { category: "general", title: "General Questions", icon: "faq" },
            assignments: { category: "assignments", title: "Assigning Work", icon: "faq" },
            progress: { category: "progress", title: "Viewing Student Progress", icon: "faq" },
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

    function tabTitleClass(tabName: string, tabIndex: number) {
        return "support-tab-" + section.categories[categoryNames[tabIndex - 1]].icon;
    }

    return <Container>
        <Row>
            <Col>
                <TitleAndBreadcrumb currentPageTitle={section.title} />
            </Col>
        </Row>
        <Row>
            <Col className="pt-4 pb-5">
                <Tabs
                    defaultActiveTab={categoryIndex + 1} activeTabChanged={activeTabChanged}
                    tabTitleClass={tabTitleClass} tabContentClass="pt-4"
                >
                    {fromPairs(Object.values(section.categories).map(category => {
                        // eslint-disable-next-line react/jsx-key
                        return [category.title, <PageFragment fragmentId={`support_${type}_${category.category}`} />];
                    }))}
                </Tabs>
            </Col>
        </Row>
    </Container>;
};

export const Support = withRouter(SupportPageComponent);
