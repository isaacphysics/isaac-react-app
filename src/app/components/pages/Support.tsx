import React from "react";
import {Col, Container, NavLink, Row, TabContent, TabPane} from "reactstrap";
import {Route, withRouter} from "react-router-dom";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {Redirect, RouteComponentProps} from "react-router";
import {Tabs} from "../elements/Tabs";
import {history, ifKeyIsEnter, isDefined, siteSpecific} from "../../services";
import fromPairs from "lodash/fromPairs";
import {PageFragment} from "../elements/PageFragment";
import {NotFound} from "./NotFound";
import {MetaDescription} from "../elements/MetaDescription";
import { FAQSidebar, MainContent, SidebarLayout } from "../elements/layout/SidebarLayout";
import classNames from "classnames";

type SupportType = "student" | "teacher" | "tutor";

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

const support: {student: SupportCategories; teacher: SupportCategories, tutor?: SupportCategories} = siteSpecific(
    {
        student: {
            title: "Student FAQ",
            categories:{
                general: {category: "general", title: "Get started", icon: "faq"},
                homework: {category: "homework", title: "Doing homework", icon: "faq"},
                questions: {category: "questions", title: "Answering questions", icon: "faq"},
                events: {category: "events", title: "Events and support", icon: "faq"},
                troubleshooting: {category: "troubleshooting", title: "Troubleshooting & legal", icon: "faq"},
            }
        },
        teacher: {
            title: "Teacher FAQ",
            categories: {
                general: { category: "general", title: "Get started", icon: "faq" },
                assignments: { category: "assignments", title: "Set work", icon: "faq" },
                progress: { category: "progress", title: "View student progress", icon: "faq" },
                suggestions: { category: "suggestions", title: "Teaching suggestions", icon: "teacher-hat" },
                partner: { category: "partner", title: "Partner with us", icon: "teacher-hat" },
                direct: { category: "direct", title: "Teacher support", icon: "teacher-hat"},
                troubleshooting: {category: "troubleshooting", title: "Troubleshooting", icon: "faq"},
                legal: { category: "legal", title: "Legal", icon: "faq"}
            }
        },
        tutor: {
            title: "Tutor FAQ",
            categories: {
                general: { category: "general", title: "Get started", icon: "faq" },
                assignments: { category: "assignments", title: "Set work", icon: "faq" },
                progress: { category: "progress", title: "View student progress", icon: "faq" },
                suggestions: { category: "suggestions", title: "Teaching suggestions", icon: "teacher-hat" },
                troubleshooting: {category: "troubleshooting", title: "Troubleshooting", icon: "faq"},
                legal: { category: "legal", title: "Legal", icon: "faq"}
            }
        }
    },
    {
        student: {
            title: "Student support",
            categories:{
                general: {category: "general", title: "General questions", icon: "faq"},
                homework: {category: "homework", title: "Finding homework", icon: "faq"},
                code: {category: "code", title: "Code and pseudocode", icon: "faq"},
                revision: {category: "revision", title: "Revision", icon: "faq"},
            }
        },
        teacher: {
            title: "Teacher support",
            categories: {
                general: { category: "general", title: "General questions", icon: "faq" },
                assignments: { category: "assignments", title: "Assigning work", icon: "faq" },
                progress: { category: "progress", title: "Viewing student progress", icon: "faq" },
                code: {category: "code", title: "Code and pseudocode", icon: "faq"},
            }
        }
    }
);

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

    if (section == undefined) {
        return <Route component={NotFound} />;
    }

    const categoryNames = Object.keys(section.categories);
    const categoryIndex = categoryNames.indexOf(category);

    if (categoryIndex == -1) {
        return <Route component={NotFound} />;
    }

    function activeTabChanged(tabIndex: number) {
        history.push(supportPath(type, categoryNames[tabIndex]));
    }

    function tabTitleClass(_tabName: string, tabIndex: number) {
        return "support-tab-" + section?.categories[categoryNames[tabIndex]].icon;
    }

    const metaDescriptionMap = siteSpecific(
        {
            "student": "Find answers to your questions about Isaac Physics in our FAQ for students.",
            "teacher": "Find answers to your questions about Isaac Physics in our FAQ for teachers.",
        },
        {
            "student": "Got a question about Ada Computer Science? Read our student FAQs. Get GCSE and A level support today!",
            "teacher": "Got a question about Ada Computer Science? Read our teacher FAQs. Get GCSE and A level support today!",
        });

    const SupportPhy = <Container>
        <TitleAndBreadcrumb 
            currentPageTitle={type[0].toUpperCase() + type.slice(1) + " FAQs"}
            icon={{type: "hex", icon: "page-icon-finder"}}
        />
        <SidebarLayout>
            <FAQSidebar>
                <div className="section-divider mb-2"/>
                <h4>Select a topic</h4>
                {Object.values(section.categories).map((category, index) => 
                    <NavLink
                        key={index} tabIndex={index} className={classNames("sidebar-tab", {"active-tab": categoryIndex === index})}
                        onClick={() => activeTabChanged(index)} onKeyDown={ifKeyIsEnter(() => activeTabChanged(index))}
                    >
                        {category.title}
                    </NavLink>
                )}
            </FAQSidebar>
            <MainContent>
                <TabContent activeTab={categoryIndex}>
                    {Object.values(section.categories).map((category, index) => 
                        <TabPane key={index} tabId={index}>
                            <h2 className="mt-5">{category.title}</h2>
                            <div className="accordion-background">
                                <PageFragment fragmentId={`support_${type}_${category.category}`} />
                            </div>
                        </TabPane>
                    )}
                </TabContent>
            </MainContent>
        </SidebarLayout>
    </Container>;

    const SupportAda = <Container>
        <Row>
            <Col>
                <TitleAndBreadcrumb currentPageTitle={section.title} />
                {isDefined(type) && type !== "tutor" && <MetaDescription description={metaDescriptionMap[type]} />}
            </Col>
        </Row>
        <Row>
            <Col className="pt-4 pb-5">
                <Tabs
                    activeTabOverride={categoryIndex} onActiveTabChange={activeTabChanged}
                    tabTitleClass={tabTitleClass} tabContentClass="pt-4"
                >
                    {fromPairs(Object.values(section.categories).map((category, index) => {
                        return [category.title, <PageFragment key={index} fragmentId={`support_${type}_${category.category}`} />];
                    }))}
                </Tabs>
            </Col>
        </Row>
    </Container>;

    return siteSpecific(SupportPhy, SupportAda);
};

export const Support = withRouter(SupportPageComponent);
