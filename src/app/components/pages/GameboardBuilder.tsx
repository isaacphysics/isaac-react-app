import React, {lazy, useEffect, useRef, useState} from 'react';
import {useDispatch, useSelector} from "react-redux";
import * as RS from "reactstrap";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {GameboardItem} from "../../../IsaacApiTypes";
import {
    closeActiveModal,
    createGameboard,
    generateTemporaryGameboard,
    getWildcards,
    loadGameboard,
    logAction,
    openActiveModal,
} from "../../state/actions";
import {QuestionSearchModal} from "../elements/modals/QuestionSearchModal";
import {DragDropContext, Draggable, Droppable, DropResult} from "react-beautiful-dnd";
import {AppState} from "../../state/reducers";
import {GameboardCreatedModal} from "../elements/modals/GameboardCreatedModal";
import {isStaff} from "../../services/user";
import {isValidGameboardId} from "../../services/validation";
import {
    convertContentSummaryToGameboardItem,
    loadGameboardQuestionOrder,
    loadGameboardSelectedQuestions,
    logEvent
} from "../../services/gameboardBuilder";
import {history} from "../../services/history"
import Select from "react-select";
import {withRouter} from "react-router-dom";
import queryString from "query-string";
import {ShowLoading} from "../handlers/ShowLoading";
import {isCS, siteSpecific} from "../../services/siteConstants";
import {selectors} from "../../state/selectors";
import intersection from "lodash/intersection";
import {ContentSummary} from "../../../IsaacAppTypes";
import {IsaacSpinner} from "../handlers/IsaacSpinner";
import {useUserContext} from "../../services/userContext";
import {EXAM_BOARD, STAGE} from "../../services/constants";
import {selectOnChange} from "../../services/select";
import {isFound} from "../../services/miscUtils";
const GameboardBuilderRow = lazy(() => import("../elements/GameboardBuilderRow"));

