import React from "react";
import {TabContent, TabPane} from "reactstrap";
import {Route} from "react-router-dom";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {Navigate, useNavigate, useParams} from "react-router";
import {Tabs} from "../elements/Tabs";
import {ifKeyIsEnter, isAda, isDefined, siteSpecific} from "../../services";
import fromPairs from "lodash/fromPairs";
import {PageFragment} from "../elements/PageFragment";
import {NotFound} from "./NotFound";
import {MetaDescription} from "../elements/MetaDescription";
import { StyledTabPicker } from "../elements/inputs/StyledTabPicker";
import { PageMetadata } from "../elements/PageMetadata";
import { FAQSidebar } from "../elements/sidebar/FAQSidebar";
import { PageContainer } from "../elements/layout/PageContainer";
import { useTranslation } from 'react-i18next'
import i18next from 'i18next'

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
            title: i18next.t('studentFaq', 'Student FAQ'),
            categories:{
                general: {category: "general", title: i18next.t('getStarted', 'Get started'), icon: "faq"},
                homework: {category: "homework", title: i18next.t('doingHomework', 'Doing homework'), icon: "faq"},
                questions: {category: "questions", title: i18next.t('answeringQuestions', 'Answering questions'), icon: "faq"},
                events: {category: "events", title: i18next.t('eventsAndSupport', 'Events and support'), icon: "faq"},
                troubleshooting: {category: "troubleshooting", title: i18next.t('troubleshootingLegal', 'Troubleshooting & legal'), icon: "faq"},
            }
        },
        teacher: {
            title: i18next.t('teacherFaq', 'Teacher FAQ'),
            categories: {
                general: { category: "general", title: i18next.t('getStarted', 'Get started'), icon: "faq" },
                assignments: { category: "assignments", title: i18next.t('setWork', 'Set work'), icon: "faq" },
                progress: { category: "progress", title: i18next.t('viewStudentProgress', 'View student progress'), icon: "faq" },
                suggestions: { category: "suggestions", title: i18next.t('teachingSuggestions', 'Teaching suggestions'), icon: "teacher-hat" },
                partner: { category: "partner", title: i18next.t('partnerWithUs', 'Partner with us'), icon: "teacher-hat" },
                direct: { category: "direct", title: i18next.t('teacherSupport', 'Teacher support'), icon: "teacher-hat"},
                troubleshooting: {category: "troubleshooting", title: i18next.t('troubleshooting', 'Troubleshooting'), icon: "faq"},
                legal: { category: "legal", title: i18next.t('legal', 'Legal'), icon: "faq"}
            }
        },
        tutor: {
            title: i18next.t('tutorFaq', 'Tutor FAQ'),
            categories: {
                general: { category: "general", title: i18next.t('getStarted', 'Get started'), icon: "faq" },
                assignments: { category: "assignments", title: i18next.t('setWork', 'Set work'), icon: "faq" },
                progress: { category: "progress", title: i18next.t('viewStudentProgress', 'View student progress'), icon: "faq" },
                suggestions: { category: "suggestions", title: i18next.t('teachingSuggestions', 'Teaching suggestions'), icon: "teacher-hat" },
                troubleshooting: {category: "troubleshooting", title: i18next.t('troubleshooting', 'Troubleshooting'), icon: "faq"},
                legal: { category: "legal", title: i18next.t('legal', 'Legal'), icon: "faq"}
            }
        }
    },
    {
        student: {
            title: i18next.t('studentSupport', 'Student support'),
            categories:{
                general: {category: "general", title: i18next.t('generalQuestions', 'General questions'), icon: "faq"},
                homework: {category: "homework", title: i18next.t('findingHomework', 'Finding homework'), icon: "faq"},
                code: {category: "code", title: i18next.t('codeAndPseudocode', 'Code and pseudocode'), icon: "faq"},
                revision: {category: "revision", title: i18next.t('revision', 'Revision'), icon: "faq"},
            }
        },
        teacher: {
            title: i18next.t('teacherSupport', 'Teacher support'),
            categories: {
                general: { category: "general", title: i18next.t('generalQuestions', 'General questions'), icon: "faq" },
                assignments: { category: "assignments", title: i18next.t('assigningWork', 'Assigning work'), icon: "faq" },
                progress: { category: "progress", title: i18next.t('viewingStudentProgress', 'Viewing student progress'), icon: "faq" },
                code: {category: "code", title: i18next.t('codeAndPseudocode', 'Code and pseudocode'), icon: "faq"},
            }
        }
    }
);

function supportPath(type?: string, category?: string) {
    return `/support/${type || "student"}/${category || "general"}`;
}

export const Support = () => {
    const { t } = useTranslation()

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
            "student": t('findAnswersToYourQuestionsAboutIsaacScienceInOurFaqForStudents', 'Find answers to your questions about Isaac Science in our FAQ for students.'),
            "teacher": t('findAnswersToYourQuestionsAboutIsaacScienceInOurFaqForTeachers', 'Find answers to your questions about Isaac Science in our FAQ for teachers.'),
        },
        {
            "student": t('gotAQuestionAboutAdaComputerScienceReadOurStudentFaqsGetGcseAndALevelSupportToday', 'Got a question about Ada Computer Science? Read our student FAQs. Get GCSE and A level support today!'),
            "teacher": t('gotAQuestionAboutAdaComputerScienceReadOurTeacherFaqsGetGcseAndALevelSupportToday', 'Got a question about Ada Computer Science? Read our teacher FAQs. Get GCSE and A level support today!'),
        });

    return <PageContainer
        pageTitle={
            <TitleAndBreadcrumb 
                currentPageTitle={siteSpecific(type[0].toUpperCase() + type.slice(1) + " FAQs", section.title)}
                icon={{type: "icon", icon: "icon-finder"}}
                // TODO replace this icon
            />  
        }
        sidebar={siteSpecific(
            <FAQSidebar hideButton>
                {Object.values(section.categories).map((category, index) => 
                    <StyledTabPicker
                        key={index} id={category.category} tabIndex={0} checkboxTitle={category.title} checked={categoryIndex === index}
                        onClick={() => activeTabChanged(index)} onKeyDown={ifKeyIsEnter(() => activeTabChanged(index))}
                    />
                )}
            </FAQSidebar>,
            undefined
        )}
    >
        {isAda && isDefined(type) && type !== "tutor" && <MetaDescription description={metaDescriptionMap[type]} />}
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
    </PageContainer>;
};
