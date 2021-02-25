import React, {useEffect} from "react";
import {useDispatch, useSelector} from "react-redux";
import {Link, withRouter} from "react-router-dom";
import * as RS from "reactstrap";
import {ShowLoading} from "../../handlers/ShowLoading";
import {RegisteredUserDTO} from "../../../../IsaacApiTypes";
import {selectors} from "../../../state/selectors";
import {TitleAndBreadcrumb} from "../../elements/TitleAndBreadcrumb";
import {loadQuizzes, showQuizSettingModal} from "../../../state/actions/quizzes";
import {Spacer} from "../../elements/Spacer";

interface SetQuizzesPageProps {
    user: RegisteredUserDTO;
    location: {hash: string};
}

const SetQuizzesPageComponent = (props: SetQuizzesPageProps) => {
    const quizzes = useSelector(selectors.quizzes.available);

    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(loadQuizzes());
    }, [dispatch]);

    const pageHelp = <span>
        Use this page to set quizzes to your groups. You can assign any quiz the Isaac team have built.
        <br />
        Students in the group will be emailed when you set a new quiz.
    </span>;

    return <RS.Container>
        <TitleAndBreadcrumb currentPageTitle="Set quizzes" help={pageHelp} />
        <ShowLoading until={quizzes}>
            {quizzes && <>
                <h2>Available quizzes</h2>
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
            </>}</ShowLoading>
    </RS.Container>;
};

export const SetQuizzes = withRouter(SetQuizzesPageComponent);