const GameboardBuilder = withRouter((props: {location: {search?: string}}) => {
    const queryParams = props.location.search && queryString.parse(props.location.search);
    const baseGameboardId = queryParams && queryParams.base as string;
    const concepts = queryParams && queryParams.concepts as string;

    const dispatch = useDispatch();

    const user = useSelector(selectors.user.orNull);
    const userContext = useUserContext();
    const wildcards = useSelector((state: AppState) => state && state.wildcards);
    const baseGameboard = useSelector(selectors.board.currentGameboard);

    const [gameboardTitle, setGameboardTitle] = useState("");
    const [gameboardTags, setGameboardTags] = useState<string[]>([]);
    const [gameboardURL, setGameboardURL] = useState<string>();
    const [questionOrder, setQuestionOrder] = useState<string[]>( []);
    const [selectedQuestions, setSelectedQuestions] = useState(new Map<string, ContentSummary>());
    const [wildcardId, setWildcardId] = useState<string | undefined>(undefined);
    const eventLog = useRef<object[]>([]).current; // Use ref to persist state across renders but not rerender on mutation

    useEffect(() => {
        if (baseGameboard) {
            setGameboardTitle(baseGameboard.title ? `${baseGameboard.title} (Copy)` : "");
            setQuestionOrder(loadGameboardQuestionOrder(baseGameboard) || []);
            setSelectedQuestions(loadGameboardSelectedQuestions(baseGameboard) || new Map<string, ContentSummary>());
            setWildcardId(isStaff(user) && baseGameboard.wildCard && baseGameboard.wildCard.id || undefined);
            if (concepts && (!baseGameboardId)) {
                logEvent(eventLog, "GAMEBOARD_FROM_CONCEPT", {concepts: concepts});
            } else {
                logEvent(eventLog, "CLONE_GAMEBOARD", {gameboardId: baseGameboard.id});
            }
        }
    }, [user, baseGameboard]);

    const canSubmit = (selectedQuestions.size > 0 && selectedQuestions.size <= 10) && gameboardTitle != "" && isValidGameboardId(gameboardURL);

    const reorder = (result: DropResult) => {
        if (result.destination) {
            const [removed] = questionOrder.splice(result.source.index, 1);
            questionOrder.splice(result.destination.index, 0, removed);
        }
    };

    useEffect(() => {if (!wildcards) dispatch(getWildcards())}, [dispatch, user, wildcards]);
    useEffect(() => {
        if (baseGameboardId && (!baseGameboard)) {
            dispatch(loadGameboard(baseGameboardId));
        }
    }, [dispatch, baseGameboardId, baseGameboard]);
    useEffect(() => {
        if (concepts && (!baseGameboardId)) {
            const params: {[key: string]: string} = {};
            params.concepts = concepts;
            if (userContext.stage !== STAGE.ALL) {
                params.stages = userContext.stage;
            }
            if (userContext.examBoard !== EXAM_BOARD.ALL) {
                params.examBoards = userContext.examBoard;
            }
            dispatch(generateTemporaryGameboard(params));
        }
    }, [dispatch, concepts])
    useEffect(() => {
        return history.block(() => {
            logEvent(eventLog, "LEAVE_GAMEBOARD_BUILDER", {});
            dispatch(logAction({type: "LEAVE_GAMEBOARD_BUILDER", events: eventLog}));
        });
    });

    const pageHelp = <span>
        You can create custom question sets to assign to your groups. Search by question title or topic and add up to
        ten questions to a gameboard.
        <br />
        You cannot modify a gameboard after it has been created. You&apos;ll find a link underneath any
        existing gameboard to duplicate and edit it.
    </span>;

    return <RS.Container id="gameboard-builder">
        <TitleAndBreadcrumb currentPageTitle="Gameboard builder" help={pageHelp} modalId="gameboard_builder_help"/>

        <RS.Card className="p-3 mt-4 mb-5">
            <RS.CardBody>
                <RS.Row>
                    <RS.Col>
                        <RS.Label htmlFor="gameboard-builder-name">Gameboard title:</RS.Label>
                        <RS.Input id="gameboard-builder-name"
                            type="text"
                            placeholder={siteSpecific("e.g. Year 12 Dynamics", "e.g. Year 12 Network components")}
                            defaultValue={gameboardTitle}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                setGameboardTitle(e.target.value);
                            }}
                        />
                    </RS.Col>
                </RS.Row>

                {isStaff(user) && <RS.Row className="mt-2">
                    <RS.Col>
                        <RS.Label htmlFor="gameboard-builder-tag-as">Tag as</RS.Label>
                        <Select inputId="question-search-level"
                            isMulti
                            options={[
                                { value: 'ISAAC_BOARD', label: 'Created by Isaac' },
                                { value: 'RESEARCH_BOARD', label: 'Research board' }
                            ]}
                            name="colors"
                            className="basic-multi-select"
                            classNamePrefix="select"
                            placeholder="None"
                            onChange={selectOnChange(setGameboardTags, true)}
                        />
                    </RS.Col>
                    <RS.Col>
                        <RS.Label htmlFor="gameboard-builder-url">Gameboard ID</RS.Label>
                        <RS.Input id="gameboard-builder-url"
                            type="text"
                            placeholder="Optional"
                            defaultValue={gameboardURL}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                setGameboardURL(e.target.value);
                            }}
                            invalid={!isValidGameboardId(gameboardURL)}
                        />
                    </RS.Col>
                    <RS.Col>
                        <RS.Label htmlFor="gameboard-builder-wildcard">Wildcard</RS.Label>
                        <RS.Input id="gameboard-builder-wildcard"
                            type="select" defaultValue={wildcardId}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {setWildcardId(e.target.value);}}
                        >
                            <option value="random">Random wildcard</option>
                            {isFound(wildcards) && wildcards.map((wildcard) => {
                                return <option key={wildcard.id} value={wildcard.id}>{wildcard.title}</option>
                            })}
                        </RS.Input>
                    </RS.Col>
                </RS.Row>}

                <div className="mt-4 responsive">
                    <DragDropContext onDragEnd={reorder}>
                        <RS.Table bordered>
                            <thead>
                                <tr>
                                    <th className="w-5" />
                                    <th className="w-40">Question title</th>
                                    <th className="w-25">Topic</th>
                                    <th className="w-15">Stage</th>
                                    <th className={siteSpecific("w-15","w-10")}>Difficulty</th>
                                    {isCS && <th className="w-5">Exam boards</th>}
                                </tr>
                            </thead>
                            <Droppable droppableId="droppable">
                                {(provided) => {
                                    return (
                                        <tbody ref={provided.innerRef}>
                                            {questionOrder.map((questionId, index: number) => {
                                                const question = selectedQuestions.get(questionId);
                                                return question && question.id && <Draggable key={question.id} draggableId={question.id} index={index}>
                                                    {(provided) => (
                                                        <GameboardBuilderRow
                                                            provided={provided} key={`gameboard-builder-row-${question.id}`}
                                                            question={question} selectedQuestions={selectedQuestions}
                                                            setSelectedQuestions={setSelectedQuestions} questionOrder={questionOrder}
                                                            setQuestionOrder={setQuestionOrder} creationContext={question.creationContext}
                                                        />)}
                                                </Draggable>
                                            })}
                                            {provided.placeholder}
                                            <tr>
                                                <td colSpan={siteSpecific(5, 6)}>
                                                    <div className="img-center">
                                                        <ShowLoading
                                                            placeholder={<div className="text-center"><IsaacSpinner /></div>}
                                                            until={!baseGameboardId || baseGameboard}
                                                        >
                                                            <RS.Button
                                                                className="plus-button"
                                                                color="primary" outline
                                                                onClick={() => {
                                                                    logEvent(eventLog, "OPEN_SEARCH_MODAL", {});
                                                                    dispatch(openActiveModal({
                                                                        closeAction: () => {dispatch(closeActiveModal())},
                                                                        closeLabelOverride: "CANCEL",
                                                                        size: "xl",
                                                                        title: "Search questions",
                                                                        body: <QuestionSearchModal
                                                                            originalSelectedQuestions={selectedQuestions}
                                                                            setOriginalSelectedQuestions={setSelectedQuestions}
                                                                            originalQuestionOrder={questionOrder}
                                                                            setOriginalQuestionOrder={setQuestionOrder}
                                                                            eventLog={eventLog}
                                                                        />
                                                                    }))
                                                                }}
                                                            >
                                                                {siteSpecific("Add Questions", "Add questions")}
                                                            </RS.Button>
                                                        </ShowLoading>
                                                    </div>
                                                </td>
                                            </tr>
                                        </tbody>
                                    )}}
                            </Droppable>
                        </RS.Table>
                    </DragDropContext>
                </div>

                <div className="text-center">
                    <RS.Button
                        id="gameboard-save-button" disabled={!canSubmit} color="secondary"
                        className="mt-2" aria-describedby="gameboard-help"
                        onClick={() => {
                            // TODO - refactor this onCLick into a named method; and use Tags service, not hardcoded subject tag list.
                            let wildcard = undefined;
                            if (wildcardId && isFound(wildcards) && wildcards.length > 0) {
                                wildcard = wildcards.filter((wildcard) => wildcard.id == wildcardId)[0];
                            }

                            let subjects = [];

                            if (isCS) {
                                subjects.push("computer_science");
                            } else {
                                const definedSubjects = ["physics", "maths", "chemistry"];
                                selectedQuestions?.forEach((item) => {
                                    const tags = intersection(definedSubjects, item.tags || []);
                                    tags.forEach((tag: string) => subjects.push(tag));
                                });
                                // If none of the questions have a subject tag, default to physics
                                if (subjects.length === 0) {
                                    subjects.push("physics");
                                }
                                subjects = Array.from(new Set(subjects));
                            }

                            dispatch(createGameboard({
                                id: gameboardURL,
                                title: gameboardTitle,
                                contents: questionOrder.map((questionId) => {
                                    const question = selectedQuestions.get(questionId);
                                    return question && convertContentSummaryToGameboardItem(question);
                                }).filter((question) => question !== undefined) as GameboardItem[],
                                wildCard: wildcard,
                                wildCardPosition: 0,
                                gameFilter: {subjects: subjects},
                                tags: gameboardTags
                            }, baseGameboardId));

                            dispatch(openActiveModal({
                                closeAction: () => {dispatch(closeActiveModal())},
                                title: "Gameboard created",
                                body: <GameboardCreatedModal/>
                            }));

                            logEvent(eventLog, "SAVE_GAMEBOARD", {});
                            dispatch(logAction({type: "SAVE_GAMEBOARD", events: eventLog}));
                        }}
                    >
                        {siteSpecific("Save Gameboard", "Save gameboard")}
                    </RS.Button>
                </div>

                {!canSubmit && <div
                    id="gameboard-help" color="light"
                    className={`text-center mb-0 pt-3 pb-0 ${selectedQuestions.size > 10 ? "text-danger" : ""}`}
                >
                    Gameboards require both a title and between 1 and 10 questions.
                    {!isValidGameboardId(gameboardURL) && <div className="text-danger">
                        The gameboard ID should contain numbers, lowercase letters, underscores and hyphens only.<br />
                        It should not be the full URL.
                    </div>}
                </div>}

            </RS.CardBody>
        </RS.Card>
    </RS.Container>;
});
export default GameboardBuilder;