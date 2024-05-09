import React, {ReactElement} from "react";
import * as ApiTypes from "./IsaacApiTypes";
import {
    AssignmentDTO,
    AudienceContext,
    AuthenticationProvider,
    ChoiceDTO,
    ContentBase,
    ContentSummaryDTO,
    Difficulty,
    GameboardDTO,
    GameboardItem,
    ItemDTO,
    QuestionDTO, QuestionValidationResponseDTO,
    QuizAttemptDTO,
    QuizFeedbackMode,
    ResultsWrapper,
    TestCaseDTO,
    UserContext,
} from "./IsaacApiTypes";
import {
    ACTION_TYPE,
    DOCUMENT_TYPE,
    EXAM_BOARD,
    MEMBERSHIP_STATUS,
    PROGRAMMING_LANGUAGE,
    SEARCH_RESULT_TYPE,
    SortOrder,
    STAGE,
    TAG_ID,
    TAG_LEVEL
} from "./app/services";
import {Immutable} from "immer";

export type Action =
    | {type: ACTION_TYPE.TEST_ACTION}

    | {type: ACTION_TYPE.USER_SNAPSHOT_PARTIAL_UPDATE; userSnapshot: UserSnapshot}

    | {type: ACTION_TYPE.CURRENT_USER_REQUEST}
    | {type: ACTION_TYPE.CURRENT_USER_RESPONSE_SUCCESS; user: Immutable<ApiTypes.RegisteredUserDTO>}
    | {type: ACTION_TYPE.CURRENT_USER_RESPONSE_FAILURE}
    | {type: ACTION_TYPE.USER_DETAILS_UPDATE_REQUEST}
    | {type: ACTION_TYPE.USER_DETAILS_UPDATE_RESPONSE_SUCCESS; user: Immutable<ApiTypes.RegisteredUserDTO>}
    | {type: ACTION_TYPE.USER_DETAILS_UPDATE_RESPONSE_FAILURE; errorMessage: string}
    | {type: ACTION_TYPE.USER_AUTH_SETTINGS_REQUEST}
    | {type: ACTION_TYPE.USER_AUTH_SETTINGS_RESPONSE_SUCCESS; userAuthSettings: ApiTypes.UserAuthenticationSettingsDTO}
    | {type: ACTION_TYPE.USER_AUTH_SETTINGS_RESPONSE_FAILURE; errorMessage: string}
    | {type: ACTION_TYPE.SELECTED_USER_AUTH_SETTINGS_REQUEST}
    | {type: ACTION_TYPE.SELECTED_USER_AUTH_SETTINGS_RESPONSE_SUCCESS; selectedUserAuthSettings: ApiTypes.UserAuthenticationSettingsDTO}
    | {type: ACTION_TYPE.SELECTED_USER_AUTH_SETTINGS_RESPONSE_FAILURE; errorMessage: string}
    | {type: ACTION_TYPE.USER_AUTH_LINK_REQUEST}
    | {type: ACTION_TYPE.USER_AUTH_LINK_RESPONSE_SUCCESS; provider: AuthenticationProvider; redirectUrl: string}
    | {type: ACTION_TYPE.USER_AUTH_LINK_RESPONSE_FAILURE; errorMessage: string}
    | {type: ACTION_TYPE.USER_AUTH_UNLINK_REQUEST}
    | {type: ACTION_TYPE.USER_AUTH_UNLINK_RESPONSE_SUCCESS; provider: AuthenticationProvider}
    | {type: ACTION_TYPE.USER_AUTH_UNLINK_RESPONSE_FAILURE; errorMessage: string}
    | {type: ACTION_TYPE.USER_AUTH_MFA_CHALLENGE_REQUIRED}
    | {type: ACTION_TYPE.USER_AUTH_MFA_CHALLENGE_REQUEST}
    | {type: ACTION_TYPE.USER_AUTH_MFA_CHALLENGE_SUCCESS}
    | {type: ACTION_TYPE.USER_AUTH_MFA_CHALLENGE_FAILURE; errorMessage: string}
    | {type: ACTION_TYPE.USER_PREFERENCES_REQUEST}
    | {type: ACTION_TYPE.USER_PREFERENCES_RESPONSE_SUCCESS; userPreferences: UserPreferencesDTO}
    | {type: ACTION_TYPE.USER_PREFERENCES_RESPONSE_FAILURE; errorMessage: string}

    | {type: ACTION_TYPE.USER_LOG_IN_REQUEST; provider: ApiTypes.AuthenticationProvider}
    | {type: ACTION_TYPE.USER_LOG_IN_RESPONSE_SUCCESS; user: Immutable<ApiTypes.RegisteredUserDTO>}
    | {type: ACTION_TYPE.USER_LOG_IN_RESPONSE_FAILURE; errorMessage: string}
    | {type: ACTION_TYPE.USER_INCOMING_PASSWORD_RESET_REQUEST}
    | {type: ACTION_TYPE.USER_INCOMING_PASSWORD_RESET_SUCCESS}
    | {type: ACTION_TYPE.USER_INCOMING_PASSWORD_RESET_FAILURE; errorMessage: string}
    | {type: ACTION_TYPE.USER_PASSWORD_RESET_REQUEST}
    | {type: ACTION_TYPE.USER_PASSWORD_RESET_RESPONSE_SUCCESS}
    | {type: ACTION_TYPE.USER_PASSWORD_RESET_RESPONSE_FAILURE; errorMessage: string}
    | {type: ACTION_TYPE.USER_LOG_OUT_REQUEST}
    | {type: ACTION_TYPE.USER_LOG_OUT_RESPONSE_SUCCESS}
    | {type: ACTION_TYPE.USER_LOG_OUT_EVERYWHERE_REQUEST}
    | {type: ACTION_TYPE.USER_LOG_OUT_EVERYWHERE_RESPONSE_SUCCESS}
    | {type: ACTION_TYPE.MY_PROGRESS_REQUEST}
    | {type: ACTION_TYPE.MY_PROGRESS_RESPONSE_SUCCESS; myProgress: UserProgress}
    | {type: ACTION_TYPE.MY_PROGRESS_RESPONSE_FAILURE}
    | {type: ACTION_TYPE.USER_PROGRESS_REQUEST}
    | {type: ACTION_TYPE.USER_PROGRESS_RESPONSE_SUCCESS; userProgress: UserProgress}
    | {type: ACTION_TYPE.USER_PROGRESS_RESPONSE_FAILURE}
    | {type: ACTION_TYPE.USER_SNAPSHOT_REQUEST}
    | {type: ACTION_TYPE.USER_SNAPSHOT_RESPONSE_SUCCESS; snapshot: UserSnapshot}
    | {type: ACTION_TYPE.USER_SNAPSHOT_RESPONSE_FAILURE}
    | {type: ACTION_TYPE.AUTHENTICATION_REQUEST_REDIRECT; provider: string}
    | {type: ACTION_TYPE.AUTHENTICATION_REDIRECT; provider: string; redirectUrl: string}
    | {type: ACTION_TYPE.AUTHENTICATION_HANDLE_CALLBACK}
    | {type: ACTION_TYPE.USER_CONSISTENCY_ERROR}

    | {type: ACTION_TYPE.GROUP_GET_MEMBERSHIPS_REQUEST}
    | {type: ACTION_TYPE.GROUP_GET_MEMBERSHIPS_RESPONSE_SUCCESS; groupMemberships: GroupMembershipDetailDTO[]}
    | {type: ACTION_TYPE.GROUP_GET_MEMBERSHIPS_RESPONSE_FAILURE}
    | {type: ACTION_TYPE.GROUP_CHANGE_MEMBERSHIP_STATUS_REQUEST}
    | {type: ACTION_TYPE.GROUP_CHANGE_MEMBERSHIP_STATUS_RESPONSE_SUCCESS; groupId: number; newStatus: MEMBERSHIP_STATUS}
    | {type: ACTION_TYPE.GROUP_CHANGE_MEMBERSHIP_STATUS_RESPONSE_FAILURE}

    | {type: ACTION_TYPE.NOTIFICATIONS_REQUEST}
    | {type: ACTION_TYPE.NOTIFICATIONS_RESPONSE_FAILURE}
    | {type: ACTION_TYPE.NOTIFICATIONS_RESPONSE_SUCCESS; notifications: any[]}

    | {type: ACTION_TYPE.DOCUMENT_REQUEST; documentType: DOCUMENT_TYPE; documentId: string}
    | {type: ACTION_TYPE.DOCUMENT_RESPONSE_SUCCESS; doc: ApiTypes.ContentDTO}
    | {type: ACTION_TYPE.DOCUMENT_RESPONSE_FAILURE}

    | {type: ACTION_TYPE.GLOSSARY_TERMS_REQUEST}
    | {type: ACTION_TYPE.GLOSSARY_TERMS_RESPONSE_SUCCESS; terms: ApiTypes.GlossaryTermDTO[]}
    | {type: ACTION_TYPE.GLOSSARY_TERMS_RESPONSE_FAILURE}

    | {type: ACTION_TYPE.QUESTION_REGISTRATION; questions: ApiTypes.QuestionDTO[]; accordionClientId?: string, isQuiz?: boolean}
    | {type: ACTION_TYPE.QUESTION_DEREGISTRATION; questionIds: string[]}
    | {type: ACTION_TYPE.QUESTION_ATTEMPT_REQUEST; questionId: string; attempt: Immutable<ApiTypes.ChoiceDTO>}
    | {type: ACTION_TYPE.QUESTION_ATTEMPT_RESPONSE_SUCCESS; questionId: string; response: ApiTypes.QuestionValidationResponseDTO}
    | {type: ACTION_TYPE.QUESTION_ATTEMPT_RESPONSE_FAILURE; questionId: string; lock?: Date}
    | {type: ACTION_TYPE.QUESTION_UNLOCK; questionId: string}
    | {type: ACTION_TYPE.QUESTION_SET_CURRENT_ATTEMPT; questionId: string; attempt: Immutable<ApiTypes.ChoiceDTO | ValidatedChoice<ApiTypes.ChoiceDTO>>}

    | {type: ACTION_TYPE.QUESTION_SEARCH_REQUEST}
    | {type: ACTION_TYPE.QUESTION_SEARCH_RESPONSE_SUCCESS; questionResults: ApiTypes.ResultsWrapper<ApiTypes.ContentSummaryDTO>}
    | {type: ACTION_TYPE.QUESTION_SEARCH_RESPONSE_FAILURE}

    | {type: ACTION_TYPE.MY_QUESTION_ANSWERS_BY_DATE_REQUEST}
    | {type: ACTION_TYPE.MY_QUESTION_ANSWERS_BY_DATE_RESPONSE_SUCCESS; myAnsweredQuestionsByDate: ApiTypes.AnsweredQuestionsByDate}
    | {type: ACTION_TYPE.MY_QUESTION_ANSWERS_BY_DATE_RESPONSE_FAILURE}

    | {type: ACTION_TYPE.USER_QUESTION_ANSWERS_BY_DATE_REQUEST}
    | {type: ACTION_TYPE.USER_QUESTION_ANSWERS_BY_DATE_RESPONSE_SUCCESS; userAnsweredQuestionsByDate: ApiTypes.AnsweredQuestionsByDate}
    | {type: ACTION_TYPE.USER_QUESTION_ANSWERS_BY_DATE_RESPONSE_FAILURE}

    | {type: ACTION_TYPE.QUIZ_SUBMISSION_REQUEST; quizId: string}
    | {type: ACTION_TYPE.QUIZ_SUBMISSION_RESPONSE_SUCCESS}
    | {type: ACTION_TYPE.QUIZ_SUBMISSION_RESPONSE_FAILURE}

    | {type: ACTION_TYPE.TEST_QUESTION_REQUEST}
    | {type: ACTION_TYPE.TEST_QUESTION_RESPONSE_SUCCESS; testCaseResponses: TestCaseDTO[]}
    | {type: ACTION_TYPE.TEST_QUESTION_RESPONSE_FAILURE}

    | {type: ACTION_TYPE.TOPIC_REQUEST; topicName: TAG_ID}
    | {type: ACTION_TYPE.TOPIC_RESPONSE_SUCCESS; topic: ApiTypes.IsaacTopicSummaryPageDTO}
    | {type: ACTION_TYPE.TOPIC_RESPONSE_FAILURE}

    | {type: ACTION_TYPE.SEARCH_REQUEST; query: string; types: string | undefined}
    | {type: ACTION_TYPE.SEARCH_RESPONSE_SUCCESS; searchResults: ApiTypes.ResultsWrapper<ApiTypes.ContentSummaryDTO>}

    | {type: ACTION_TYPE.TOASTS_SHOW; toast: Toast}
    | {type: ACTION_TYPE.TOASTS_HIDE; toastId: string}
    | {type: ACTION_TYPE.TOASTS_REMOVE; toastId: string}

    | {type: ACTION_TYPE.ACTIVE_MODAL_OPEN; activeModal: ActiveModal}
    | {type: ACTION_TYPE.ACTIVE_MODAL_CLOSE}

    | {type: ACTION_TYPE.GROUPS_MEMBERS_RESET_PASSWORD_REQUEST; member: AppGroupMembership}
    | {type: ACTION_TYPE.GROUPS_MEMBERS_RESET_PASSWORD_RESPONSE_SUCCESS; member: AppGroupMembership}
    | {type: ACTION_TYPE.GROUPS_MEMBERS_RESET_PASSWORD_RESPONSE_FAILURE; member: AppGroupMembership}

    | {type: ACTION_TYPE.CONCEPTS_REQUEST}
    | {type: ACTION_TYPE.CONCEPTS_RESPONSE_FAILURE}
    | {type: ACTION_TYPE.CONCEPTS_RESPONSE_SUCCESS; concepts: Concepts}

    | {type: ACTION_TYPE.QUIZ_LOAD_ASSIGNMENT_ATTEMPT_REQUEST; quizAssignmentId: number}
    | {type: ACTION_TYPE.QUIZ_START_FREE_ATTEMPT_REQUEST; quizId: string}
    | {type: ACTION_TYPE.QUIZ_LOAD_ATTEMPT_RESPONSE_SUCCESS; attempt: ApiTypes.QuizAttemptDTO}
    | {type: ACTION_TYPE.QUIZ_LOAD_ATTEMPT_RESPONSE_FAILURE; error: string}
    ;

