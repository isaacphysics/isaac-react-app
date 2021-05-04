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
import {SITE, SITE_SUBJECT} from "../../../services/siteConstants";
import {Card} from "reactstrap";
import {CardBody} from "reactstrap";
import {Container} from "reactstrap";
import {Tabs} from "../../elements/Tabs";
import {IsaacTabbedHints} from "../../content/IsaacHints";
import {below, DeviceSize, useDeviceSize} from "../../../services/device";

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
        <RS.Card>
            <RS.CardHeader>
                <h4 className="mb-0">{assignment.quizSummary?.title || assignment.quizId}</h4>
            </RS.CardHeader>
            <RS.CardBody>
                Set to: <strong>{assignment.groupName ?? "Unknown"}</strong> <br />
                {assignment.dueDate ? <>Due date: <strong>{formatDate(assignment.dueDate)}</strong></> : "No due date"} <br />
                Set on: <strong>{formatDate(assignment.creationDate)} by {formatAssignmentOwner(user, assignment)}</strong>
            </RS.CardBody>
            <RS.CardFooter className="text-right">
                <RS.Button color="tertiary" size="sm" outline onClick={cancel} disabled={isCancelling} className="mr-1">
                    {isCancelling ? <><RS.Spinner size="sm" /> Cancelling...</> : {[SITE.CS]: "Cancel quiz", [SITE.PHY]: "Cancel Quiz"}[SITE_SUBJECT]}
                </RS.Button>
                <RS.Button tag={Link} to={`/quiz/assignment/${assignment.id}/feedback`} disabled={isCancelling} color={isCancelling ? "tertiary" : undefined} size="sm" className="ml-1">
                    {{[SITE.CS]: "View results", [SITE.PHY]: "View Results"}[SITE_SUBJECT]}
                </RS.Button>
            </RS.CardFooter>
        </RS.Card>
    </div>;
}

const SetQuizzesPageComponent = ({user}: SetQuizzesPageProps) => {
    const deviceSize = useDeviceSize();
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
        <TitleAndBreadcrumb currentPageTitle={{[SITE.CS]: "Set quizzes", [SITE.PHY]: "Set Quizzes"}[SITE_SUBJECT]} help={pageHelp} />

        <Card className="my-5">
            <CardBody className="mt-3" >
                <Tabs tabContentClass="mt-4">
                    {{
                        [{[SITE.CS]: "Available quizzes", [SITE.PHY]: "Available Quizzes"}[SITE_SUBJECT]]:
                        <ShowLoading until={quizzes}>
                            {quizzes && <>
                                <p>The following quizzes are available to set to your groups.</p>
                                {quizzes.length === 0 && <p><em>There are no quizzes you can set.</em></p>}
                                <RS.ListGroup className="mb-2 quiz-list">
                                    {quizzes.map(quiz =>  <RS.ListGroupItem className="p-0 bg-transparent" key={quiz.id}>
                                        <div className="d-flex flex-grow-1 flex-column flex-sm-row align-items-center p-3">
                                            <span className="mb-2 mb-sm-0">{quiz.title}</span>
                                            {quiz.summary && <div className="small text-muted d-none d-md-block">{quiz.summary}</div>}
                                            <Spacer />
                                            <RS.Button className={below["md"](deviceSize) ? "btn-sm" : ""} onClick={() => dispatch(showQuizSettingModal(quiz))}>
                                                {{[SITE.CS]: "Set quiz", [SITE.PHY]: "Set Quiz"}[SITE_SUBJECT]}
                                            </RS.Button>
                                        </div>
                                        <div className="d-none d-md-flex align-items-center">
                                            <Link className="my-3 mr-2 pl-3 pr-4 quiz-list-separator" to={{pathname: `/quiz/preview/${quiz.id}`}}>
                                                <span>Preview</span>
                                            </Link>
                                        </div>
                                    </RS.ListGroupItem>)}
                                </RS.ListGroup>
                            </>}
                        </ShowLoading>,

                        [{[SITE.CS]: "Previously set quizzes", [SITE.PHY]: "Previously Set Quizzes"}[SITE_SUBJECT]]:
                        <ShowLoading until={quizAssignments} ifNotFound={<RS.Alert color="warning">Quizzes you have assigned have failed to load, please try refreshing the page.</RS.Alert>}>
                            {quizAssignments && quizAssignments !== NOT_FOUND && <>
                                {quizAssignments.length === 0 && <p>You have not set any quizzes to your groups yet.</p>}
                                {quizAssignments.length > 0 && <div className="block-grid-xs-1 block-grid-md-2 block-grid-lg-3 my-2">
                                    {quizAssignments.map(assignment => <QuizAssignment key={assignment.id} user={user} assignment={assignment} />)}
                                </div>}
                            </>}
                        </ShowLoading>,
                    }}
                </Tabs>
            </CardBody>
        </Card>
    </RS.Container>;
};

export const SetQuizzes = withRouter(SetQuizzesPageComponent);
