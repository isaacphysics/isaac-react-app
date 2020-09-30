import React, {useEffect, useRef, useState} from 'react';
import {useDispatch, useSelector} from "react-redux";
import * as RS from "reactstrap";
import {Spinner} from "reactstrap";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {ContentSummaryDTO, GameboardItem} from "../../../IsaacApiTypes";
import {
    closeActiveModal,
    createGameboard,
    getWildcards,
    loadGameboard,
    logAction,
    openActiveModal
} from "../../state/actions";
import {QuestionSearchModal} from "../elements/modals/QuestionSearchModal";
import {DragDropContext, Draggable, Droppable, DropResult} from "react-beautiful-dnd";
import {AppState} from "../../state/reducers";
import {GameboardCreatedModal} from "../elements/modals/GameboardCreatedModal";
import {isStaff} from "../../services/user";
import {resourceFound, validateUrl} from "../../services/validation";
import {
    convertContentSummaryToGameboardItem,
    loadGameboardQuestionOrder,
    loadGameboardSelectedQuestions,
    logEvent,
    multiSelectOnChange
} from "../../services/gameboardBuilder";
import {GameboardBuilderRow} from "../elements/GameboardBuilderRow";
import {EXAM_BOARD, examBoardTagMap} from "../../services/constants";
import {history} from "../../services/history"
import Select from "react-select";
import {withRouter} from "react-router-dom";
import queryString from "query-string";
import {ShowLoading} from "../handlers/ShowLoading";
import {SITE, SITE_SUBJECT} from "../../services/siteConstants";
import {selectors} from "../../state/selectors";
import intersection from "lodash/intersection";

