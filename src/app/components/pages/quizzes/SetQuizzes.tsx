import React, {useEffect} from "react";
import {useDispatch, useSelector} from "react-redux";
import {Link, withRouter} from "react-router-dom";
import * as RS from "reactstrap";
import {ShowLoading} from "../../handlers/ShowLoading";
import {QuizAssignmentDTO, RegisteredUserDTO} from "../../../../IsaacApiTypes";
import {selectors} from "../../../state/selectors";
import {TitleAndBreadcrumb} from "../../elements/TitleAndBreadcrumb";
import {loadQuizzes, showQuizSettingModal, loadQuizAssignments, markQuizAsCancelled} from "../../../state/actions/quizzes";
import {Spacer} from "../../elements/Spacer";
import {formatDate} from "../../elements/DateString";
import {AppQuizAssignment} from "../../../../IsaacAppTypes";
import {loadGroups} from "../../../state/actions";
import {NOT_FOUND} from "../../../services/constants";

interface SetQuizzesPageProps {
    user: RegisteredUserDTO;
    location: {hash: string};
}

interface QuizAssignmentProps {
    user: RegisteredUserDTO;
    assignment: AppQuizAssignment;
}

function formatAssignmentOwner(user: RegisteredUserDTO, assignment: QuizAssignmentDTO) {
    if (user.id === assignment.ownerUserId) {
        return "Me";
    } else if (assignment.assignerSummary && assignment.assignerSummary.givenName && assignment.assignerSummary.familyName) {
        return assignment.assignerSummary.givenName + " " + assignment.assignerSummary.familyName;
    } else {
        return "Someone else";
    }
}

function QuizAssignment({user, assignment}: QuizAssignmentProps) {
    const dispatch = useDispatch();
    const cancel = () => {
        if (window.confirm("Are you sure you want to cancel?\r\nStudents will no longer be able to take the quiz or see any feedback.")) {
            dispatch(markQuizAsCancelled(assignment.id as number));
        }
    };
    const isCancelling = 'cancelling' in assignment && (assignment as {cancelling: boolean}).cancelling;
    return <div className="p-2">
        <RS.Card><RS.CardBody>
            <RS.CardTitle><h4>{assignment.quizSummary?.title || assignment.quizId}</h4></RS.CardTitle>
            <p>
                Set to: <strong>{assignment.groupName ?? "Unknown"}</strong>
                <br />
                {assignment.dueDate ? <>Due date: <strong>{formatDate(assignment.dueDate)}</strong></> : "No due date"}
            </p>
            <RS.Button tag={Link} to={`/quiz/assignment/${assignment.id}/feedback`} disabled={isCancelling} color={isCancelling ? "tertiary" : undefined}>
                View results
            </RS.Button>
            <p className="mb-1 mt-3">
                Set: {formatDate(assignment.creationDate)} by {formatAssignmentOwner(user, assignment)}
            </p>
        </RS.CardBody>
        <RS.CardFooter>
            <RS.Button color="warning" outline onClick={cancel} disabled={isCancelling}>{isCancelling ? <><RS.Spinner size="sm" /> Cancelling...</> : "Cancel quiz"}</RS.Button>
        </RS.CardFooter>
    </RS.Card></div>;
}

const SetQuizzesPageComponent = ({user}: SetQuizzesPageProps) => {
    const quizzes = useSelector(selectors.quizzes.available);
    const quizAssignments = useSelector(selectors.quizzes.assignments);

    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(loadGroups(false));
        dispatch(loadQuizzes());
        dispatch(loadQuizAssignments());
    }, [dispatch]);

    const pageHelp = <span>
        Use this page to manage and set quizzes to your groups. You can assign any quiz the Isaac team have built.
        <br />
        Students in the group will be emailed when you set a new quiz.
    </span>;

    return <RS.Container>
        <TitleAndBreadcrumb currentPageTitle="Set quizzes" help={pageHelp} />
        <ShowLoading until={quizAssignments} ifNotFound={<RS.Alert color="warning">Quizzes you have assigned have failed to load, please try refreshing the page.</RS.Alert>}>
            {quizAssignments && quizAssignments !== NOT_FOUND && <>
                <h2>Quizzes you have set</h2>
                {quizAssignments.length === 0 && <p>You have not set any quizzes to your groups yet.</p>}
                {quizAssignments.length > 0 && <div className="block-grid-xs-1 block-grid-md-2 block-grid-lg-3 my-2">
                    {quizAssignments.map(assignment => <QuizAssignment key={assignment.id} user={user} assignment={assignment} />)}
                </div>}
            </>}
        </ShowLoading>
        <ShowLoading until={quizzes}>
            {quizzes && <>
                <h2>Available quizzes</h2>
                {quizzes.length === 0 && <p><em>There are no quizzes you can set.</em></p>}
                <RS.ListGroup className="mb-3 quiz-list">
                    {quizzes.map(quiz =>  <RS.ListGroupItem className="p-0 bg-transparent" key={quiz.id}>
                        <div className="flex-grow-1 p-2 d-flex">
                            <span>{quiz.title}</span>
                            {quiz.summary && <div className="small text-muted d-none d-md-block">{quiz.summary}</div>}
                            <Spacer />
                            <RS.Button onClick={() => dispatch(showQuizSettingModal(quiz))}>Set Quiz</RS.Button>
                        </div>
                        <div>
                            <Link className="my-3 pl-3 pr-4 quiz-list-separator" to={{pathname: `/quiz/preview/${quiz.id}`}}>
                                <span>Preview</span>
                            </Link>
                        </div>
                    </RS.ListGroupItem>)}
                </RS.ListGroup>
            </>}
        </ShowLoading>
    </RS.Container>;
};

export const SetQuizzes = withRouter(SetQuizzesPageComponent);
