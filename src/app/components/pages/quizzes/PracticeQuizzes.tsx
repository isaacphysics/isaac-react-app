import { withRouter } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { Button, Container, ListGroupItem, Input, ListGroup, Col } from "reactstrap";
import { TitleAndBreadcrumb } from "../../elements/TitleAndBreadcrumb";
import { isEventLeaderOrStaff, isTutorOrAbove, siteSpecific } from "../../../services";
import { QuizSummaryDTO } from "../../../../IsaacApiTypes";
import { ShowLoading } from "../../handlers/ShowLoading";
import { useGetAvailableQuizzesQuery } from "../../../state/slices/api/quizApi";
import { QuizzesPageProps } from "./MyQuizzes";
import { Spacer } from "../../elements/Spacer";
import { Link } from "react-router-dom";
import { PageFragment } from "../../elements/PageFragment";

const PracticeQuizzesComponent = ({user}: QuizzesPageProps) => {
    const {data: quizzes} = useGetAvailableQuizzesQuery(0);
    const [filterText, setFilterText] = useState<string>("");
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (location.search.includes("filter")) {
            setFilterText(new URLSearchParams(location.search).get("filter") || "");
        }
    }, []);

    if (!user) {
        return <p>You must be logged in to view practice tests.</p>;
    }

    const showQuiz = (quiz: QuizSummaryDTO) => {
        switch (user.role) {
            case "STUDENT":
            // Tutors should see the same tests as students can
            // eslint-disable-next-line no-fallthrough
            case "TUTOR":
                return (quiz.hiddenFromRoles && !quiz.hiddenFromRoles?.includes("STUDENT")) || quiz.visibleToStudents;
            case "TEACHER":
                return (quiz.hiddenFromRoles && !quiz.hiddenFromRoles?.includes("TEACHER")) ?? true;
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

    return <Container>
        <TitleAndBreadcrumb currentPageTitle={siteSpecific("Practice Tests", "Practice tests")} />
        <PageFragment fragmentId="help_toptext_practice_tests" />
        <ShowLoading until={quizzes}>
            {quizzes && <>
                <h3>Available</h3>
                {quizzes.length === 0 && <p><em>There are no practice tests currently available.</em></p>}
                <Col xs={12} className="mb-4">
                    <Input type="text" placeholder="Filter tests by name..." value={filterText} onChange={(e) => setFilterText(e.target.value)} />
                    <button className={`copy-test-filter-link m-0 ${copied ? "clicked" : ""}`} tabIndex={-1} onClick={() => {
                        if (filterText.trim()) {
                            navigator.clipboard.writeText(`${window.location.host}${window.location.pathname}?filter=${filterText.trim()}#practice`);
                        }
                        setCopied(true);
                    }} onMouseLeave={() => setCopied(false)} />
                </Col>
                <ListGroup className="mb-3 quiz-list">
                    {quizzes.filter((quiz) => showQuiz(quiz) && quiz.title?.toLowerCase().includes(filterText.toLowerCase())).map(quiz => <ListGroupItem className="p-0 bg-transparent" key={quiz.id}>
                        <div className="d-flex flex-grow-1 flex-column flex-sm-row align-items-center p-3">
                            <div>
                                <span className="mb-2 mb-sm-0 pe-2">{quiz.title}</span>
                                {roleVisibilitySummary(quiz)}
                                {quiz.summary && <div className="small text-muted d-none d-md-block">{quiz.summary}</div>}
                            </div>
                            <Spacer />
                            {isTutorOrAbove(user) && <div className="d-none d-md-flex align-items-center me-4">
                                <Link to={{pathname: `/test/preview/${quiz.id}`}}>
                                    <span>Preview</span>
                                </Link>
                            </div>}
                            <Button tag={Link} to={{pathname: `/test/attempt/${quiz.id}`}}>
                                {siteSpecific("Take Test", "Take test")}
                            </Button>
                        </div>
                    </ListGroupItem>)}
                </ListGroup>
            </>}
        </ShowLoading>
    </Container>;
};

export const PracticeQuizzes = withRouter(PracticeQuizzesComponent);
