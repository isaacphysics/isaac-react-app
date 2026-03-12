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
import {
    Button,
    Card,
    CardBody,
    Col,
    Container,
    Form,
    FormFeedback,
    FormGroup,
    Input,
    Label,
    Row,
    Spinner,
    Table
} from "reactstrap";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {GameboardDTO, GameboardItem, RegisteredUserDTO} from "../../../IsaacApiTypes";
import {QuestionSearchModal} from "../elements/modals/QuestionSearchModal";
import {DragDropContext, Draggable, Droppable, DropResult} from "@hello-pangea/dnd";
import {GameboardCreatedModal} from "../elements/modals/GameboardCreatedModal";
import {
    convertContentSummaryToGameboardItem,
    EXAM_BOARD,
    GAMEBOARD_UNDO_STACK_SIZE_LIMIT,
    getValue,
    isAda,
    isDefined,
    isStaff,
    isValidGameboardId,
    Item,
    loadGameboardQuestionOrder,
    loadGameboardSelectedQuestions,
    logEvent, QUESTIONS_PER_GAMEBOARD,
    selectOnChange,
    siteSpecific,
    STAGE,
    TAG_ID,
    useUserViewingContext
} from "../../services";
import {useBlocker, useLocation} from "react-router-dom";
import queryString from "query-string";
import {ShowLoading} from "../handlers/ShowLoading";
import intersection from "lodash/intersection";
import {ContentSummary, GameboardBuilderQuestionsStackProps} from "../../../IsaacAppTypes";
import {IsaacSpinner} from "../handlers/IsaacSpinner";
import {skipToken} from "@reduxjs/toolkit/query";
import classNames from "classnames";
import {StyledSelect} from "../elements/inputs/StyledSelect";
import {ExigentAlert} from "../elements/ExigentAlert";
import { PageMetadata } from '../elements/PageMetadata';
import {IconButton} from "../elements/AffixButton";

const GameboardBuilderRow = lazy(() => import("../elements/GameboardBuilderRow"));

class GameboardBuilderQuestionsStack {
    questionOrderStack: string[][];
    setQuestionOrderStack: React.Dispatch<React.SetStateAction<string[][]>>;
    setSelectedQuestionsStack: React.Dispatch<React.SetStateAction<Map<string, ContentSummary>[]>>;
    selectedQuestionsStack: Map<string, ContentSummary>[];

    constructor(
        props: {
            questionOrderStack: string[][];
            setQuestionOrderStack: React.Dispatch<React.SetStateAction<string[][]>>;
            selectedQuestionsStack: Map<string, ContentSummary>[];
            setSelectedQuestionsStack: React.Dispatch<React.SetStateAction<Map<string, ContentSummary>[]>>;
        })
    {
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
    const [dirty, setDirty] = useState(false);

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
    const [submissionAttempted, setSubmissionAttempted] = useState(false);

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

    const submit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        setSubmissionAttempted(true);

        if (!allInputIsValid) {
            return;
        }

        setDirty(false);

        let wildcard = undefined;
        if (wildcardId && isDefined(wildcards) && wildcards.length > 0) {
            wildcard = wildcards.filter((wildcard) => wildcard.id === wildcardId)[0];
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

        void createGameboard({
            gameboard: {
                id: gameboardURL ? gameboardURL : undefined,
                title: gameboardTitle,
                contents: questionOrder.map((questionId) => {
                    const question = selectedQuestions.get(questionId);
                    return question && convertContentSummaryToGameboardItem(question);
                }).filter((question) => question !== undefined) as GameboardItem[],
                wildCard: wildcard,
                wildCardPosition: wildcard ? 0 : undefined,
                gameFilter: {subjects: subjects},
                tags: gameboardTags.map(getValue)
            },
            previousId: baseGameboardId
        }).then(gameboardOrError => {
            const error = 'error' in gameboardOrError ? gameboardOrError.error : undefined;
            const gameboardId = 'data' in gameboardOrError ? gameboardOrError.data.id : undefined;
            dispatch(openActiveModal({
                closeAction: () => dispatch(closeActiveModal()),
                title: `${siteSpecific("Question deck", "Quiz")} ${gameboardId ? "created" : "creation failed"}`,
                body: <GameboardCreatedModal resetBuilder={resetBuilder} gameboardId={gameboardId} error={error}/>,
            }));
            if (gameboardId) setSubmissionAttempted(false);
        });

        logEvent(eventLog, "SAVE_GAMEBOARD", {});
        await dispatch(logAction({type: "SAVE_GAMEBOARD", events: eventLog}));
    };

    useEffect(() => {
        if (baseGameboard) {
            cloneGameboard(baseGameboard);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [baseGameboard]);

    const titleIsValid = gameboardTitle != "";
    const tooFewQuestions = selectedQuestions.size == 0;
    const tooManyQuestions = selectedQuestions.size > QUESTIONS_PER_GAMEBOARD;
    const questionSetIsValid = !tooFewQuestions && !tooManyQuestions;
    const allInputIsValid = isValidGameboardId(gameboardURL) && titleIsValid && questionSetIsValid;

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
            if (!userContext.contexts.map(c => c.stage).includes(STAGE.ALL)) {
                params.stages = userContext.contexts[0].stage ?? "";
            }
            if (!userContext.contexts.map(c => c.examBoard).includes(EXAM_BOARD.ALL)) {
                params.examBoards = userContext.contexts[0].examBoard ?? "";
            }
            void generateTemporaryGameboard(params).then((gameboardResponse) => {
                if (mutationSucceeded(gameboardResponse)) {
                    cloneGameboard(gameboardResponse.data);
                } else {
                    console.error(`Failed to create ${siteSpecific("question deck", "quiz")} from concepts.`);
                }
            });
        }
    }, [dispatch, concepts, baseGameboardId, cloneGameboard, generateTemporaryGameboard, userContext.contexts]);