export type NOT_FOUND_TYPE = 404;

export type ConfidenceType = "quick_question" | "question";

export interface IsaacQuestionProps<T extends QuestionDTO, R extends QuestionValidationResponseDTO = QuestionValidationResponseDTO> {
    doc: T;
    questionId: string;
    readonly?: boolean;
    validationResponse?: Immutable<R>;
}

export interface AppQuestionDTO extends ApiTypes.QuestionDTO {
    validationResponse?: Immutable<ApiTypes.QuestionValidationResponseDTO>;
    currentAttempt?: Immutable<ApiTypes.ChoiceDTO>;
    canSubmit?: boolean;
    locked?: Date;
    accordionClientId?: string;
}

export interface InlineQuestionDTO extends AppQuestionDTO {
    validationResponse?: Immutable<ApiTypes.InlineRegionValidationResponseDTO>;
}

export interface AppGroup extends ApiTypes.UserGroupDTO {
    members?: AppGroupMembership[];
}

export interface AppGroupMembership extends ApiTypes.UserSummaryWithGroupMembershipDTO {
    groupMembershipInformation: ApiTypes.GroupMembershipDTO;
}

export interface ShortcutResponse extends ContentSummaryDTO {
    terms?: string[];
    hash?: string;
}

export interface UserBetaFeaturePreferences {
    SCHEDULE_ASSIGNMENTS?: boolean;
}

