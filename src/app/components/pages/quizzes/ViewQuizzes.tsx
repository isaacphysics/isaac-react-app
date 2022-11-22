import React from "react";
import {Link} from "react-router-dom";
import * as RS from "reactstrap";
import {ShowLoading} from "../../handlers/ShowLoading";
import {RegisteredUserDTO} from "../../../../IsaacApiTypes";
import {TitleAndBreadcrumb} from "../../elements/TitleAndBreadcrumb";
import {siteSpecific, useFilteredQuizzes} from "../../../services";

export const ViewQuizzes = ({user}: {user: RegisteredUserDTO}) => {

    const {titleFilter, setTitleFilter, filteredQuizzes} = useFilteredQuizzes(user);

    const pageHelp = <span>
        Use this page to preview tests that your students can attempt.
    </span>;

    return <RS.Container>
        <TitleAndBreadcrumb currentPageTitle={siteSpecific("Preview Tests", "Preview tests")} help={pageHelp} />
        <div className="my-4 mb-5">
            <ShowLoading until={filteredQuizzes}>
                {filteredQuizzes && <>
                    <p>The following tests are available for your groups to freely attempt.</p>
                    <RS.Input
                        id="available-quizzes-title-filter" type="search" className="mb-4"
                        value={titleFilter} onChange={event => setTitleFilter(event.target.value)}
                        placeholder="Search by title" aria-label="Search by title"
                    />
                    {filteredQuizzes.length === 0 && <p><em>There are no tests which match your search term.</em></p>}
                    <RS.ListGroup className="mb-2 quiz-list">
                        {filteredQuizzes.map(quiz =>  <RS.ListGroupItem className="p-0 bg-transparent" key={quiz.id}>
                            <div className="d-flex flex-grow-1 flex-column flex-sm-row align-items-center p-3">
                                <span className="mb-2 mb-sm-0">{quiz.title}</span>
                                {quiz.summary && <div className="small text-muted d-none d-md-block">{quiz.summary}</div>}
                            </div>
                            <div className="d-none d-md-flex align-items-center">
                                <Link className="my-3 mr-2 pl-3 pr-4 quiz-list-separator" to={{pathname: `/test/preview/${quiz.id}`}}>
                                    <span>Preview</span>
                                </Link>
                            </div>
                        </RS.ListGroupItem>)}
                    </RS.ListGroup>
                </>}
            </ShowLoading>
        </div>
    </RS.Container>;
};
