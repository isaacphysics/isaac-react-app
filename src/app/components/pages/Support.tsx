import React from "react";
import {Container, TabContent, TabPane} from "reactstrap";
import {Route} from "react-router-dom";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {Navigate, useNavigate, useParams} from "react-router";
import {Tabs} from "../elements/Tabs";
import {ifKeyIsEnter, isAda, isDefined, isPhy, siteSpecific} from "../../services";
import fromPairs from "lodash/fromPairs";
import {PageFragment} from "../elements/PageFragment";
import {NotFound} from "./NotFound";
import {MetaDescription} from "../elements/MetaDescription";
import { MainContent, SidebarLayout } from "../elements/layout/SidebarLayout";
import { StyledTabPicker } from "../elements/inputs/StyledTabPicker";
import { PageMetadata } from "../elements/PageMetadata";
import { FAQSidebar } from "../elements/sidebar/FAQSidebar";

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

export const Support = () => {

    const { type, category } = useParams() as Params;
    const navigate = useNavigate();

    if (type == undefined) {
        return <Navigate to={supportPath()} replace />;
    }

    if (category == undefined) {
        return <Navigate to={supportPath(type)} replace />;
    }

    const section = support[type];

    if (section == undefined) {
        return <Route element={<NotFound />} />;
    }

    const categoryNames = Object.keys(section.categories);
    const categoryIndex = siteSpecific(categoryNames.indexOf(category), categoryNames.indexOf(category) + 1);

    if (categoryIndex == -1) {
        return <Route element={<NotFound />} />;
    }

    function activeTabChanged(tabIndex: number) {
        void navigate(supportPath(type, siteSpecific(categoryNames[tabIndex], categoryNames[tabIndex - 1])));
    }

    const metaDescriptionMap = siteSpecific(
        {
            "student": "Find answers to your questions about Isaac Science in our FAQ for students.",
            "teacher": "Find answers to your questions about Isaac Science in our FAQ for teachers.",
        },
        {
            "student": "Got a question about Ada Computer Science? Read our student FAQs. Get GCSE and A level support today!",
            "teacher": "Got a question about Ada Computer Science? Read our teacher FAQs. Get GCSE and A level support today!",
        });

    return <Container>
        <TitleAndBreadcrumb 
            currentPageTitle={siteSpecific(type[0].toUpperCase() + type.slice(1) + " FAQs", section.title)}
            icon={{type: "icon", icon: "icon-finder"}}
        />  {/* TODO replace this icon */}
        {isAda && isDefined(type) && type !== "tutor" && <MetaDescription description={metaDescriptionMap[type]} />}
        <SidebarLayout site={isPhy}>
            <FAQSidebar hideButton>
                {Object.values(section.categories).map((category, index) => 
                    <StyledTabPicker
                        key={index} id={category.category} tabIndex={0} checkboxTitle={category.title} checked={categoryIndex === index}
                        onClick={() => activeTabChanged(index)} onKeyDown={ifKeyIsEnter(() => activeTabChanged(index))}
                    />
                )}
            </FAQSidebar>
            <MainContent>
                {siteSpecific(
                    <>
                        <PageMetadata title={Object.values(section.categories)[categoryIndex]?.title} showSidebarButton sidebarButtonText="Select a topic"/>
                        <TabContent activeTab={categoryIndex}>
                            {Object.values(section.categories).map((category, index) => 
                                <TabPane key={index} tabId={index}>
                                    <PageFragment fragmentId={`support_${type}_${category.category}`} />
                                </TabPane>
                            )}
                        </TabContent>
                    </>,
                    <Tabs className="pt-4 pb-7" activeTabOverride={categoryIndex} onActiveTabChange={activeTabChanged} tabContentClass="pt-4">
                        {fromPairs(Object.values(section.categories).map((category, index) => {
                            return [category.title, <PageFragment key={index} fragmentId={`support_${type}_${category.category}`} />];
                        }))}
                    </Tabs>
                )}
            </MainContent>
        </SidebarLayout>
    </Container>;
};
