import { withRouter } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { Button, ListGroupItem, Input, ListGroup, Col, Container } from "reactstrap";
import { TitleAndBreadcrumb } from "../../elements/TitleAndBreadcrumb";
import { isAda, isDefined, isEventLeaderOrStaff, isLoggedIn, isPhy, isTutorOrAbove, siteSpecific, Subject, Subjects, TAG_ID, tags } from "../../../services";
import { AudienceContext, QuizSummaryDTO, Stage } from "../../../../IsaacApiTypes";
import { ShowLoading } from "../../handlers/ShowLoading";
import { useGetAvailableQuizzesQuery } from "../../../state/slices/api/quizApi";
import { QuizzesPageProps } from "./MyQuizzes";
import { Spacer } from "../../elements/Spacer";
import { Link } from "react-router-dom";
import { PageFragment } from "../../elements/PageFragment";
import { MainContent, PracticeQuizzesSidebar, SidebarLayout } from "../../elements/layout/SidebarLayout";
import { useUrlPageTheme } from "../../../services/pageContext";
import { selectors, useAppSelector } from "../../../state";
import { PhyHexIcon } from "../../elements/svg/PhyHexIcon";
import { AffixButton } from "../../elements/AffixButton";
import classNames from "classnames";

const PracticeQuizzesComponent = (props: QuizzesPageProps) => {
    const {data: quizzes} = useGetAvailableQuizzesQuery(0);
    const [filterText, setFilterText] = useState<string>("");
    const [filterSubject, setFilterSubject] = useState<Subject>();
    const [filterField, setFilterField] = useState<string>("");
    const [copied, setCopied] = useState(false);

    const user = useAppSelector(selectors.user.orNull);

    const pageContext = useUrlPageTheme();
    const pageSubject = pageContext?.subject;
    const pageStage = pageContext?.stage ? pageContext.stage[0] : undefined;

    useEffect(() => {
        if (location.search.includes("filter")) {
            setFilterText(new URLSearchParams(location.search).get("filter") || "");
        }
    }, []);

    const showQuiz = (quiz: QuizSummaryDTO) => {
        if (!user || !isLoggedIn(user)) return false;
        if (pageSubject && !quiz.tags?.includes(pageSubject)) return false;

        const isAudienceMatch = (audience: AudienceContext) => audience.stage?.includes(pageStage as Stage) || (pageStage === "11_14" && (audience.stage?.includes("year_7_and_8") || audience.stage?.includes("year_9")));
        if (pageStage && !quiz.audience?.some(isAudienceMatch)) return false;

        switch (user.role) {
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

    // If the user is event admin or above, and the quiz is hidden from teachers, then show that
    // If the user is teacher or above, show if the quiz is visible to students
    const roleVisibilitySummary = (quiz: QuizSummaryDTO) => <>
        {isEventLeaderOrStaff(user) && quiz.hiddenFromRoles && quiz.hiddenFromRoles?.includes("TEACHER") && <div className="small text-muted d-block ms-2">hidden from teachers</div>}
        {isTutorOrAbove(user) && ((quiz.hiddenFromRoles && !quiz.hiddenFromRoles?.includes("STUDENT")) || quiz.visibleToStudents) && <div className="small text-muted d-block ms-2">visible to students</div>}
    </>;

    const subjectCounts = () => {
        const counts: {[key: string]: number} = {};
        Subjects.forEach(subject => {
            counts[subject] = quizzes?.filter(quiz => quiz.tags?.includes(subject) && showQuiz(quiz)).length || 0;
        });
        return counts;
    };

    const fields = tags.getFieldTags(Array.from((quizzes || []).filter(q => pageSubject && q.tags?.includes(pageSubject)).reduce((a, c) => {
        if (isDefined(c.tags) && c.tags.length > 0) {
            return new Set([...Array.from(a), ...c.tags.map(id => id as TAG_ID)]);
        }
        return a;
    }, new Set<TAG_ID>())).filter(tag => isDefined(tag))).map(tag => tag.title).sort();

    const fieldCounts = () => {
        const counts: {[key: string]: number} = {};
        fields.forEach(field => {
            counts[field] = quizzes?.filter(quiz => quiz.tags?.includes(field.toLowerCase()) && showQuiz(quiz)).length || 0;
        });
        return counts;
    };

    const isRelevant = (quiz: QuizSummaryDTO) => {
        return showQuiz(quiz) && quiz.title?.toLowerCase().includes(filterText.toLowerCase()) && (!filterSubject || quiz.tags?.includes(filterSubject)) && (!filterField || quiz.tags?.includes(filterField.toLowerCase()));
    };

    return <Container { ...(pageContext?.subject && { "data-bs-theme" : pageContext.subject })}>
        <TitleAndBreadcrumb 
            currentPageTitle={siteSpecific("Practice Tests", "Practice tests")} 
            icon={{"type": "hex", "icon": "icon-tests"}}
        />
        <SidebarLayout>
            <PracticeQuizzesSidebar searchText={filterText} setSearchText={setFilterText} filterSubject={filterSubject} setFilterSubject={setFilterSubject}
                subjectCounts={subjectCounts()} allFields={fields} filterField={filterField} setFilterField={setFilterField} fieldCounts={fieldCounts()}/>
            <MainContent>
                <PageFragment fragmentId="help_toptext_practice_tests" />
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
                            <ListGroup className={siteSpecific("list-results-container p-2 my-4", "mb-3")}>
                                {quizzes.filter((quiz) => isRelevant(quiz)).map(quiz => <ListGroupItem className="p-0 bg-transparent" key={quiz.id}>
                                    <div className="d-flex flex-grow-1 flex-column flex-sm-row align-items-center p-3 quiz-list">
                                        {isPhy && <PhyHexIcon icon={"icon-tests"} subject={pageSubject} size={"lg"} />}
                                        <div>
                                            <span className={classNames("mb-2 mb-sm-0 pe-2", {"fw-bold": isPhy})}>{quiz.title}</span>
                                            {roleVisibilitySummary(quiz)}
                                            {quiz.summary && <div className="small text-muted d-none d-md-block">{quiz.summary}</div>}
                                        </div>
                                        <Spacer />
                                        {isTutorOrAbove(user) && <div className="d-none d-md-flex align-items-center me-4">
                                            {siteSpecific(
                                                <Button tag={Link} to={{pathname: `/test/preview/${quiz.id}`}} color="keyline" aria-label={`Preview ${quiz.title}`}>
                                                    Preview
                                                </Button>,
                                                <Link to={{pathname: `/test/preview/${quiz.id}`}}>
                                                    <span>Preview</span>
                                                </Link>)}
                                        </div>}
                                        {siteSpecific(
                                            <AffixButton size="md" color={pageSubject ? "solid" : "keyline"} tag={Link} to={`/test/attempt/${quiz.id}`}
                                                aria-label={`Take test ${quiz.title}`} affix={{affix: "icon-right", position: "suffix", type: "icon"}}>
                                                Take the test
                                            </AffixButton>,                                               
                                            <Button tag={Link} to={{pathname: `/test/attempt/${quiz.id}`}}>
                                                Take test
                                            </Button>)}
                                    </div>
                                </ListGroupItem>)}
                            </ListGroup>
                            {quizzes.filter((quiz) => isRelevant(quiz)).length === 0 &&
                                <p><em>No relevant practice tests were found.</em></p>}
                        </>}
                    </ShowLoading>
                }
            </MainContent>
        </SidebarLayout>
    </Container>;
};

export const PracticeQuizzes = withRouter(PracticeQuizzesComponent);