export type UserEmailPreferences = {
    NEWS_AND_UPDATES?: boolean;
    ASSIGNMENTS?: boolean;
    EVENTS?: boolean;
}

export interface UserExamPreferences {
    [EXAM_BOARD.AQA]?: boolean;
    [EXAM_BOARD.OCR]?: boolean;
}

export interface SubjectInterests {
    CS_ALEVEL?: boolean;
    PHYSICS_GCSE?: boolean;
    PHYSICS_ALEVEL?: boolean;
    PHYSICS_UNI?: boolean;
    CHEMISTRY_ALEVEL?: boolean;
    CHEMISTRY_GCSE?: boolean;
    CHEMISTRY_UNI?: boolean;
    MATHS_GCSE?: boolean;
    MATHS_ALEVEL?: boolean;
    MATHS_UNI?: boolean;
    ENGINEERING_UNI?: boolean;
}

export type ProgrammingLanguage = {[pl in PROGRAMMING_LANGUAGE]?: boolean}

export interface BooleanNotation {
    ENG?: boolean;
    MATH?: boolean;
}

export interface DisplaySettings {
    HIDE_NON_AUDIENCE_CONTENT?: boolean;
    HIDE_QUESTION_ATTEMPTS?: boolean;
}

export interface UserPreferencesDTO {
    BETA_FEATURE?: UserBetaFeaturePreferences;
    EMAIL_PREFERENCE?: UserEmailPreferences | null;
    SUBJECT_INTEREST?: SubjectInterests;
    PROGRAMMING_LANGUAGE?: ProgrammingLanguage;
    BOOLEAN_NOTATION?: BooleanNotation;
    DISPLAY_SETTING?: DisplaySettings;
}

