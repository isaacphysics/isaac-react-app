import React, {lazy, useCallback, useEffect, useRef, useState} from 'react';
import {
    closeActiveModal,
    logAction,
    openActiveModal,
    saveGameboard,
    useAppDispatch,
    useCreateGameboardMutation,
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
} from "reactstrap";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {GameboardDTO, GameboardItem, RegisteredUserDTO} from "../../../IsaacApiTypes";
import {QuestionSearchModal} from "../elements/modals/QuestionSearchModal";
import {DropResult} from "@hello-pangea/dnd";
import {GameboardCreatedModal} from "../elements/modals/GameboardCreatedModal";
import {
    convertContentSummaryToGameboardItem,
    GAMEBOARD_UNDO_STACK_SIZE_LIMIT,
    getValue,
    handleBuilderRowChange,
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
    TAG_ID,
    useDeviceSize,
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
import { ListView } from '../elements/list-groups/ListView';
import { Trans, useTranslation } from "react-i18next";
import i18next from "i18next";

const DraggableListViewContainer = lazy(() => import('../elements/DraggableListViewContainer'));

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
    const { t } = useTranslation();
    const {search} = useLocation();
    const queryParams = search && queryString.parse(search);
    const baseGameboardId = queryParams && queryParams.base as string;

    const dispatch = useAppDispatch();
    const deviceSize = useDeviceSize();
    const {data: wildcards} = useGetWildcardsQuery();
    const {data: baseGameboard} = useGetGameboardByIdQuery(baseGameboardId || skipToken);
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
        setGameboardTitle(gameboard.title ? i18next.t("common:gameboard.clone.copiedTitle", { gameboardTitle: gameboard.title }) : "");
        setQuestionOrder(loadGameboardQuestionOrder(gameboard) || []);
        setSelectedQuestions(loadGameboardSelectedQuestions(gameboard) || new Map<string, ContentSummary>());
        setWildcardId(isStaff(user) && gameboard.wildCard && gameboard.wildCard.id || undefined);
        logEvent(eventLog, "CLONE_GAMEBOARD", {gameboardId: gameboard.id});
    }, [setGameboardTitle, setQuestionOrder, setSelectedQuestions, setWildcardId, eventLog, user]);

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
            if (gameboardId) {
                setSubmissionAttempted(false);
                void dispatch(saveGameboard({
                    boardId: gameboardId ?? "",
                    user: {...user, loggedIn: true},
                }));
            }
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
            const newQuestionOrder = [...questionOrder];
            const [removed] = newQuestionOrder.splice(result.source.index, 1);
            newQuestionOrder.splice(result.destination.index, 0, removed);
            setQuestionOrder(newQuestionOrder);
        }
    };

    const blocker = useBlocker(
        useCallback(() => dirty, [dirty]),
    );

    useEffect(() => {
        if (blocker.state === "blocked") {
            if (window.confirm(i18next.t("common:gameboard.builder.leaveConfirm"))) {
                logEvent(eventLog, "LEAVE_GAMEBOARD_BUILDER", {});
                void dispatch(logAction({type: "LEAVE_GAMEBOARD_BUILDER", events: eventLog}));
                blocker.proceed?.();
            } else {
                blocker.reset?.();
            }
        }
    }, [blocker, dispatch, eventLog]);

    const pageHelp = <span>
        <Trans i18nKey="site:gameboard.builder.helpText" components={{ br: <br /> }} />
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
        "aria-label": t("common:gameboard.builder.undoLabel"),
        title: t("common:gameboard.builder.undoLabel"),
        onClick: () => {
            const newQuestion = undoStack.pop();
            redoStack.push(currentQuestions);
            currentQuestions.setQuestionOrder(newQuestion.questionOrder);
            currentQuestions.setSelectedQuestions(newQuestion.selectedQuestions);
        }
    };

    const redoButtonProps = {
        color: "keyline",
        "aria-label": t("common:gameboard.builder.redoLabel"),
        title: t("common:gameboard.builder.redoLabel"),
        onClick: () => {
            const newQuestion = redoStack.pop();
            undoStack.push(currentQuestions);
            currentQuestions.setQuestionOrder(newQuestion.questionOrder);
            currentQuestions.setSelectedQuestions(newQuestion.selectedQuestions);
        }
    };

    return <Container id="gameboard-builder">
        <div ref={sentinel}/>
        <TitleAndBreadcrumb currentPageTitle={t("site:gameboard.builder.pageTitle")} icon={{type: "icon", icon: "icon-question-deck"}} help={pageHelp} />
        <PageMetadata helpModalId="help_modal_gameboard_builder" />
        <Card className="p-3 mt-4 mb-7">
            <CardBody>
                {submissionAttempted && !allInputIsValid  &&
                    <ExigentAlert color={"warning"}>
                        <p className={"fw-bold alert-heading"}>{t("site:gameboard.builder.createError")}</p>
                        <p>{t("common:gameboard.builder.createErrorDetail")}</p>
                    </ExigentAlert>
                }
                <Form onSubmit={submit}>
                    <Row>
                        <Col>
                            <Label className={"fw-bold form-required"} htmlFor="gameboard-builder-name">{t("common:gameboard.builder.titleLabel")}</Label>
                            <p className="d-block input-description mb-2">
                                {t("common:gameboard.builder.titleHelp")}
                            </p>
                            <FormGroup>
                                <Input id="gameboard-builder-name"
                                    type="text"
                                    placeholder={t("site:gameboard.builder.titlePlaceholder")}
                                    value={gameboardTitle}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                        setGameboardTitle(e.target.value);
                                    }}
                                    invalid={submissionAttempted && !titleIsValid}
                                />
                                <FormFeedback>
                                    {t("common:gameboard.builder.titleError")}
                                </FormFeedback>
                            </FormGroup>
                        </Col>
                    </Row>

                    {isStaff(user) && <Row className="mt-2 align-items-end">
                        <Col xs={6} sm={4}>
                            <FormGroup>
                                <Label htmlFor="gameboard-builder-tag-as" className={"fw-bold form-optional"}>{t("common:gameboard.builder.tagLabel")}</Label>
                                <StyledSelect inputId="gameboard-builder-tag-as"
                                    isMulti
                                    options={siteSpecific([
                                        {value: 'ISAAC_BOARD', label: t("sci:gameboard.builder.tagCreatedIsaac")},
                                    ], [
                                        {value: 'ISAAC_BOARD', label: t("ada:gameboard.builder.tagCreatedAda")},
                                        {value: 'CONFIDENCE_RESEARCH_BOARD', label: t("ada:gameboard.builder.tagConfidenceResearch")}
                                    ])}
                                    name="colors"
                                    value={gameboardTags}
                                    placeholder={t("common:gameboard.builder.tagPlaceholder")}
                                    onChange={selectOnChange(setGameboardTags, false)}
                                />
                            </FormGroup>
                        </Col>
                        <Col xs={6} sm={4}>
                            <FormGroup>
                                <Label htmlFor="gameboard-builder-url"
                                    className={"fw-bold form-optional"}>{t("site:gameboard.builder.idLabel")}</Label>
                                <Input id="gameboard-builder-url"
                                    type="text"
                                    placeholder={t("common:gameboard.builder.idPlaceholder")}
                                    value={gameboardURL ?? ""}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                        setGameboardURL(e.target.value);
                                    }}
                                    invalid={!isValidGameboardId(gameboardURL)}
                                />
                                <FormFeedback>
                                    {t("common:gameboard.builder.idError")}
                                </FormFeedback>
                            </FormGroup>
                        </Col>
                        <Col xs={12} sm={4}>
                            <FormGroup>
                                <Label htmlFor="gameboard-builder-wildcard" className={"fw-bold"}>{t("common:gameboard.builder.wildcardLabel")}</Label>
                                <Input id="gameboard-builder-wildcard"
                                    type="select" value={wildcardId}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                        setWildcardId(e.target.value);
                                    }}
                                >
                                    <option value="">{t("common:gameboard.builder.wildcardNone")}</option>
                                    {isDefined(wildcards) && wildcards.map((wildcard) => {
                                        return <option key={wildcard.id} value={wildcard.id}>{wildcard.title}</option>;
                                    })}
                                </Input>
                            </FormGroup>
                        </Col>
                    </Row>}

                    <div className={"d-flex flex-row justify-content-between align-items-center mb-2"}>
                        <div>
                            <span className="fw-bold form-required">{t("common:gameboard.builder.questionsHeading")}</span>
                            <p className="d-none d-sm-block input-description mb-0">
                                {t("common:gameboard.builder.questionsLimit", { maxQuestions: QUESTIONS_PER_GAMEBOARD })}
                            </p>
                        </div>
                        <div className={"d-flex flex-row gap-2"}>
                            <IconButton icon="icon-undo" className="icon-button-sm action-button outline" {...undoButtonProps} disabled={!canUndo}/>
                            <IconButton icon="icon-redo" className="icon-button-sm action-button outline" {...redoButtonProps} disabled={!canRedo}/>
                        </div>
                    </div>

                    <div className={classNames({"is-invalid": submissionAttempted && !questionSetIsValid}, "p-1 m-n1 mt-2 gameboard-builder-container vertical-scroll-shadow")}>
                        <DraggableListViewContainer reorder={reorder}>
                            {/* dragging here can be a little choppy on local development if browser cache is disabled! */}
                            <ListView 
                                id="gameboard-builder-questions"
                                className={classNames({"mw-max-content": deviceSize === "xs"})}
                                type="builder"
                                style="flat"
                                items={questionOrder.map((questionId) => selectedQuestions.get(questionId)).filter(isDefined)}
                                totalItems={questionOrder.length}
                                onMove={(id, adjustment) => {
                                    const index = currentQuestions.questionOrder.findIndex(qId => qId === id);
                                    if (index === -1) return;
                                    if (index + adjustment < 0 || index + adjustment >= currentQuestions.questionOrder.length) return;
                                    const newQuestionOrder = [...currentQuestions.questionOrder];
                                    const [removed] = newQuestionOrder.splice(index, 1);
                                    newQuestionOrder.splice(index + adjustment, 0, removed);
                                    currentQuestions.setQuestionOrder(newQuestionOrder);
                                }}
                                onDelete={(id) => {
                                    const question= selectedQuestions.get(id);
                                    if (question) {
                                        handleBuilderRowChange({ isDnd: true, question, currentQuestions, undoStack, redoStack, creationContext: question.creationContext });
                                    }
                                }}
                                allowBookmarking
                            />
                        </DraggableListViewContainer>
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
                                        closeLabelOverride: t("common:gameboard.builder.cancelButton"),
                                        size: "xl",
                                        title: t("common:gameboard.builder.searchTitle"),
                                        body: <QuestionSearchModal
                                            currentQuestions={currentQuestions}
                                            undoStack={undoStack}
                                            redoStack={redoStack}
                                            eventLog={eventLog}
                                        />
                                    }));
                                }}
                            >
                                {t("common:gameboard.builder.addQuestionsButton")} <i className={classNames("icon ms-2", siteSpecific("icon-plus icon-color-black-hoverable", "icon-sm icon-add-circle"))}/>
                            </Button>
                        </ShowLoading>
                        <Button
                            className={"w-100 w-md-auto"}
                            id="gameboard-save-button" color="secondary"
                            aria-describedby="gameboard-help"
                            type={"submit"}
                        >
                            {isWaitingForCreateGameboard ?
                                <Spinner size={"md"}/> : t("site:gameboard.builder.saveButton")}
                        </Button>
                    </div>
                </Form>
            </CardBody>
        </Card>
    </Container>;
};
export default GameboardBuilder;
