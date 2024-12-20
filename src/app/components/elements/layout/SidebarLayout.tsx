import React, { RefObject, useRef } from "react";
import { Col, ColProps, Container, ContainerProps, Row } from "reactstrap";
import partition from "lodash/partition";
import classNames from "classnames";
import { ContentSummaryDTO, IsaacConceptPageDTO, QuestionDTO } from "../../../../IsaacApiTypes";
import { AUDIENCE_DISPLAY_FIELDS, determineAudienceViews, filterAudienceViewsByProperties, getThemeFromContextAndTags, stageLabelMap } from "../../../services";
import { StageAndDifficultySummaryIcons } from "../StageAndDifficultySummaryIcons";
import { selectors, useAppSelector } from "../../../state";
import { Link } from "react-router-dom";

interface SidebarLayoutProps extends ContainerProps {

}

export const SidebarContainer = (props: SidebarLayoutProps) => {
    const { children, className, ...rest } = props;
    return <Container fluid {...rest} className={classNames("sidebar-layout", className)}>
        <Row>
            {children}
        </Row>
    </Container>;
};

export const MainContent = (props: ColProps) => {
    return <Col xs={12} lg={8} xl={9} {...props} />;
};

const QuestionLink = (props: React.HTMLAttributes<HTMLLIElement> & {question: QuestionDTO, sidebarRef: RefObject<HTMLDivElement>}) => {
    const { question, sidebarRef, ...rest } = props;
    const audienceFields = filterAudienceViewsByProperties(determineAudienceViews(question.audience), AUDIENCE_DISPLAY_FIELDS);
                        
    return <li key={question.id} {...rest} data-bs-theme={getThemeFromContextAndTags(sidebarRef, question.tags ?? [])}>
        <Link to={`/questions/${question.id}`} className="py-2">
            <i className="icon icon-question"/>
            <div className="d-flex flex-column w-100">
                <span className="hover-underline">{question.title}</span>
                <StageAndDifficultySummaryIcons iconClassName="me-4 pe-2" audienceViews={audienceFields}/>
            </div>
        </Link>
    </li>;
};

interface SidebarProps extends ColProps {

}

const Sidebar = (props: SidebarProps) => {
    const { className, ...rest } = props;
    return <Col lg={4} xl={3} {...rest} className={classNames("sidebar p-4", className)} />;
};

interface QuestionSidebarProps extends SidebarProps {
    relatedContent: ContentSummaryDTO[] | undefined;
}

export const QuestionSidebar = (props: QuestionSidebarProps) => {
    const relatedConcepts = props.relatedContent?.filter(c => c.type === "isaacConceptPage") as IsaacConceptPageDTO[];
    const relatedQuestions = props.relatedContent?.filter(c => c.type === "isaacQuestionPage") as QuestionDTO[];

    const pageContextStage = useAppSelector(selectors.pageContext.stage);

    const [relatedQuestionsForContextStage, relatedQuestionsForOtherStages] = partition(relatedQuestions, q => q.audience && determineAudienceViews(q.audience).some(v => v.stage === pageContextStage));

    const sidebarRef = useRef<HTMLDivElement>(null);

    return <Sidebar ref={sidebarRef}>
        {relatedConcepts.length > 0 && <>
            <div className="section-divider"/>
            <h5>Related concepts</h5>
            <ul>
                {relatedConcepts.map(concept => <li key={concept.id} data-bs-theme={getThemeFromContextAndTags(sidebarRef, concept.tags ?? [])}>
                    <Link to={`/concepts/${concept.id}`} className="py-2">
                        <i className="icon icon-lightbulb"/>
                        <span className="hover-underline">{concept.title}</span>
                    </Link>
                </li>)}
            </ul>
        </>}
        {relatedQuestions.length > 0 && (
            pageContextStage === "all" || !pageContextStage || relatedQuestionsForContextStage.length === 0 || relatedQuestionsForOtherStages.length === 0
                ? <>
                    <div className="section-divider"/>
                    <h5>Related questions</h5>
                    <ul>
                        {relatedQuestions.map((question, i) => <QuestionLink key={i} sidebarRef={sidebarRef} question={question} />)}
                    </ul>
                </>
                : <>
                    <div className="section-divider"/>
                    <h5>Related {stageLabelMap[pageContextStage]} questions</h5>
                    <ul>
                        {relatedQuestionsForContextStage.map((question, i) => <QuestionLink key={i} sidebarRef={sidebarRef} question={question} />)}
                    </ul>
                    <div className="section-divider"/>
                    <h5>Related questions for other learning stages</h5>
                    <ul>
                        {relatedQuestionsForOtherStages.map((question, i) => <QuestionLink key={i} sidebarRef={sidebarRef} question={question} />)}
                    </ul>
                </>
        )}
    </Sidebar>;
};