export interface ValidatedChoice<C extends ApiTypes.ChoiceDTO> {
    frontEndValidation: boolean;
    choice: C;
}

export function isValidatedChoice(choice: Immutable<ApiTypes.ChoiceDTO | ValidatedChoice<ApiTypes.ChoiceDTO>>): choice is Immutable<ValidatedChoice<ApiTypes.ChoiceDTO>> {
    return choice.hasOwnProperty("frontEndValidation");
}

export type LoggedInUser = {loggedIn: true} & ApiTypes.RegisteredUserDTO;
export type PotentialUser = LoggedInUser | {loggedIn: false; requesting?: boolean;};

export interface ValidationUser extends ApiTypes.RegisteredUserDTO {
    password: string | null;
}
export type LoggedInValidationUser = ValidationUser & {loggedIn: true}  | {loggedIn: false};

export interface GroupMembershipDetailDTO {
    group: ApiTypes.UserGroupDTO;
    membershipStatus: MEMBERSHIP_STATUS;
}

export interface AppGroupTokenDTO {
    token: string;
    ownerUserId: number;
    groupId: number;
}

export interface School {
    urn: string;
    name: string;
    postcode: string;
    closed: boolean;
    dataSource: string;
}

export interface Toast {
    color: string;
    title: string;
    body?: string;
    timeout?: number;
    closable?: boolean;
    buttons?: ReactElement[];

