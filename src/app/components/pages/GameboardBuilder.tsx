import React, {lazy, useCallback, useEffect, useRef, useState} from 'react';
import {
    closeActiveModal,
    logAction,
    mutationSucceeded,
    openActiveModal,
    useAppDispatch,
    useCreateGameboardMutation,
    useGenerateTemporaryGameboardMutation,
    useGetGameboardByIdQuery,
    useGetWildcardsQuery,
} from "../../state";
import {Button, Card, CardBody, Col, Container, Input, Label, Row, Spinner, Table} from "reactstrap";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {GameboardDTO, GameboardItem, RegisteredUserDTO} from "../../../IsaacApiTypes";
import {QuestionSearchModal} from "../elements/modals/QuestionSearchModal";
import {DragDropContext, Draggable, Droppable, DropResult} from "react-beautiful-dnd";
import {GameboardCreatedModal} from "../elements/modals/GameboardCreatedModal";
import {
    convertContentSummaryToGameboardItem,
    EXAM_BOARD,
    GAMEBOARD_UNDO_STACK_SIZE_LIMIT,
    getValue,
    history,
    isAda,
    isDefined,
    isStaff,
    isValidGameboardId,
    Item,
    loadGameboardQuestionOrder,
    loadGameboardSelectedQuestions,
    logEvent,
    selectOnChange,
    siteSpecific,
    STAGE,
    TAG_ID,
    useUserViewingContext
} from "../../services";
import {useLocation} from "react-router-dom";
import queryString from "query-string";
import {ShowLoading} from "../handlers/ShowLoading";
import intersection from "lodash/intersection";
import {ContentSummary, GameboardBuilderQuestionsStackProps} from "../../../IsaacAppTypes";
import {IsaacSpinner} from "../handlers/IsaacSpinner";
import {skipToken} from "@reduxjs/toolkit/query";
import classNames from "classnames";
import {StyledSelect} from "../elements/inputs/StyledSelect";

const GameboardBuilderRow = lazy(() => import("../elements/GameboardBuilderRow"));

class GameboardBuilderQuestionsStack {
    questionOrderStack: string[][];
    setQuestionOrderStack: React.Dispatch<React.SetStateAction<string[][]>>;
    setSelectedQuestionsStack: React.Dispatch<React.SetStateAction<Map<string, ContentSummary>[]>>;
    selectedQuestionsStack: Map<string, ContentSummary>[];

    constructor(props: {questionOrderStack: string[][];
            setQuestionOrderStack: React.Dispatch<React.SetStateAction<string[][]>>;
            selectedQuestionsStack: Map<string, ContentSummary>[];
            setSelectedQuestionsStack: React.Dispatch<React.SetStateAction<Map<string, ContentSummary>[]>>}) {
        this.questionOrderStack = props.questionOrderStack;
        this.setQuestionOrderStack = props.setQuestionOrderStack;
        this.selectedQuestionsStack = props.selectedQuestionsStack;
        this.setSelectedQuestionsStack = props.setSelectedQuestionsStack;
    }

    public push({questionOrder, selectedQuestions} : {questionOrder: string[], selectedQuestions: Map<string, ContentSummary>}) {
        if (this.questionOrderStack.length >= GAMEBOARD_UNDO_STACK_SIZE_LIMIT) {
            this.setSelectedQuestionsStack(p => p.slice(1));
            this.setQuestionOrderStack(p => p.slice(1));
        }
        this.setQuestionOrderStack(p => [...p, questionOrder]);
        this.setSelectedQuestionsStack(p => [...p, selectedQuestions]);
    }

    public pop() {
        const questionOrder = this.questionOrderStack.at(-1) || [];
        const selectedQuestions = this.selectedQuestionsStack.at(-1) || new Map<string, ContentSummary>();
        this.setQuestionOrderStack(this.questionOrderStack.slice(0, -1));
        this.setSelectedQuestionsStack(this.selectedQuestionsStack.slice(0, -1));
        return {questionOrder, selectedQuestions};
    }

    public get length() {
        return this.questionOrderStack.length;
    }

    public clear() {
        this.setQuestionOrderStack([]);
        this.setSelectedQuestionsStack([]);
    }
}

