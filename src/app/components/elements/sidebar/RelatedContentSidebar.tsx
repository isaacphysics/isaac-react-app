import partition from "lodash/partition";
import React from "react";
import { Link } from "react-router-dom";
import { ContentSummaryDTO } from "../../../../IsaacApiTypes";
import { sortByStringValue, determineAudienceViews, isFullyDefinedContext, getHumanContext, HUMAN_STAGES, getThemeFromContextAndTags } from "../../../services";
import { useAppSelector, selectors } from "../../../state";
import { extendUrl } from "../../pages/subjectLandingPageComponents";
import { AffixButton } from "../AffixButton";
import { NavigationSidebar } from "../layout/SidebarLayout";
import { Markup } from "../markup";
import { QuestionLink, CompletionKey } from "./SidebarElements";

interface RelatedContentSidebarProps {
    relatedContent: ContentSummaryDTO[] | undefined;
}

const ConceptLink = (props: React.HTMLAttributes<HTMLLIElement> & {concept: ContentSummaryDTO}) => {
    const { concept, ...rest } = props;
    const subject = useAppSelector(selectors.pageContext.subject);

    return <li key={concept.id} {...rest} data-bs-theme={getThemeFromContextAndTags(subject, concept.tags ?? [])}>
        <Link to={`/concepts/${concept.id}`} className="py-2">
            <i className="icon icon-concept-thick"/>
            <span className="hover-underline link-title"><Markup encoding="latex">{concept.title}</Markup></span>
        </Link>
    </li>;
};

const RelatedContentSidebar = (props: RelatedContentSidebarProps & {pageType: "concept" | "question" | "page"}) => {
    const relatedConcepts = props.relatedContent?.filter(c => c.type === "isaacConceptPage").sort(sortByStringValue("title"));
    const relatedQuestions = props.relatedContent?.filter(c => c.type === "isaacQuestionPage" || c.type === "isaacFastTrackQuestionPage").sort(sortByStringValue("title"));

    const pageContext = useAppSelector(selectors.pageContext.context);
    const pageContextStage = useAppSelector(selectors.pageContext.stage);

    const [relatedQuestionsForContextStage, relatedQuestionsForOtherStages] = partition(relatedQuestions, q => q.audience && determineAudienceViews(q.audience).some(v => v.stage === pageContextStage));

    return <NavigationSidebar>
        <div className="section-divider"/>
        <h5>Related concepts</h5>
        {relatedConcepts && relatedConcepts.length > 0
            ? <ul className="link-list">
                {relatedConcepts.map((concept, i) => <ConceptLink key={i} concept={concept} />)}
            </ul>
            : <>
                There are no related concepts for this {props.pageType}.
                {isFullyDefinedContext(pageContext) && <AffixButton color="keyline" className="mt-3 w-100" tag={Link} to={extendUrl(pageContext, "concepts")} affix={{affix: "icon-arrow-right", position: "suffix", type: "icon"}}>
                    See all concepts for {getHumanContext(pageContext)}
                </AffixButton>}
            </>
        }
        <div className="section-divider"/>
        <h5>Related questions</h5>
        {relatedQuestions && relatedQuestions.length > 0
            ? <>
                {!pageContextStage || pageContextStage.length > 1 || relatedQuestionsForContextStage.length === 0 || relatedQuestionsForOtherStages.length === 0
                    ? <>
                        <ul className="link-list">
                            {relatedQuestions.map((question, i) => <QuestionLink key={i} question={question} />)}
                        </ul>
                    </>
                    : <>
                        <div className="section-divider"/>
                        <h5>Related {HUMAN_STAGES[pageContextStage[0]]} questions</h5>
                        <ul className="link-list">
                            {relatedQuestionsForContextStage.map((question, i) => <QuestionLink key={i} question={question} />)}
                        </ul>
                        <div className="section-divider"/>
                        <h5>Related questions for other learning stages</h5>
                        <ul className="link-list">
                            {relatedQuestionsForOtherStages.map((question, i) => <QuestionLink key={i} question={question} />)}
                        </ul>
                    </>
                }
                <div className="section-divider"/>
                <CompletionKey/>

            </>
            : <>
                There are no related questions for this {props.pageType}.
                {isFullyDefinedContext(pageContext) && <AffixButton color="keyline" className="mt-3 w-100" tag={Link} to={extendUrl(pageContext, "questions")} affix={{affix: "icon-arrow-right", position: "suffix", type: "icon"}}>
                    See all questions for {getHumanContext(pageContext)}
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