    // For internal use
    id?: string;
    showing?: boolean;
}

export interface ActiveModal {
    centered?: boolean;
    noPadding?: boolean;
    closeAction?: () => void;
    closeLabelOverride?: string;
    size?: string;
    title?: string;
    body: any;
    buttons?: any[];
    overflowVisible?: boolean;
}

export enum BoardOrder {
    "created" = "created",
    "-created" = "-created",
    "visited" = "visited",
    "-visited" = "-visited",
    "title" = "title",
    "-title" = "-title",
    "completion" = "completion",
    "-completion" = "-completion"
}

export enum AssignmentOrderType {
    Title = "Title",
    StartDate = "Start date",
    DueDate = "Due date"
}
export type AssignmentOrderSpec = {type: AssignmentOrderType; order: SortOrder};

export const AssignmentOrder = {
    titleAscending: {type: AssignmentOrderType.Title, order: SortOrder.ASC},
    titleDescending: {type: AssignmentOrderType.Title, order: SortOrder.DESC},
    startDateAscending: {type: AssignmentOrderType.StartDate, order: SortOrder.ASC},
    startDateDescending: {type: AssignmentOrderType.StartDate, order: SortOrder.DESC},
    dueDateAscending: {type: AssignmentOrderType.DueDate, order: SortOrder.ASC},
    dueDateDescending: {type: AssignmentOrderType.DueDate, order: SortOrder.DESC},
};

export type NumberOfBoards = number | "ALL";

export interface Boards {
    boards: GameboardDTO[];
    totalResults: number;
}

export type BoardAssignee = {groupId: number, groupName?: string; startDate?: Date | number};

export interface BoardAssignees {
    boardAssignees?: {[key: string]: BoardAssignee[]};
}

