import { withRouter } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { Input, Col, Container } from "reactstrap";
import { TitleAndBreadcrumb } from "../../elements/TitleAndBreadcrumb";
import { getFilteredStageOptions, isAda, isDefined, isLoggedIn, isPhy, LearningStage, siteSpecific, STAGE_TO_LEARNING_STAGE, Subjects, TAG_ID, tags } from "../../../services";
import { AudienceContext, QuizSummaryDTO, Stage } from "../../../../IsaacApiTypes";
import { Tag} from "../../../../IsaacAppTypes";
import { ShowLoading } from "../../handlers/ShowLoading";
import { useGetAvailableQuizzesQuery } from "../../../state/slices/api/quizApi";
import { PageFragment } from "../../elements/PageFragment";
import { MainContent, PracticeQuizzesSidebar, SidebarLayout } from "../../elements/layout/SidebarLayout";
import { isFullyDefinedContext, useUrlPageTheme } from "../../../services/pageContext";
import { selectors, useAppSelector } from "../../../state";
import { PrintButton } from "../../elements/PrintButton";
import { ShareLink } from "../../elements/ShareLink";
import { ListView } from "../../elements/list-groups/ListView";
import classNames from "classnames";

const PracticeQuizzesComponent = () => {
    const pageContext = useUrlPageTheme();
    const pageSubject = pageContext?.subject;
    const pageStage = pageContext?.stage ? pageContext.stage[0] : undefined;

    const {data: quizzes} = useGetAvailableQuizzesQuery(0);
    const user = useAppSelector(selectors.user.orNull);

    const [filterText, setFilterText] = useState<string>("");
    const [filterTags, setFilterTags] = useState<Tag[]>([]); // Subjects & fields
    const [filterStages, setFilterStages] = useState<Stage[]>();
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (location.search.includes("filter")) {
            setFilterText(new URLSearchParams(location.search).get("filter") || "");
        }
    }, []);

    const audienceMatch = (selectedStage: Stage | LearningStage) => (contentAudience: AudienceContext) =>
        contentAudience.stage?.includes(selectedStage as Stage) ||
        contentAudience.stage?.map(s => STAGE_TO_LEARNING_STAGE[s]).includes(selectedStage as LearningStage);

    const showQuiz = (quiz: QuizSummaryDTO) => {
        if (pageSubject && !quiz.tags?.includes(pageSubject)) return false;
        if (pageStage && !quiz.audience?.some(audienceMatch(pageStage))) return false;

        // Anonymous users can list student-visible quizzes
        const userRole = user && isLoggedIn(user) ? user.role : "STUDENT";
        switch (userRole) {
            case "STUDENT":
            case "TUTOR":
            case "TEACHER":
                // Practice attempts are only possible on quizzes that are visible to students
                // (most quizzes that are hidden from students may be previewed by teachers, but may not be practised)
                return (quiz.hiddenFromRoles && !quiz.hiddenFromRoles?.includes("STUDENT")) || quiz.visibleToStudents;
            default:
                return true;
        }
    };

    const textMatch = (quiz: QuizSummaryDTO) => quiz.title?.toLowerCase().includes(filterText.toLowerCase());
    const tagMatch = (quiz: QuizSummaryDTO) => filterTags.length === 0 || quiz.tags?.some(t => (filterTags.map(tag => tag.id as string)).includes(t));
    const stageMatch = (quiz: QuizSummaryDTO) => !filterStages || filterStages.length === 0 || filterStages.some(s => quiz.audience?.some(audienceMatch(s)));
    const isRelevant = (quiz: QuizSummaryDTO) => showQuiz(quiz) && textMatch(quiz) && tagMatch(quiz) && stageMatch(quiz);

    const fields = tags.getFieldTags(Array.from((quizzes || []).reduce((a, c) => {
        if (isDefined(c.tags) && c.tags.length > 0) {
            return new Set([...Array.from(a), ...c.tags.map(id => id as TAG_ID)]);
        }
        return a;
    }, new Set<TAG_ID>())).filter(tag => isDefined(tag))).sort();

    const tagCounts = () => {
        const counts: {[key: string]: number} = {};
        [...Subjects, ...fields.map(field => field.id)].forEach(tag => {
            counts[tag] = quizzes?.filter(quiz => quiz.tags?.includes(tag) && showQuiz(quiz) && textMatch(quiz) && stageMatch(quiz)).length || 0;
        });
        return counts;
    };

    const stageCounts = () => {
        const counts: {[key: string]: number} = {};
        getFilteredStageOptions().forEach(stage => {
            counts[stage.label] = quizzes?.filter(quiz => quiz.audience?.some(audienceMatch(stage.value)) && showQuiz(quiz) && textMatch(quiz) && tagMatch(quiz)).length || 0;
        });
        return counts;
    };

    const sidebarProps = {filterText, setFilterText, filterTags, setFilterTags, tagCounts: tagCounts(), filterStages, setFilterStages, stageCounts: stageCounts()};

    return <Container { ...(pageContext?.subject && { "data-bs-theme" : pageContext.subject })}>
        <TitleAndBreadcrumb 
            currentPageTitle={siteSpecific("Practice Tests", "Practice tests")} 
            icon={{"type": "hex", "icon": "icon-tests"}}
            className={siteSpecific("mb-4", "")} 
        />
        <SidebarLayout>
            <PracticeQuizzesSidebar {...sidebarProps}/>
            <MainContent>
                <div className="d-flex align-items-center">
                    <span><PageFragment fragmentId="help_toptext_practice_tests"/></span>
                    {isPhy && <div className="no-print d-flex gap-2 ms-auto">
                        <div className="question-actions question-actions-leftmost">
                            <ShareLink linkUrl={isFullyDefinedContext(pageContext) ? `/${pageSubject}/${pageStage}/practice_tests` : "/practice_tests"}/>
                        </div>
                        <div className="question-actions not-mobile">
                            <PrintButton/>
                        </div>
                    </div>}
                </div>
                {!user 
                    ? <b>You must be logged in to view practice tests.</b> 
                    : <ShowLoading until={quizzes}>
                        {quizzes && <>
                            {quizzes.length === 0 && <p><em>There are no practice tests currently available.</em></p>}
                            <Col xs={12} className="mb-4">
                                {isAda && <Input type="text" placeholder="Filter tests by name..." value={filterText} onChange={(e) => setFilterText(e.target.value)} />}
                                <button className={`copy-test-filter-link m-0 ${copied ? "clicked" : ""}`} tabIndex={-1} onClick={() => {
                                    if (filterText.trim()) {
                                        navigator.clipboard.writeText(`${window.location.host}${window.location.pathname}?filter=${filterText.trim()}#practice`);
                                    }
                                    setCopied(true);
                                }} onMouseLeave={() => setCopied(false)} />
                            </Col>
                            <ListView
                                type="quiz"
                                items={quizzes.filter((quiz) => isRelevant(quiz))} 
                                className={classNames({"quiz-list border-radius-2 mb-3": isAda})}
                                useViewQuizLink
                            />
                        </>}
                    </ShowLoading>
                }
            </MainContent>
        </SidebarLayout>
    </Container>;
};

export const PracticeQuizzes = withRouter(PracticeQuizzesComponent);
