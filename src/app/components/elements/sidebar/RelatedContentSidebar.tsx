import partition from "lodash/partition";
import React from "react";
import { Link } from "react-router-dom";
import { ContentSummaryDTO } from "../../../../IsaacApiTypes";
import { sortByStringValue, determineAudienceViews, isFullyDefinedContext, getHumanContext, HUMAN_STAGES, getThemeFromContextAndTags, DOCUMENT_TYPE } from "../../../services";
import { useAppSelector, selectors, logAction, useAppDispatch } from "../../../state";
import { extendUrl } from "../../pages/subjectLandingPageComponents";
import { AffixButton } from "../AffixButton";
import { NavigationSidebar } from "../layout/SidebarLayout";
import { Markup } from "../markup";
import { QuestionLink, CompletionKey, BackToBookButton, getEventDetails } from "./SidebarElements";
import { useTranslation } from "react-i18next";

type ConceptLinkProps = React.HTMLAttributes<HTMLLIElement> & {
    concept: ContentSummaryDTO;
    parentPageType: "concept" | "question" | "page";
    parentPageId: string;
};

const ConceptLink = (props: ConceptLinkProps) => {
    const { concept, parentPageType, parentPageId, ...rest } = props;
    const subject = useAppSelector(selectors.pageContext.subject);
    const dispatch = useAppDispatch();

    return <li key={concept.id} {...rest} data-bs-theme={getThemeFromContextAndTags(subject, concept.tags ?? [])}>
        <Link to={`/concepts/${concept.id}`} className="py-2"
            onClick={async () => await dispatch(logAction(getEventDetails(concept, parentPageType, parentPageId)))}
        >
            <i className="icon icon-concept-thick"/>
            <span className="hover-underline link-title"><Markup encoding="latex">{concept.title}</Markup></span>
        </Link>
    </li>;
};

interface RelatedContentSidebarProps {
    relatedContent: ContentSummaryDTO[] | undefined;
    linkedBookSection?: string[];
    pageId: string;
}

const RelatedContentSidebar = (props: RelatedContentSidebarProps & {pageType: "concept" | "question" | "page"}) => {
    const { t } = useTranslation();
    const relatedConcepts = props.relatedContent?.filter(c => c.type === DOCUMENT_TYPE.CONCEPT).sort(sortByStringValue("title"));
    const relatedQuestions = props.relatedContent?.filter(c => c.type === DOCUMENT_TYPE.QUESTION || c.type === DOCUMENT_TYPE.FAST_TRACK_QUESTION).sort(sortByStringValue("title"));

    const pageContext = useAppSelector(selectors.pageContext.context);
    const pageContextStage = useAppSelector(selectors.pageContext.stage);

    const [relatedQuestionsForContextStage, relatedQuestionsForOtherStages] = partition(relatedQuestions, q => q.audience && determineAudienceViews(q.audience).some(v => v.stage === pageContextStage));

    return <NavigationSidebar>
        {props.linkedBookSection && props.linkedBookSection[0] && props.linkedBookSection[1] && <BackToBookButton linkedBookSection={props.linkedBookSection} className="w-100"/>}

        <div className="section-divider"/>
        <h3 className="h5">{t("questions:sidebar.relatedContent.conceptsTitle")}</h3>
        {relatedConcepts && relatedConcepts.length > 0
            ? <ul className="link-list">
                {relatedConcepts.map((concept, i) => <ConceptLink key={i} concept={concept} parentPageType={props.pageType} parentPageId={props.pageId} />)}
            </ul>
            : <>
                {t("questions:sidebar.relatedContent.noConcepts", { pageType: props.pageType })}
                {isFullyDefinedContext(pageContext) && <AffixButton color="keyline" className="mt-3 w-100" tag={Link} to={extendUrl(pageContext, "concepts")} affix={{affix: "icon-arrow-right", position: "suffix", type: "icon"}}>
                    {t("questions:sidebar.relatedContent.viewAllConcepts", { contextName: getHumanContext(pageContext) })}
                </AffixButton>}
            </>
        }
        <div className="section-divider"/>
        <h3 className="h5">{t("common:title.relatedQuestions")}</h3>
        {relatedQuestions && relatedQuestions.length > 0
            ? <>
                {!pageContextStage || pageContextStage.length > 1 || relatedQuestionsForContextStage.length === 0 || relatedQuestionsForOtherStages.length === 0
                    ? <>
                        <ul className="link-list">
                            {relatedQuestions.map((question, i) => <QuestionLink key={i} question={question} linkedBookSection={props.linkedBookSection} parentPageType={props.pageType} parentPageId={props.pageId} />)}
                        </ul>
                    </>
                    : <>
                        <div className="section-divider"/>
                        <h3 className="h5">{t("questions:sidebar.relatedContent.stageQuestionsTitle", { stageName: HUMAN_STAGES[pageContextStage[0]] })}</h3>
                        <ul className="link-list">
                            {relatedQuestionsForContextStage.map((question, i) => <QuestionLink key={i} question={question} linkedBookSection={props.linkedBookSection} parentPageType={props.pageType} parentPageId={props.pageId} />)}
                        </ul>
                        <div className="section-divider"/>
                        <h3 className="h5">{t("questions:sidebar.relatedContent.otherStagesTitle")}</h3>
                        <ul className="link-list">
                            {relatedQuestionsForOtherStages.map((question, i) => <QuestionLink key={i} question={question} linkedBookSection={props.linkedBookSection} parentPageType={props.pageType} parentPageId={props.pageId} />)}
                        </ul>
                    </>
                }
                <div className="section-divider"/>
                <CompletionKey/>

            </>
            : <>
                {t("questions:sidebar.relatedContent.noQuestions", { pageType: props.pageType })}
                {isFullyDefinedContext(pageContext) && <AffixButton color="keyline" className="mt-3 w-100" tag={Link} to={extendUrl(pageContext, "questions")} affix={{affix: "icon-arrow-right", position: "suffix", type: "icon"}}>
                    {t("questions:sidebar.relatedContent.viewAllQuestions", { contextName: getHumanContext(pageContext) })}
                </AffixButton>}
            </>
        }
    </NavigationSidebar>;
};

export const QuestionSidebar = (props: RelatedContentSidebarProps) => {
    return <RelatedContentSidebar {...props} pageType="question" />;
};

export const ConceptSidebar = (props: RelatedContentSidebarProps) => {
    return <RelatedContentSidebar {...props} pageType="concept" />;
};

export const GenericSidebarWithRelatedContent = (props: RelatedContentSidebarProps) => {
    return <RelatedContentSidebar {...props} pageType="page" />;
};