// Admin Content Errors:
export interface ContentErrorItem {
    listOfErrors: string[];
    partialContent: ApiTypes.Content;
    successfulIngest: boolean;
}

export interface ContentErrorsResponse {
    brokenFiles: number;
    currentLiveVersion: string;
    errorsList: ContentErrorItem[];
    failedFiles: number;
    totalErrors: number;
}

export interface AdminStatsResponse {
    activeUsersOverPrevious: any;
    answeredQuestionEvents: number;
    answeringUsersOverPrevious: any;
    userGenders: any;
    userRoles: any;
    userSchoolInfo: any;
    viewQuestionEvents: number;
    viewConceptEvents: number;
}

export interface ValidAssignmentWithListingDate extends AssignmentDTO {
    gameboardId: string;
    groupId: number;
    additionalManagerPrivileges: boolean;
    id: number;
    listingDate: Date;
}

export interface FigureNumbersById {[figureId: string]: number}
export const FigureNumberingContext = React.createContext<FigureNumbersById>({});
export const AccordionSectionContext = React.createContext<{id: string | undefined; clientId: string, open: boolean | null}>(
    {id: undefined, clientId: "unknown", open: /* null is a meaningful default state for IsaacVideo */ null}
);
export const QuestionContext = React.createContext<string | undefined>(undefined);
export const ClozeDropRegionContext = React.createContext<{
    register: (id: string, index: number) => void,
    questionPartId: string, readonly: boolean,
    inlineDropValueMap: {[p: string]: ClozeItemDTO},
    dropZoneValidationMap: {[p: string]: {correct?: boolean, itemId?: string} | undefined},
    shouldGetFocus: (id: string) => boolean
} | undefined>(undefined);

export const InlineContext = React.createContext<{
    docId?: string,
    elementToQuestionMap: {[elementId: string]: {questionId: string, type: string}},
    modifiedQuestionIds: string[],
    setModifiedQuestionIds: React.Dispatch<React.SetStateAction<string[]>>,
    isModifiedSinceLastSubmission: boolean,
    setIsModifiedSinceLastSubmission: React.Dispatch<React.SetStateAction<boolean>>,
    submitting: boolean,
    setSubmitting: React.Dispatch<React.SetStateAction<boolean>>,
    canShowWarningToast: boolean,
    feedbackIndex?: number,
    setFeedbackIndex: React.Dispatch<React.SetStateAction<number | undefined>>,
    focusSelection?: boolean,
    setFocusSelection: React.Dispatch<React.SetStateAction<boolean>>,
} | undefined>(undefined);
export const QuizAttemptContext = React.createContext<{quizAttempt: QuizAttemptDTO | null; questionNumbers: {[questionId: string]: number}}>({quizAttempt: null, questionNumbers: {}});
export const ExpandableParentContext = React.createContext<boolean>(false);
export const ConfidenceContext = React.createContext<{recordConfidence: boolean}>({recordConfidence: false});
export const AssignmentProgressPageSettingsContext = React.createContext<PageSettings>({colourBlind: false, formatAsPercentage: false, setColourBlind: () => {}, setFormatAsPercentage: () => {}, isTeacher: false, assignmentOrder: AssignmentOrder.startDateDescending});
export const GameboardContext = React.createContext<GameboardDTO | undefined>(undefined);
export const AssignmentScheduleContext = React.createContext<{
    boardsById: {[id: string]: GameboardDTO | undefined};
    groupsById: {[id: number]: AppGroup | undefined};
    groupFilter: {[id: number]: boolean};
    boardIdsByGroupId: {[id: number]: string[] | undefined};
    groups: AppGroup[];
    gameboards: GameboardDTO[];
    openAssignmentModal: (assignment: ValidAssignmentWithListingDate) => void;
    collapsed: boolean;
    setCollapsed: (b: boolean) => void;
    viewBy: "startDate" | "dueDate";
}>({boardsById: {}, groupsById: {}, groupFilter: {}, boardIdsByGroupId: {}, groups: [], gameboards: [], openAssignmentModal: () => {}, collapsed: false, setCollapsed: () => {}, viewBy: "startDate"});