const GameboardBuilder = ({user}: {user: RegisteredUserDTO}) => {
    const {search} = useLocation();
    const queryParams = search && queryString.parse(search);
    const baseGameboardId = queryParams && queryParams.base as string;
    const concepts = queryParams && queryParams.concepts as string;

    const dispatch = useAppDispatch();
    const userContext = useUserViewingContext();
    const {data: wildcards} = useGetWildcardsQuery();
    const {data: baseGameboard} = useGetGameboardByIdQuery(baseGameboardId || skipToken);
    const [generateTemporaryGameboard] = useGenerateTemporaryGameboardMutation();
    const [createGameboard, {isLoading: isWaitingForCreateGameboard}] = useCreateGameboardMutation();

    const [gameboardTitle, setGameboardTitle] = useState("");
    const [gameboardTags, setGameboardTags] = useState<Item<string>[]>([]);
    const [gameboardURL, setGameboardURL] = useState<string>();
    const [questionOrder, setQuestionOrder] = useState<string[]>([]);
    const [previousQuestionOrderStack, setPreviousQuestionOrderStack] = useState<string[][]>([]);
    const [selectedQuestions, setSelectedQuestions] = useState(new Map<string, ContentSummary>());
    const [previousSelectedQuestionsStack, setPreviousSelectedQuestionsStack] = useState(new Array<Map<string, ContentSummary>>());
    const [redoQuestionOrderStack, setRedoQuestionOrderStack] = useState<string[][]>([]);
    const [redoSelectedQuestionsStack, setRedoSelectedQuestionsStack] = useState(new Array<Map<string, ContentSummary>>());
    const [wildcardId, setWildcardId] = useState<string | undefined>(undefined);
    const eventLog = useRef<object[]>([]).current; // Use ref to persist state across renders but not rerender on mutation

    const cloneGameboard = useCallback((gameboard: GameboardDTO) => {
        setGameboardTitle(gameboard.title ? `${gameboard.title} (Copy)` : "");
        setQuestionOrder(loadGameboardQuestionOrder(gameboard) || []);
        setSelectedQuestions(loadGameboardSelectedQuestions(gameboard) || new Map<string, ContentSummary>());
        setWildcardId(isStaff(user) && gameboard.wildCard && gameboard.wildCard.id || undefined);
        if (concepts && (!baseGameboardId)) {
            logEvent(eventLog, "GAMEBOARD_FROM_CONCEPT", {concepts: concepts});
        } else {
            logEvent(eventLog, "CLONE_GAMEBOARD", {gameboardId: gameboard.id});
        }
    }, [setGameboardTitle, setQuestionOrder, setSelectedQuestions, setWildcardId, baseGameboardId, concepts, eventLog, user]);

    const initialise = () => {
        setGameboardURL(undefined);
        setGameboardTitle("");
        setGameboardTags([]);
        setQuestionOrder([]);
        setGameboardURL(undefined);
        setSelectedQuestions(new Map<string, ContentSummary>());
        setWildcardId(undefined);
    };

    useEffect(() => {
        if (baseGameboard) {
            cloneGameboard(baseGameboard);
        }
    }, [baseGameboard]);

    const canSubmit = (selectedQuestions.size > 0 && selectedQuestions.size <= 10) && gameboardTitle != "" && isValidGameboardId(gameboardURL);

    const reorder = (result: DropResult) => {
        if (result.destination) {
            const [removed] = questionOrder.splice(result.source.index, 1);
            questionOrder.splice(result.destination.index, 0, removed);
        }
    };

    useEffect(() => {
        if (concepts && (!baseGameboardId)) {
            const params: { [key: string]: string } = {};
            params.concepts = concepts;
            if (userContext.stage !== STAGE.ALL) {
                params.stages = userContext.stage;
            }
            if (userContext.examBoard !== EXAM_BOARD.ALL) {
                params.examBoards = userContext.examBoard;
            }
            generateTemporaryGameboard(params).then((gameboardResponse) => {
                if (mutationSucceeded(gameboardResponse)) {
                    cloneGameboard(gameboardResponse.data);
                } else {
                    console.error(`Failed to create ${siteSpecific("question deck", "quiz")} from concepts.`);
                }
            });
        }
    }, [dispatch, concepts, baseGameboardId, cloneGameboard, generateTemporaryGameboard, userContext.examBoard, userContext.stage]);
    useEffect(() => {
        return history.block(() => {
            logEvent(eventLog, "LEAVE_GAMEBOARD_BUILDER", {});
            dispatch(logAction({type: "LEAVE_GAMEBOARD_BUILDER", events: eventLog}));
        });
    }, []);

    const pageHelp = <span>
        You can create custom question sets to assign to your groups. Search by question title or topic and add up to
        ten questions to a {siteSpecific("question deck", "quiz")}.
        <br/>
        You cannot modify a {siteSpecific("question deck", "quiz")} after it has been created. You&apos;ll find a
        link underneath any existing {siteSpecific("question deck", "quiz")} to duplicate and edit it.
    </span>;

    const sentinel = useRef<HTMLDivElement>(null);

    const resetBuilder = () => {
        if (baseGameboard) {
            cloneGameboard(baseGameboard);
        } else {
            initialise();
        }
        setTimeout(() => sentinel.current?.scrollIntoView(), 50);
    };

    const undoStack : GameboardBuilderQuestionsStackProps = new GameboardBuilderQuestionsStack({
        questionOrderStack: previousQuestionOrderStack,
        setQuestionOrderStack: setPreviousQuestionOrderStack,
        selectedQuestionsStack: previousSelectedQuestionsStack,
        setSelectedQuestionsStack: setPreviousSelectedQuestionsStack
    });
    const currentQuestions = {questionOrder, setQuestionOrder, selectedQuestions, setSelectedQuestions};
    const redoStack : GameboardBuilderQuestionsStackProps = new GameboardBuilderQuestionsStack({
        questionOrderStack: redoQuestionOrderStack,
        setQuestionOrderStack: setRedoQuestionOrderStack,
        selectedQuestionsStack: redoSelectedQuestionsStack,
        setSelectedQuestionsStack: setRedoSelectedQuestionsStack
    });

    return <Container id="gameboard-builder" fluid={siteSpecific(false, true)} className={classNames({"px-lg-5 px-xl-6": isAda})}>
        <div ref={sentinel}/>
        <TitleAndBreadcrumb currentPageTitle={`${siteSpecific("Question Deck", "Quiz")} builder`} icon={{type: "hex", icon: "icon-question-deck"}} help={pageHelp} modalId="help_modal_gameboard_builder"/>

        <Card className="p-3 mt-4 mb-5">
            <CardBody>
                <Row>
                    <Col>
                        <Label htmlFor="gameboard-builder-name">{siteSpecific("Question Deck", "Quiz")} title:</Label>
                        <Input id="gameboard-builder-name"
                            type="text"
                            placeholder={siteSpecific("e.g. Year 12 Dynamics", "e.g. Year 12 Network components")}
                            value={gameboardTitle}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                setGameboardTitle(e.target.value);
                            }}
                        />
                    </Col>
                </Row>

                {isStaff(user) && <Row className="mt-2">
                    <Col>
                        <Label htmlFor="gameboard-builder-tag-as">Tag as</Label>
                        <StyledSelect inputId="question-search-level"
                            isMulti
                            options={siteSpecific([
                                {value: 'ISAAC_BOARD', label: 'Created by Isaac'},
                            ], [
                                {value: 'ISAAC_BOARD', label: 'Created by Ada'},
                                {value: 'CONFIDENCE_RESEARCH_BOARD', label: 'Confidence research board'}
                            ])}
                            name="colors"
                            value={gameboardTags}
                            className="basic-multi-select"
                            classNamePrefix="select"
                            placeholder="None"
                            onChange={selectOnChange(setGameboardTags, false)}
                        />
                    </Col>
                    <Col>
                        <Label htmlFor="gameboard-builder-url">{siteSpecific("Question Deck", "Quiz")} ID</Label>
                        <Input id="gameboard-builder-url"
                            type="text"
                            placeholder="Optional"
                            value={gameboardURL ?? ""}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                setGameboardURL(e.target.value);
                            }}
                            invalid={!isValidGameboardId(gameboardURL)}
                        />
                    </Col>
                    <Col>
                        <Label htmlFor="gameboard-builder-wildcard">Wildcard</Label>
                        <Input id="gameboard-builder-wildcard"
                            type="select" value={wildcardId}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                setWildcardId(e.target.value);
                            }}
                        >
                            <option value="random">Random wildcard</option>
                            {isDefined(wildcards) && wildcards.map((wildcard) => {
                                return <option key={wildcard.id} value={wildcard.id}>{wildcard.title}</option>;
                            })}
                        </Input>
                    </Col>
                </Row>}

                <div className="my-4 responsive">
                    <DragDropContext onDragEnd={reorder}>
                        <Droppable droppableId="droppable">
                            {(providedDrop) => {
                                return (
                                    <Table bordered className="m-0" innerRef={providedDrop.innerRef}>
                                        <thead>
                                            <tr>
                                                <th className="w-5"/>
                                                <th className={siteSpecific("w-40", "w-30")}>Question title</th>
                                                <th className={siteSpecific("w-25", "w-20")}>Topic</th>
                                                <th className="w-15">Stage</th>
                                                <th className="w-15">Difficulty</th>
                                                {isAda && <th className="w-15">Exam boards</th>}
                                            </tr>
                                        </thead>
                                        {questionOrder.map((questionId, index: number) => {
                                            const question = selectedQuestions.get(questionId);
                                            return question && question.id && <Draggable key={question.id} draggableId={question.id} index={index}>
                                                {(providedDrag, snapshot) => {
                                                    return <tbody ref={providedDrag && providedDrag.innerRef} 
                                                        className={classNames({"table-row-dragging" : snapshot.isDragging})}
                                                        {...(providedDrag && providedDrag.draggableProps)} {...(providedDrag && providedDrag.dragHandleProps)}
                                                    >
                                                        <GameboardBuilderRow
                                                            provided={providedDrag}
                                                            snapshot={snapshot}
                                                            key={`gameboard-builder-row-${question.id}`}
                                                            question={question}
                                                            currentQuestions={currentQuestions}
                                                            undoStack={undoStack}
                                                            redoStack={redoStack}
                                                            creationContext={question.creationContext}
                                                        />
                                                    </tbody>;
                                                }}
                                            </Draggable>;
                                        })}
                                        <tbody >
                                            {providedDrop.placeholder}
                                            {selectedQuestions?.size === 0 && <tr>
                                                <td colSpan={20}>
                                                </td>
                                            </tr>}
                                        </tbody>
                                    </Table>
                                );
                            }}
                        </Droppable>
                    </DragDropContext>
                </div>

                <Row className="justify-content-center">
                    <Col className="col-auto col-md-2 order-1 d-flex justify-content-center">
                        {undoStack.length > 0 && <Button
                            className={classNames("my-2", siteSpecific("btn btn-keyline", "btn-sm"))}
                            color="primary" outline={isAda}
                            onClick={() => {
                                const newQuestion = undoStack.pop();
                                redoStack.push(currentQuestions);
                                currentQuestions.setQuestionOrder(newQuestion.questionOrder);
                                currentQuestions.setSelectedQuestions(newQuestion.selectedQuestions);
                            }}
                        >
                            Undo
                        </Button>}
                    </Col>
                    <Col className="col-auto col-md-2 order-2 order-md-4 d-flex justify-content-center">
                        {redoStack.length > 0 && <Button
                            className={classNames("my-2", siteSpecific("btn btn-keyline", "btn-sm"))}
                            color="primary" outline={isAda}
                            onClick={() => {
                                const newQuestion = redoStack.pop();
                                undoStack.push(currentQuestions);
                                currentQuestions.setQuestionOrder(newQuestion.questionOrder);
                                currentQuestions.setSelectedQuestions(newQuestion.selectedQuestions);
                            }}
                        >
                            Redo
                        </Button>}
                    </Col>
                    <div className="w-100 d-md-none"></div>
                    {/* Main two centre buttons: */}
                    <Col className="col-12 col-md-4 order-3 order-md-2 d-flex justify-content-center justify-content-md-end pb-2 pb-md-0">
                        <ShowLoading
                            placeholder={<div className="text-center"><IsaacSpinner/></div>}
                            until={!baseGameboardId || baseGameboard}
                        >
                            <Button
                                className={siteSpecific("btn btn-keyline d-flex align-items-center", "plus-button")}
                                color="primary" outline={isAda}
                                onClick={() => {
                                    logEvent(eventLog, "OPEN_SEARCH_MODAL", {});
                                    dispatch(openActiveModal({
                                        closeAction: () => {
                                            dispatch(closeActiveModal());
                                        },
                                        closeLabelOverride: "Cancel",
                                        size: "xl",
                                        title: "Search questions",
                                        body: <QuestionSearchModal
                                            currentQuestions={currentQuestions}
                                            undoStack={undoStack}
                                            redoStack={redoStack}
                                            eventLog={eventLog}
                                        />
                                    }));
                                }}
                            >
                                {siteSpecific("Add Questions", "Add questions")}
                                {siteSpecific(<img src={"/assets/phy/icons/redesign/plus.svg"} height={"12px"} className={"ms-2"} alt="" />,
                                    <img className={"plus-icon"} src={"/assets/cs/icons/add-circle-outline-pink.svg"} alt="" />)}
                            </Button>
                        </ShowLoading>
                    </Col>
                    <Col className="col-12 col-md-4 order-4 order-md-3 d-flex justify-content-center justify-content-md-start">
                        <Button
                            id="gameboard-save-button" disabled={!canSubmit} color="secondary"
                            aria-describedby="gameboard-help"
                            onClick={() => {
                                // TODO - refactor this onCLick into a named method; and use Tags service, not hardcoded subject tag list.
                                let wildcard = undefined;
                                if (wildcardId && isDefined(wildcards) && wildcards.length > 0) {
                                    wildcard = wildcards.filter((wildcard) => wildcard.id == wildcardId)[0];
                                }

                                let subjects = [];

                                if (isAda) {
                                    subjects.push("computer_science");
                                } else {
                                    const definedSubjects = [TAG_ID.physics, TAG_ID.maths, TAG_ID.chemistry, TAG_ID.biology];
                                    selectedQuestions?.forEach((item) => {
                                        const tags = intersection(definedSubjects, item.tags || []);
                                        tags.forEach((tag: string) => subjects.push(tag));
                                    });
                                    // If none of the questions have a subject tag, default to physics
                                    if (subjects.length === 0) {
                                        subjects.push(TAG_ID.physics);
                                    }
                                    subjects = Array.from(new Set(subjects));
                                }

                                createGameboard({
                                    gameboard: {
                                        id: gameboardURL,
                                        title: gameboardTitle,
                                        contents: questionOrder.map((questionId) => {
                                            const question = selectedQuestions.get(questionId);
                                            return question && convertContentSummaryToGameboardItem(question);
                                        }).filter((question) => question !== undefined) as GameboardItem[],
                                        wildCard: wildcard,
                                        wildCardPosition: 0,
                                        gameFilter: {subjects: subjects},
                                        tags: gameboardTags.map(getValue)
                                    },
                                    previousId: baseGameboardId
                                }).then(gameboardOrError => {
                                    const error = 'error' in gameboardOrError ? gameboardOrError.error : undefined;
                                    const gameboardId = 'data' in gameboardOrError ? gameboardOrError.data.id : undefined;
                                    dispatch(openActiveModal({
                                        closeAction: () => dispatch(closeActiveModal()),
                                        title: `${siteSpecific("Question Deck", "Quiz")} ${gameboardId ? "created" : "creation failed"}`,
                                        body: <GameboardCreatedModal resetBuilder={resetBuilder} gameboardId={gameboardId} error={error}/>,
                                    }));
                                });

                                logEvent(eventLog, "SAVE_GAMEBOARD", {});
                                dispatch(logAction({type: "SAVE_GAMEBOARD", events: eventLog}));
                            }}
                        >
                            {isWaitingForCreateGameboard ?
                                <Spinner size={"md"}/> : siteSpecific("Save Question Deck", "Save quiz")}
                        </Button>
                    </Col>
                </Row>

                {!canSubmit && <div
                    id="gameboard-help" color="light"
                    className={`text-center mb-0 pt-3 pb-0 ${selectedQuestions.size > 10 ? "text-danger" : ""}`}
                >
                    {siteSpecific("Question Decks", "Quizzes")} require both a title and between 1 and 10 questions.
                    {!isValidGameboardId(gameboardURL) && <div className="text-danger">
                        The {siteSpecific("question deck", "quiz")} ID should contain numbers, lowercase letters, underscores and hyphens only.<br/>
                        It should not be the full URL.
                    </div>}
                </div>}
            </CardBody>
        </Card>
    </Container>;
};
export default GameboardBuilder;