    const blocker = useBlocker(
        useCallback(() => dirty, [dirty]),
    );

    useEffect(() => {
        if (blocker.state === "blocked") {
            if (window.confirm("You have unsaved changes - are you sure you want to leave this page?")) {
                logEvent(eventLog, "LEAVE_GAMEBOARD_BUILDER", {});
                void dispatch(logAction({type: "LEAVE_GAMEBOARD_BUILDER", events: eventLog}));
                blocker.proceed?.();
            } else {
                blocker.reset?.();
            }
        }
    }, [blocker, dispatch, eventLog]);

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
    const canUndo = !!undoStack.length;
    const canRedo = !!redoStack.length;

    useEffect(() => {
        setDirty(canUndo);
    }, [canUndo]);

    const undoButtonProps = {
        color: "keyline",
        "aria-label": "Undo last action",
        title: "Undo last action",
        onClick: () => {
            const newQuestion = undoStack.pop();
            redoStack.push(currentQuestions);
            currentQuestions.setQuestionOrder(newQuestion.questionOrder);
            currentQuestions.setSelectedQuestions(newQuestion.selectedQuestions);
        }
    };

    const redoButtonProps = {
        color: "keyline",
        "aria-label": "Redo last action",
        title: "Redo last action",
        onClick: () => {
            const newQuestion = redoStack.pop();
            undoStack.push(currentQuestions);
            currentQuestions.setQuestionOrder(newQuestion.questionOrder);
            currentQuestions.setSelectedQuestions(newQuestion.selectedQuestions);
        }
    };