export const GameboardBuilder = withRouter((props: {location: {search?: string}}) => {
    const queryParams = props.location.search && queryString.parse(props.location.search);
    const baseGameboardId = queryParams && queryParams.base as string;

    const dispatch = useDispatch();

    const user = useSelector(selectors.user.orNull);
    const wildcards = useSelector((state: AppState) => state && state.wildcards);
    const baseGameboard = useSelector(selectors.board.currentGameboard);

    const [gameboardTitle, setGameboardTitle] = useState("");
    const [gameboardTags, setGameboardTags] = useState<string[]>([]);
    const [gameboardURL, setGameboardURL] = useState<string>();
    const [questionOrder, setQuestionOrder] = useState<string[]>( []);
    const [selectedQuestions, setSelectedQuestions] = useState(new Map<string, ContentSummaryDTO>());
    const [wildcardId, setWildcardId] = useState<string | undefined>(undefined);
    const eventLog = useRef<object[]>([]).current; // Use ref to persist state across renders but not rerender on mutation

    useEffect(() => {
        if (baseGameboard) {
            setGameboardTitle(`${baseGameboard.title} (Copy)`);
            setQuestionOrder(loadGameboardQuestionOrder(baseGameboard) || []);
            setSelectedQuestions(loadGameboardSelectedQuestions(baseGameboard) || new Map<string, ContentSummaryDTO>());
            setWildcardId(isStaff(user) && baseGameboard.wildCard && baseGameboard.wildCard.id || undefined);
            logEvent(eventLog, "CLONE_GAMEBOARD", {gameboardId: baseGameboard.id});
        }
    }, [user, baseGameboard]);

    const canSubmit = (selectedQuestions.size > 0 && selectedQuestions.size <= 10) && gameboardTitle != "" && validateUrl(gameboardURL);

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
        <TitleAndBreadcrumb currentPageTitle="Gameboard builder" help={pageHelp}/>

        <RS.Card className="p-3 mt-4 mb-5">
            <RS.CardBody>
                <RS.Row>
                    <RS.Col>
                        <RS.Label htmlFor="gameboard-builder-name">Gameboard title:</RS.Label>
                        <RS.Input id="gameboard-builder-name"
                            type="text"
                            placeholder={{[SITE.CS]: "e.g. Year 12 Network components", [SITE.PHY]: "e.g. Year 12 Dynamics"}[SITE_SUBJECT]}
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
                                { value: examBoardTagMap[EXAM_BOARD.AQA], label: 'AQA' },
                                { value: examBoardTagMap[EXAM_BOARD.OCR], label: 'OCR' },
                                { value: 'ISAAC_BOARD', label: 'Created by Isaac' }]}
                            name="colors"
                            className={SITE_SUBJECT === SITE.CS ? "basic-multi-select" : ""}
                            classNamePrefix="select"
                            placeholder="None"
                            onChange={multiSelectOnChange(setGameboardTags)}
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
                            invalid={!validateUrl(gameboardURL)}
                        />
                    </RS.Col>
                    <RS.Col>
                        <RS.Label htmlFor="gameboard-builder-wildcard">Wildcard</RS.Label>
                        <RS.Input id="gameboard-builder-wildcard"
                            type="select" defaultValue={wildcardId}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {setWildcardId(e.target.value);}}
                        >
                            <option value="random">Random wildcard</option>
                            {resourceFound(wildcards) && wildcards.map((wildcard) => {
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
                                    {SITE_SUBJECT === SITE.PHY && <th className="w-15">Level</th>}
                                    {SITE_SUBJECT === SITE.CS && <th className="w-15">Exam boards</th>}
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
                                                            setQuestionOrder={setQuestionOrder}
                                                        />)}
                                                </Draggable>
                                            })}
                                            {provided.placeholder}
                                            <tr>
                                                <td colSpan={5}>
                                                    <div className="img-center">
                                                        <ShowLoading
                                                            placeholder={<div className="text-center"><Spinner color="primary" /></div>}
                                                            until={!baseGameboardId || baseGameboard}
                                                        >
                                                            <input
                                                                type="image" src="/assets/add.svg" className="centre img-fluid"
                                                                alt="Add questions" title="Add questions"
                                                                onClick={() => {
                                                                    logEvent(eventLog, "OPEN_SEARCH_MODAL", {});
                                                                    dispatch(openActiveModal({
                                                                        closeAction: () => {dispatch(closeActiveModal())},
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
                                                            />
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

                <RS.Input
                    id="gameboard-save-button" type="button" value="Save gameboard" disabled={!canSubmit}
                    className={"btn btn-block btn-secondary border-0 mt-2"} aria-describedby="gameboard-help"
                    onClick={() => {
                        // TODO - refactor this onCLick into a named method; and use Tags service, not hardcoded subject tag list.
                        let wildcard = undefined;
                        if (wildcardId && resourceFound(wildcards) && wildcards.length > 0) {
                            wildcard = wildcards.filter((wildcard) => wildcard.id == wildcardId)[0];
                        }

                        let subjects = [];

                        if (SITE_SUBJECT == SITE.CS) {
                            subjects.push("computer_science");
                        } else {
                            const definedSubjects = ["physics", "maths", "chemistry"];
                            selectedQuestions?.forEach((item) => {
                                let tags = intersection(definedSubjects, item.tags || []);
                                tags.forEach((tag: string) => subjects.push(tag));
                            }
                            );
                            // If none of the questions have a subject tag, default to physics
                            if (subjects.length === 0) {
                                subjects.push("physics");
                            }
                            subjects = Array.from(new Set(subjects));
                        }

                        dispatch(createGameboard({
                            id: gameboardURL,
                            title: gameboardTitle,
                            questions: questionOrder.map((questionId) => {
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
                />

                {!canSubmit && <div
                    id="gameboard-help" color="light"
                    className={`text-center mb-0 pt-3 pb-0 ${selectedQuestions.size <= 10 ? "text-muted" : "text-danger"}`}
                >
                    Gameboards require both a title and between 1 and 10 questions. {!validateUrl(gameboardURL) && "The " +
                "gameboard ID should contain numbers, lowercase letters, underscores and hyphens only. It should not be the full URL."}
                </div>}

            </RS.CardBody>
        </RS.Card>
    </RS.Container>;
});