export interface AppAssignmentProgress {
    user: ApiTypes.UserSummaryDTO;
    completed: boolean;
    correctPartResults: number[];
    incorrectPartResults: number[];
    results: ApiTypes.GameboardItemState[];

    tickCount: number;
    correctQuestionPartsCount: number;
    incorrectQuestionPartsCount: number;
    notAttemptedPartResults: number[];
}

export interface AugmentedEvent extends ApiTypes.IsaacEventPageDTO {
    isMultiDay?: boolean;
    hasExpired?: boolean;
    isWithinBookingDeadline?: boolean;
    isInProgress?: boolean;
    isATeacherEvent?: boolean;
    isAStudentEvent?: boolean;
    isVirtual?: boolean;
    isStudentOnly?: boolean;
    isRecurring?: boolean;
    isWaitingListOnly?: boolean;
    isReservationOnly?: boolean;
    isNotClosed?: boolean;
    isCancelled?: boolean;
    field?: "physics" | "maths";
}

export interface EventOverview {
    id?: string;
    title?: string;
    subtitle?: string;
    date?: Date;
    bookingDeadline?: Date;
    eventStatus?: ApiTypes.EventStatus;
    location?: ApiTypes.Location;
    numberOfConfirmedBookings: number;
    numberOfWaitingListBookings: number;
    numberAttended: number;
    numberAbsent: number;
    numberOfPlaces: number;
}

export interface AdditionalInformation {
    jobTitle?: string;
    yearGroup?: string;
    medicalRequirements?: string;
    accessibilityRequirements?: string;
    emergencyName?: string;
    emergencyNumber?: string;
    authorisation?: string;
    authorisationOther?: string;
    experienceLevel?: string;
}

export interface CredentialsAuthDTO {
    email: string;
    password: string;
    rememberMe: boolean;
}

export interface PaddedCredentialsAuthDTO extends CredentialsAuthDTO {
    _randomPadding: string;
}

export interface ZxcvbnResult {
    calc_time: number;
    crack_times_display: { [key: string]: string };
    crack_times_seconds: { [key: string]: number };
    feedback: { [key: string]: any };
    guesses: number;
    guesses_log10: number;
    password: string;
    score: number;
    sequence: any;
}

export interface PasswordFeedback {
    zxcvbn?: ZxcvbnResult;
    pwnedPasswordCount?: number;
    feedbackText: string;
}

export interface EmailUserRoles {
    ADMIN: boolean;
    EVENT_MANAGER: boolean;
    EVENT_LEADER: boolean;
    CONTENT_EDITOR: boolean;
    TEACHER: boolean;
    STUDENT: boolean;
}

export interface TemplateEmail {
    subject?: string;
    from?: string;
    fromName?: string;
    replyTo?: string;
    replyToName?: string;
    sender?: string;
    plainText?: string;
    html?: string;
}

export interface UserSchoolLookup {[userId: number]: School}

export interface QuestionSearchQuery {
    searchString?: string;
    tags?: string;
    subjects?: string;
    fields?: string;
    topics?: string;
    books?: string;
    levels?: string;
    stages?: string;
    difficulties?: string;
    examBoards?: string;
    fasttrack?: boolean;
    startIndex?: number;
    limit?: number;
}

export interface ContentSummary extends ContentSummaryDTO {
    creationContext?: AudienceContext;
}

export interface ViewingContext extends UserContext {
    difficulty?: Difficulty;
}

export interface StreakRecord {
    currentStreak?: number;
    largestStreak?: number;
    currentActivity?: number;
}

export interface AchievementsRecord {
    TEACHER_ASSIGNMENTS_SET?: number;
    TEACHER_CPD_EVENTS_ATTENDED?: number;
    TEACHER_GROUPS_CREATED?: number;
    TEACHER_BOOK_PAGES_SET?: number;
    TEACHER_GAMEBOARDS_CREATED?: number;
}

export interface UserSnapshot {
    dailyStreakRecord?: StreakRecord;
    weeklyStreakRecord?: StreakRecord;
    achievementsRecord?: AchievementsRecord;
}