    return <Container id="gameboard-builder">
        <div ref={sentinel}/>
        <TitleAndBreadcrumb currentPageTitle={`${siteSpecific("Question deck", "Quiz")} builder`} icon={{type: "icon", icon: "icon-question-deck"}} help={pageHelp} />
        <PageMetadata helpModalId="help_modal_gameboard_builder" />
        <Card className="p-3 mt-4 mb-7">
            <CardBody>
                {submissionAttempted && !allInputIsValid  &&
                    <ExigentAlert color={"warning"}>
                        <p className={"fw-bold alert-heading"}>Unable to create {siteSpecific("question deck", "quiz")}</p>
                        <p>Please correct the problems below.</p>
                    </ExigentAlert>
                }
                <Form onSubmit={submit}>
                    <Row>
                        <Col>
                            <Label className={"fw-bold form-required"} htmlFor="gameboard-builder-name">Title</Label>
                            <p className="d-block input-description mb-2">
                                This will be visible to your students.
                            </p>
                            <FormGroup>
                                <Input id="gameboard-builder-name"
                                    type="text"
                                    placeholder={siteSpecific("e.g. Year 12 Dynamics", "e.g. Year 12 Network components")}
                                    value={gameboardTitle}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                        setGameboardTitle(e.target.value);
                                    }}
                                    invalid={submissionAttempted && !titleIsValid}
                                />
                                <FormFeedback>
                                    Please provide a title.
                                </FormFeedback>
                            </FormGroup>
                        </Col>
                    </Row>

                    {isStaff(user) && <Row className="mt-2">
                        <Col>
                            <Label htmlFor="gameboard-builder-tag-as" className={"fw-bold form-optional"}>Tag as</Label>
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
                                placeholder="None"
                                onChange={selectOnChange(setGameboardTags, false)}
                            />
                        </Col>
                        <Col>
                            <FormGroup>
                                <Label htmlFor="gameboard-builder-url"
                                    className={"fw-bold form-optional"}>{siteSpecific("Question deck", "Quiz")} ID</Label>
                                <Input id="gameboard-builder-url"
                                    type="text"
                                    placeholder="Optional"
                                    value={gameboardURL ?? ""}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                        setGameboardURL(e.target.value);
                                    }}
                                    invalid={!isValidGameboardId(gameboardURL)}
                                />
                                <FormFeedback>
                                    The ID may only contain lowercase letters, numbers, dashes and underscores.
                                </FormFeedback>
                            </FormGroup>
                        </Col>
                        <Col>
                            <Label htmlFor="gameboard-builder-wildcard" className={"fw-bold"}>Wildcard</Label>
                            <Input id="gameboard-builder-wildcard"
                                type="select" value={wildcardId}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                    setWildcardId(e.target.value);
                                }}
                            >
                                <option value="">No wildcard</option>
                                {isDefined(wildcards) && wildcards.map((wildcard) => {
                                    return <option key={wildcard.id} value={wildcard.id}>{wildcard.title}</option>;
                                })}
                            </Input>
                        </Col>
                    </Row>}

                    <div className={"d-flex flex-row justify-content-between align-items-center"}>
                        <div>
                            <span className={classNames("fw-bold form-required")}>Questions</span>
                            <p className={classNames("d-none d-sm-block input-description mb-2")}>
                                You can add up to {QUESTIONS_PER_GAMEBOARD} questions.
                            </p>
                        </div>
                        <div className={"d-flex flex-row gap-2"}>
                            <IconButton icon="icon-undo" className="icon-button-sm action-button outline" {...undoButtonProps} disabled={!canUndo}/>
                            <IconButton icon="icon-redo" className="icon-button-sm action-button outline" {...redoButtonProps} disabled={!canRedo}/>
                        </div>
                    </div>

                    <div className={classNames({"is-invalid": submissionAttempted && !questionSetIsValid}, "mt-2 responsive vertical-scroll-shadow")}>
                        <DragDropContext onDragEnd={reorder}>
                            <Droppable droppableId="droppable">
                                {(providedDrop) => {
                                    return (
                                        <Table className={"mb-0"} id={"gameboard-builder-questions"} bordered
                                            innerRef={providedDrop.innerRef}>
                                            <thead>
                                                <tr className="border-top-0">
                                                    <th className="w-5">{isAda && selectedQuestions.size > 0 && "Remove"}</th>
                                                    <th className={siteSpecific("w-40", "w-30")}>Question title</th>
                                                    <th className={siteSpecific("w-25", "w-20")}>Topic</th>
                                                    <th className="w-15">Stage</th>
                                                    <th className="w-15">Difficulty</th>
                                                    {isAda && <th className="w-15">Exam boards</th>}
                                                </tr>
                                            </thead>
                                            {questionOrder.map((questionId, index: number) => {
                                                const question = selectedQuestions.get(questionId);
                                                return question && question.id &&
                                                        <Draggable key={question.id} draggableId={question.id}
                                                            index={index}>
                                                            {(providedDrag, snapshot) => {
                                                                return <tbody
                                                                    ref={providedDrag && providedDrag.innerRef}
                                                                    className={classNames({"table-row-dragging": snapshot.isDragging})}
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
                                            <tbody>
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
                    <div className={"invalid-feedback"}>
                        {`${tooManyQuestions ? `Only ${QUESTIONS_PER_GAMEBOARD} questions can be added, please remove some.` : "Please add some questions."}`}
                    </div>
                    <div className="d-flex flex-column flex-md-row justify-content-end gap-2 mt-3">
                        <ShowLoading
                            placeholder={<div className="text-center"><IsaacSpinner/></div>}
                            until={!baseGameboardId || baseGameboard}
                        >
                            <Button
                                className={classNames("w-100 w-md-auto d-flex align-items-center justify-content-center", {"plus-button": isAda})}
                                color="keyline"
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
                                Add questions <i className={classNames("icon ms-2", siteSpecific("icon-plus icon-color-black-hoverable", "icon-sm icon-add-circle"))}/>
                            </Button>
                        </ShowLoading>
                        <Button
                            className={"w-100 w-md-auto"}
                            id="gameboard-save-button" color="secondary"
                            aria-describedby="gameboard-help"
                            type={"submit"}
                        >
                            {isWaitingForCreateGameboard ?
                                <Spinner size={"md"}/> : siteSpecific("Save question deck", "Save quiz")}
                        </Button>
                    </div>
                </Form>
            </CardBody>
        </Card>
    </Container>;
};
export default GameboardBuilder;
