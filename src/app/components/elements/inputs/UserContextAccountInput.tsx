import React, {useEffect} from "react";
import {ValidationUser} from "../../../../IsaacAppTypes";
import {isTeacher} from "../../../services/user";
import * as RS from "reactstrap";
import {Input} from "reactstrap";
import {EXAM_BOARD, STAGE} from "../../../services/constants";
import {getFilteredExamBoardOptions, getFilteredStages} from "../../../services/userContext";
import {Link} from "react-router-dom";
import {SITE, SITE_SUBJECT, TEACHER_REQUEST_ROUTE} from "../../../services/siteConstants";
import {UserContext} from "../../../../IsaacApiTypes";

interface UserContextRowProps {
    userContext: UserContext;
    setUserContext: (ucs: UserContext) => void;
    showNullStageOption: boolean;
    submissionAttempted: boolean;
}
function UserContextRow({userContext, setUserContext, showNullStageOption, submissionAttempted}: UserContextRowProps) {
    return <React.Fragment>
        {/* Stage Selector */}
        <Input
            className="form-control w-auto d-inline-block pl-1 pr-0" type="select"
            aria-label="Stage"
            value={userContext.stage || ""}
            invalid={submissionAttempted && !Object.values(STAGE).includes(userContext.stage as STAGE)}
            onChange={e => setUserContext({...userContext, stage: e.target.value as STAGE})}
        >
            <option value=""></option>
            {getFilteredStages(showNullStageOption).map(item =>
                <option key={item.value} value={item.value}>{item.label}</option>
            )}
        </Input>

        {/* Exam Board Selector */}
        {SITE_SUBJECT === SITE.CS && <Input
            className="form-control w-auto d-inline-block pl-1 pr-0 ml-2" type="select"
            aria-label="Exam Board"
            value={userContext.examBoard || ""}
            invalid={submissionAttempted && !Object.values(EXAM_BOARD).includes(userContext.examBoard as EXAM_BOARD)}
            onChange={e => setUserContext({...userContext, examBoard: e.target.value as EXAM_BOARD})}
        >
            <option value=""></option>
            {getFilteredExamBoardOptions([userContext.stage as STAGE || STAGE.NONE], true, true).map(item =>
                <option key={item.value} value={item.value}>{item.label}</option>
            )}
        </Input>}
    </React.Fragment>
}

interface UserContextAccountInputProps {
    user: ValidationUser;
    userContexts: UserContext[];
    setUserContexts: (ucs: UserContext[]) => void;
    submissionAttempted: boolean;
}
export function UserContextAccountInput({user, userContexts, setUserContexts, submissionAttempted}: UserContextAccountInputProps) {
    useEffect(function ensureOneUserContext() {if (userContexts.length === 0) setUserContexts([{}]);}, [userContexts.length]);
    const teacher = isTeacher({...user, loggedIn: true});
    const numberOfPossibleStages = getFilteredStages(false).length;

    return <div>
        <RS.Label htmlFor="user-context-selector" className="form-required">
            {teacher ? "I am teaching" : "I am studying"}
        </RS.Label>
        {!teacher && <small className="float-right mt-1"><Link to={TEACHER_REQUEST_ROUTE} target="_blank">I am a teacher!</Link></small>}
        <RS.FormGroup id="user-context-selector" className={SITE_SUBJECT === SITE.PHY ? "d-flex flex-wrap" : ""}>
            {userContexts.map((userContext, index) => {
                const showPlusOption = teacher &&
                    index === userContexts.length - 1 &&
                    index < numberOfPossibleStages - 1 &&
                    userContext.stage !== STAGE.NONE;

                return <RS.FormGroup key={userContext.stage || index}>
                    <UserContextRow
                        userContext={userContext} showNullStageOption={userContexts.length <= 1} submissionAttempted={submissionAttempted}
                        setUserContext={newUc => setUserContexts(userContexts.map((uc, i) => i === index ? newUc : uc))}
                    />

                    {teacher && userContexts.length > 1 && <button
                        className="mx-2 close float-none align-middle" aria-label="clear stage row"
                        onClick={() => setUserContexts(userContexts.filter((uc, i) => i !== index))}
                    >
                        ×
                    </button>}

                    {showPlusOption && <button
                        className={`${userContexts.length <= 1 ? "ml-2" : ""} align-middle close float-none`} aria-label="Add stage"
                        onClick={() => setUserContexts([...userContexts, {}])}
                    >
                        +
                    </button>}

                </RS.FormGroup>
            })}
        </RS.FormGroup>
    </div>
}