export interface UserProgress {
    attemptsByLevel?: LevelAttempts<number>;
    correctByLevel?: LevelAttempts<number>;
    totalQuestionsAttempted?: number;
    totalQuestionsCorrect?: number;
    totalQuestionPartsCorrect?: number;
    totalQuestionPartsAttempted?: number;
    totalQuestionsCorrectThisAcademicYear?: number;
    totalQuestionsAttemptedThisAcademicYear?: number;
    totalQuestionPartsCorrectThisAcademicYear?: number;
    totalQuestionPartsAttemptedThisAcademicYear?: number;
    mostRecentQuestions?: ContentSummaryDTO[];
    oldestIncompleteQuestions?: ContentSummaryDTO[];
    attemptsByType?: { [type: string]: number };
    correctByType?: { [type: string]: number };
    attemptsByTag?: { [tag: string]: number };
    correctByTag?: { [tag: string]: number };
    attemptsByStageAndDifficulty?: { [stage: string]: {[difficulty: string]: number} };
    correctByStageAndDifficulty?: { [stage: string]: {[difficulty: string]: number} };
    userSnapshot?: UserSnapshot;
    userDetails?: ApiTypes.UserSummaryDTO;
}

export interface PrintingSettings {
    hintsEnabled: boolean;
}

export type Levels = 0 | 1 | 2 | 3 | 4 | 5 | 6

export type LevelAttempts<T> = { [level in Levels]?: T; }

interface TagInstruction {
    hidden?: boolean; comingSoonDate?: string; new?: boolean;
}

export interface BaseTag {
    id: TAG_ID;
    title: string;
    parent?: TAG_ID;
    comingSoonDate?: string;
    new?: boolean;
    hidden?: boolean;
    stageOverride?: {[s in STAGE]?: TagInstruction};
}

export interface Tag extends BaseTag {
    type: TAG_LEVEL;
    level: number;
}

export interface DocumentSubject {
    subjectId?: string;
}

export interface Choice extends ChoiceDTO {
    correct?: boolean;
    explanation?: ContentBase;
}

export interface FreeTextRule extends Choice {
    caseInsensitive?: boolean;
    allowsAnyOrder?: boolean;
    allowsExtraWords?: boolean;
    allowsMisspelling?: boolean;
}

export type Concepts = ResultsWrapper<ContentSummaryDTO>;

export type EnhancedGameboard = GameboardDTO & {
    contents: (GameboardItem & { questionPartsTotal: number })[];
};

export type EnhancedAssignment = AssignmentDTO & {
    id: number;
    gameboard: EnhancedGameboard;
};

export type EnhancedAssignmentWithProgress = EnhancedAssignment & {
    progress: AppAssignmentProgress[];
};

export interface PageSettings {
    colourBlind: boolean;
    setColourBlind: (newValue: boolean) => void;
    formatAsPercentage: boolean;
    setFormatAsPercentage: (newValue: boolean) => void;
    isTeacher: boolean;
    assignmentOrder?: AssignmentOrderSpec;
}

export interface GameboardBuilderQuestions {
    questionOrder: string[];
    setQuestionOrder: React.Dispatch<React.SetStateAction<string[]>>;
    selectedQuestions: Map<string, ContentSummary>;
    setSelectedQuestions: React.Dispatch<React.SetStateAction<Map<string, ContentSummary>>>
}

export interface GameboardBuilderQuestionsStackProps {
    push: ({questionOrder, selectedQuestions} : {questionOrder: string[], selectedQuestions: Map<string, ContentSummary>}) => void;
    pop: () => {questionOrder: string[], selectedQuestions: Map<string, ContentSummary>};
    length: number;
    clear: () => void;
}

export interface AppQuizAssignment extends ApiTypes.QuizAssignmentDTO {
    groupName: string;
}

export const QuizFeedbackModes: QuizFeedbackMode[] = ["NONE", "OVERALL_MARK", "SECTION_MARKS", "DETAILED_FEEDBACK"];

export interface ClozeItemDTO extends ItemDTO {
    replacementId?: string;
}

export interface NewsItemProps {
    subject: "news" | "physics";
    orderDecending?: boolean;
}

export interface SearchShortcut {
    id: string;
    title: string;
    terms: string[];
    summary: string;
    url: string;
    type: SEARCH_RESULT_TYPE;
    hash?: string;
}
