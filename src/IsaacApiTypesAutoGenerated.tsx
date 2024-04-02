/* tslint:disable */
/* eslint-disable */
// Generated using typescript-generator version 3.2.1263 on 2024-03-28 16:04:36.

export interface AssignmentDTO extends IAssignmentLike {
  gameboardId?: string;
  gameboard?: GameboardDTO;
  groupName?: string;
  notes?: string;
  assignerSummary?: UserSummaryDTO;
  scheduledStartDate?: EpochTimeStamp;
  /**
   * @deprecated
   */
  _id?: number;
}

export interface AssignmentStatusDTO {
  groupId?: number;
  assignmentId?: number;
  errorMessage?: string;
}

export interface ContentEmailDTO {
  userIds?: number[];
  emailTemplate?: EmailTemplateDTO;
}

export interface FormulaValidationResponseDTO extends QuestionValidationResponseDTO {
  correctExact?: boolean;
  correctSymbolic?: boolean;
  correctNumeric?: boolean;
}

export interface GameboardDTO extends HasTitleOrId {
  contents?: GameboardItem[];
  wildCard?: IsaacWildcard;
  wildCardPosition?: number;
  creationDate?: EpochTimeStamp;
  gameFilter?: GameFilter;
  ownerUserId?: number;
  ownerUserInformation?: UserSummaryDTO;
  tags?: string[];
  creationMethod?: GameboardCreationMethod;
  percentageCompleted?: number;
  lastVisited?: EpochTimeStamp;
  startedQuestion?: boolean;
  savedToCurrentUser?: boolean;
}

export interface GameboardListDTO extends ResultsWrapper<GameboardDTO> {
  results?: GameboardDTO[];
  totalNotStarted?: number;
  totalInProgress?: number;
  totalCompleted?: number;
}

export interface GameboardProgressSummaryDTO {
  assignmentId?: number;
  gameboardId?: string;
  gameboardTitle?: string;
  dueDate?: EpochTimeStamp;
  creationDate?: EpochTimeStamp;
  questionPartsCorrect?: number;
  questionPartsIncorrect?: number;
  questionPartsNotAttempted?: number;
  questionPartsTotal?: number;
  passMark?: number;
  questionPagesPerfect?: number;
  questionPagesTotal?: number;
}

export interface IsaacAnvilQuestionDTO extends IsaacQuestionBaseDTO {
  anvilApp?: AnvilAppDTO;
}

export interface IsaacCardDTO extends ContentDTO {
  image?: ImageDTO;
  clickUrl?: string;
  buttonText?: string;
  disabled?: boolean;
  verticalContent?: boolean;
}

export interface IsaacCardDeckDTO extends ContentDTO {
  cards?: IsaacCardDTO[];
}

export interface IsaacClozeQuestionDTO extends IsaacItemQuestionDTO {
  withReplacement?: boolean;
}

export interface IsaacConceptPageDTO extends SeguePageDTO {
}

export interface IsaacEventPageDTO extends ContentDTO {
  date?: EpochTimeStamp;
  bookingDeadline?: EpochTimeStamp;
  prepWorkDeadline?: EpochTimeStamp;
  location?: Location;
  eventThumbnail?: ImageDTO;
  numberOfPlaces?: number;
  groupReservationLimit?: number;
  allowGroupReservations?: boolean;
  privateEvent?: boolean;
  hub?: Hub;
  endDate?: EpochTimeStamp;
  eventStatus?: EventStatus;
  userBookingStatus?: BookingStatus;
  placesAvailable?: number;
  end_date?: EpochTimeStamp;
  preResources?: ExternalReference[];
  postResources?: ExternalReference[];
  EventStatus?: EventStatus;
}

export interface IsaacFeaturedProfileDTO extends ContentDTO {
  emailAddress?: string;
  image?: ImageDTO;
  homepage?: string;
  src?: string;
  altText?: string;
}

export interface IsaacFreeTextQuestionDTO extends IsaacQuestionBaseDTO {
}

export interface IsaacItemQuestionDTO extends IsaacQuestionBaseDTO {
  items?: ItemDTO[];
}

export interface IsaacMultiChoiceQuestionDTO extends IsaacQuestionBaseDTO {
  choices?: ChoiceDTO[];
}

export interface IsaacNumericQuestionDTO extends IsaacQuestionBaseDTO {
  requireUnits?: boolean;
  disregardSignificantFigures?: boolean;
  availableUnits?: string[];
  displayUnit?: string;
  knownUnits?: string[];
}

export interface IsaacPageFragmentDTO extends ContentDTO {
  summary?: string;
}

export interface IsaacParsonsQuestionDTO extends IsaacItemQuestionDTO {
  disableIndentation?: boolean;
}

export interface IsaacPodDTO extends ContentDTO {
  image?: ImageDTO;
  url?: string;
}

export interface IsaacQuestionBaseDTO extends ChoiceQuestionDTO {
}

export interface IsaacQuestionPageDTO extends SeguePageDTO {
  difficulty?: Difficulty;
  passMark?: number;
  supersededBy?: string;
}

export interface IsaacQuickQuestionDTO extends IsaacQuestionBaseDTO {
  answer?: ContentBaseDTO;
  showConfidence?: boolean;
}

export interface IsaacQuizDTO extends SeguePageDTO, HasTitleOrId {
  /**
   * @deprecated
   */
  visibleToStudents?: boolean;
  hiddenFromRoles?: string[];
  defaultFeedbackMode?: QuizFeedbackMode;
  rubric?: ContentDTO;
  total?: number;
  sectionTotals?: { [index: string]: number };
  individualFeedback?: QuizFeedbackDTO;
}

export interface IsaacQuizSectionDTO extends SeguePageDTO {
}

export interface IsaacRegexMatchQuestionDTO extends IsaacQuestionBaseDTO {
  multiLineEntry?: boolean;
}

export interface IsaacReorderQuestionDTO extends IsaacItemQuestionDTO {
}

export interface IsaacStringMatchQuestionDTO extends IsaacQuestionBaseDTO {
  multiLineEntry?: boolean;
  preserveLeadingWhitespace?: boolean;
  preserveTrailingWhitespace?: boolean;
}

export interface IsaacSymbolicLogicQuestionDTO extends IsaacSymbolicQuestionDTO {
}

export interface IsaacSymbolicQuestionDTO extends IsaacQuestionBaseDTO {
  formulaSeed?: string;
  availableSymbols?: string[];
}

export interface IsaacTopicSummaryPageDTO extends SeguePageDTO {
  linkedGameboards?: GameboardDTO[];
}

export interface IsaacWildcardDTO extends ContentDTO {
  description?: string;
  url?: string;
  src?: string;
  altText?: string;
  emailAddress?: string;
  image?: Image;
}

export interface ItemValidationResponseDTO extends QuestionValidationResponseDTO {
  itemsCorrect?: boolean[];
}

export interface LocalAuthDTO {
  email?: string;
  password?: string;
  rememberMe?: boolean;
  _randomPadding?: string;
}

export interface MFAResponseDTO {
  mfaVerificationCode?: string;
  rememberMe?: boolean;
}

export interface MisuseStatisticDTO {
  agentIdentifier?: string;
  eventType?: string;
  isMisused?: boolean;
  isOverSoftThreshold?: boolean;
  lastEventTimestamp?: EpochTimeStamp;
  currentCounter?: number;
}

export interface QuantityValidationResponseDTO extends QuestionValidationResponseDTO {
  correctValue?: boolean;
  correctUnits?: boolean;
}

export interface QuestionValidationResponseDTO {
  questionId?: string;
  answer?: ChoiceDTO;
  correct?: boolean;
  explanation?: ContentDTO;
  dateAttempted?: EpochTimeStamp;
}

export interface QuizAssignmentDTO extends IAssignmentLike, IHasQuizSummary {
  assignerSummary?: UserSummaryDTO;
  quizFeedbackMode?: QuizFeedbackMode;
  attempt?: QuizAttemptDTO;
  userFeedback?: QuizUserFeedbackDTO[];
  quiz?: IsaacQuizDTO;
}

export interface QuizAttemptDTO extends IHasQuizSummary {
  id?: number;
  userId?: number;
  quizAssignmentId?: number;
  startDate?: EpochTimeStamp;
  completedDate?: EpochTimeStamp;
  quiz?: IsaacQuizDTO;
  quizAssignment?: QuizAssignmentDTO;
  feedbackMode?: QuizFeedbackMode;
}

export interface QuizAttemptFeedbackDTO {
  user?: UserSummaryDTO;
  attempt?: QuizAttemptDTO;
}

export interface QuizFeedbackDTO {
  complete?: boolean;
  overallMark?: Mark;
  sectionMarks?: { [index: string]: Mark };
  questionMarks?: { [index: string]: Mark };
}

export interface QuizUserFeedbackDTO {
  user?: UserSummaryDTO;
  feedback?: QuizFeedbackDTO;
}

export interface UserGameboardProgressSummaryDTO {
  user?: UserSummaryDTO;
  progress?: GameboardProgressSummaryDTO[];
}

export interface UserGroupDTO {
  id?: number;
  groupName?: string;
  ownerId?: number;
  created?: EpochTimeStamp;
  lastUpdated?: EpochTimeStamp;
  token?: string;
  archived?: boolean;
  additionalManagerPrivileges?: boolean;
  ownerSummary?: UserSummaryWithEmailAddressDTO;
  additionalManagers?: UserSummaryWithEmailAddressDTO[];
  /**
   * @deprecated
   */
  _id?: number;
}

export interface AnvilAppDTO extends ContentDTO {
  appId?: string;
  appAccessKey?: string;
}

export interface ChoiceDTO extends ContentDTO {
}

export interface ChoiceQuestionDTO extends QuestionDTO {
}

export interface CodeSnippetDTO extends ContentDTO {
  language?: string;
  code?: string;
  disableHighlighting?: boolean;
  url?: string;
}

export interface CodeTabsDTO extends ContentDTO {
}

export interface ContentBaseDTO {
  id?: string;
  type?: string;
  tags?: string[];
  version?: string;
  audience?: AudienceContext[];
  display?: { [index: string]: string[] };
}

export interface ContentDTO extends ContentBaseDTO {
  title?: string;
  subtitle?: string;
  encoding?: string;
  layout?: string;
  children?: ContentBaseDTO[];
  value?: string;
  attribution?: string;
  relatedContent?: ContentSummaryDTO[];
  published?: boolean;
  deprecated?: boolean;
  level?: number;
  expandable?: boolean;
  author?: string;
  canonicalSourceFile?: string;
}

export interface ContentSummaryDTO {
  id?: string;
  title?: string;
  summary?: string;
  type?: string;
  level?: number;
  tags?: string[];
  url?: string;
  correct?: boolean;
  supersededBy?: string;
  deprecated?: boolean;
  difficulty?: Difficulty;
  audience?: AudienceContext[];
}

export interface EmailTemplateDTO extends ContentDTO {
  subject?: string;
  plainTextContent?: string;
  htmlContent?: string;
  overrideFromAddress?: string;
  overrideFromName?: string;
  overrideEnvelopeFrom?: string;
  replyToEmailAddress?: string;
  replyToName?: string;
}

export interface FigureDTO extends ImageDTO {
}

export interface FormulaDTO extends ChoiceDTO {
  pythonExpression?: string;
  requiresExactMatch?: boolean;
}

export interface FreeTextRuleDTO extends ChoiceDTO {
  wordProximity?: number;
  caseInsensitive?: boolean;
  allowsAnyOrder?: boolean;
  allowsExtraWords?: boolean;
  allowsMisspelling?: boolean;
}

export interface GlossaryTermDTO extends ContentDTO {
  explanation?: ContentDTO;
  examBoard?: string;
}

export interface ImageDTO extends MediaDTO {
  clickUrl?: string;
  clickTarget?: string;
}

export interface InteractiveCodeSnippetDTO extends CodeSnippetDTO {
  setupCode?: string;
  testCode?: string;
  expectedResult?: string;
  wrapCodeInMain?: boolean;
}

export interface ItemChoiceDTO extends ChoiceDTO {
  allowSubsetMatch?: boolean;
  items?: ItemDTO[];
}

export interface ItemDTO extends ContentDTO {
  altText?: string;
}

export interface LogicFormulaDTO extends ChoiceDTO {
  pythonExpression?: string;
  requiresExactMatch?: boolean;
}

export interface MediaDTO extends ContentDTO {
  src?: string;
  altText?: string;
}

export interface NotificationDTO extends ContentDTO {
  externalReference?: ExternalReference;
  expiry?: EpochTimeStamp;
}

export interface ParsonsChoiceDTO extends ItemChoiceDTO {
}

export interface ParsonsItemDTO extends ItemDTO {
  indentation?: number;
}

export interface QuantityDTO extends ChoiceDTO {
  units?: string;
}

export interface QuestionDTO extends ContentDTO {
  hints?: ContentBaseDTO[];
  bestAttempt?: QuestionValidationResponseDTO;
}

export interface QuizSummaryDTO extends ContentSummaryDTO {
  visibleToStudents?: boolean;
  hiddenFromRoles?: string[];
}

export interface RegexPatternDTO extends ChoiceDTO {
  caseInsensitive?: boolean;
  multiLineRegex?: boolean;
  matchWholeString?: boolean;
}

export interface SeguePageDTO extends ContentDTO {
  summary?: string;
}

export interface StringChoiceDTO extends ChoiceDTO {
  caseInsensitive?: boolean;
}

export interface VideoDTO extends MediaDTO {
}

export interface DetailedEventBookingDTO extends EventBookingDTO {
  additionalInformation?: { [index: string]: string };
}

export interface EventBookingDTO {
  bookingId?: number;
  userBooked?: UserSummaryDTO;
  reservedById?: number;
  eventId?: string;
  eventTitle?: string;
  eventDate?: EpochTimeStamp;
  bookingStatus?: BookingStatus;
  bookingDate?: EpochTimeStamp;
  updated?: EpochTimeStamp;
}

export interface AbstractSegueUserDTO {
}

export interface AnonymousUserDTO extends AbstractSegueUserDTO {
  sessionId?: string;
  dateCreated?: EpochTimeStamp;
  lastUpdated?: EpochTimeStamp;
}

export interface GroupMembershipDTO {
  groupId?: number;
  userId?: number;
  status?: GroupMembershipStatus;
  updated?: EpochTimeStamp;
  created?: EpochTimeStamp;
}

export interface RegisteredUserDTO extends AbstractSegueUserDTO {
  givenName?: string;
  familyName?: string;
  email?: string;
  dateOfBirth?: EpochTimeStamp;
  gender?: Gender;
  registrationDate?: EpochTimeStamp;
  schoolId?: string;
  teacherPending?: boolean;
  role?: Role;
  schoolOther?: string;
  registeredContexts?: UserContext[];
  registeredContextsLastConfirmed?: EpochTimeStamp;
  firstLogin?: boolean;
  lastUpdated?: EpochTimeStamp;
  lastSeen?: EpochTimeStamp;
  emailVerificationStatus?: EmailVerificationStatus;
  id?: number;
  /**
   * @deprecated
   */
  _id?: number;
  verificationStatus?: EmailVerificationStatus;
}

export interface UserAuthenticationSettingsDTO extends AbstractSegueUserDTO {
  linkedAccounts?: AuthenticationProvider[];
  hasSegueAccount?: boolean;
  mfaStatus?: boolean;
  id?: number;
}

export interface UserIdMergeDTO {
  targetId?: number;
  sourceId?: number;
}

export interface UserSummaryDTO extends AbstractSegueUserDTO {
  givenName?: string;
  familyName?: string;
  role?: Role;
  authorisedFullAccess?: boolean;
  emailVerificationStatus?: EmailVerificationStatus;
  teacherPending?: boolean;
  registeredContexts?: UserContext[];
  id?: number;
}

export interface UserSummaryForAdminUsersDTO extends UserSummaryWithEmailAddressDTO {
  lastUpdated?: EpochTimeStamp;
  lastSeen?: EpochTimeStamp;
  registrationDate?: EpochTimeStamp;
  schoolId?: string;
  schoolOther?: string;
}

export interface UserSummaryWithEmailAddressAndGenderDTO extends UserSummaryWithEmailAddressDTO {
  gender?: Gender;
}

export interface UserSummaryWithEmailAddressDTO extends UserSummaryDTO {
  email?: string;
}

export interface UserSummaryWithGroupMembershipDTO extends UserSummaryDTO {
  groupMembershipInformation?: GroupMembershipDTO;
}

export interface IAssignmentLike {
  id?: number;
  ownerUserId?: number;
  dueDate?: EpochTimeStamp;
  groupId?: number;
  creationDate?: EpochTimeStamp;
}

export interface GameboardItem {
  id?: string;
  contentType?: string;
  title?: string;
  description?: string;
  uri?: string;
  tags?: string[];
  audience?: AudienceContext[];
  creationContext?: AudienceContext;
  level?: number;
  difficulty?: Difficulty;
  questionPartsCorrect?: number;
  questionPartsIncorrect?: number;
  questionPartsNotAttempted?: number;
  questionPartsTotal?: number;
  passMark?: number;
  state?: GameboardItemState;
  questionPartStates?: QuestionPartState[];
  boardId?: string;
  supersededBy?: string;
}

export interface IsaacWildcard extends Content {
  description?: string;
  url?: string;
}

export interface GameFilter {
  subjects?: string[];
  fields?: string[];
  topics?: string[];
  levels?: number[];
  stages?: string[];
  difficulties?: string[];
  examBoards?: string[];
  concepts?: string[];
  questionCategories?: string[];
}

export interface HasTitleOrId {
  id?: string;
  title?: string;
}

export interface AudienceContext {
  stage?: Stage[];
  examBoard?: ExamBoard[];
  difficulty?: Difficulty[];
  role?: RoleRequirement[];
}

export interface Location {
  address?: Address;
  latitude?: number;
  longitude?: number;
}

export interface ExternalReference {
  title?: string;
  url?: string;
}

export interface Image extends Media {
  clickUrl?: string;
  clickTarget?: string;
}

export interface IHasQuizSummary {
  quizId?: string;
  quizSummary?: ContentSummaryDTO;
}

export interface Mark {
  correct?: number;
  incorrect?: number;
  notAttempted?: number;
}

export interface UserContext {
  stage?: Stage;
  examBoard?: ExamBoard;
}

export interface ContentBase {
  id?: string;
  type?: string;
  tags?: string[];
  canonicalSourceFile?: string;
  version?: string;
  audience?: AudienceContext[];
  display?: { [index: string]: string[] };
}

export interface Content extends ContentBase {
  title?: string;
  subtitle?: string;
  author?: string;
  encoding?: string;
  layout?: string;
  children?: ContentBase[];
  value?: string;
  attribution?: string;
  relatedContent?: string[];
  published?: boolean;
  deprecated?: boolean;
  level?: number;
  searchableContent?: string;
  expandable?: boolean;
}

export interface ResultsWrapper<T> {
  results?: T[];
  totalResults?: number;
}

export interface Address {
  addressLine1?: string;
  addressLine2?: string;
  town?: string;
  county?: string;
  postalCode?: string;
  country?: string;
}

export interface Media extends Content {
  src?: string;
  altText?: string;
}

export type GameboardCreationMethod = "FILTER" | "BUILDER";

export type Hub = "BIRMINGHAM_AND_CENTRAL_MIDLANDS" | "CAMBRIDGE_AND_NORTHAMPTONSHIRE" | "CHESHIRE" | "CORNWALL" | "CUMBRIA_SATELLITE" | "DARTFORD_AND_EAST_SUSSEX" | "DEVON" | "GLOUCESTERSHIRE_WILTSHIRE_AND_NORTH_SOMERSET" | "GREATER_MANCHESTER" | "LANCASHIRE_SATELLITE" | "LEICESTER_NOTTINGHAMSHIRE_AND_RUTLAND" | "LINCOLNSHIRE" | "LONDON_HERTFORDSHIRE_AND_ESSEX" | "LONDON_HERTFORDSHIRE_AND_HAMPSHIRE" | "LONDON_SURREY_AND_WEST_SUSSEX" | "MAIDSTONE_AND_KENT" | "MILTON_KEYNES_AND_NORTHAMPTONSHIRE" | "NEWCASTLE_DURHAM_AND_EAST_CUMBRIA" | "NORFOLK" | "NORTH_EAST_AND_NORTHUMBERLAND" | "NORTH_YORKSHIRE_LEEDS_AND_WAKEFIELD" | "OXFORDSHIRE_BUCKINGHAMSHIRE_AND_WEST_BERKSHIRE" | "SOMERSET" | "STOKE_ON_TRENT_STAFFORDSHIRE_AND_DERBYSHIRE" | "SUFFOLK" | "TEES_VALLEY_AND_RICHMONDSHIRE" | "WARRINGTON_AND_MERSEYSIDE" | "WEST_MIDLANDS_SATELLITE" | "WEST_SUSSEX_AND_HAMPSHIRE" | "WEST_YORKSHIRE" | "YORK_EAST_AND_SOUTH_YORKSHIRE";

export type EventStatus = "OPEN" | "FULLY_BOOKED" | "CANCELLED" | "CLOSED" | "WAITING_LIST_ONLY";

export type BookingStatus = "CONFIRMED" | "CANCELLED" | "WAITING_LIST" | "ATTENDED" | "ABSENT" | "RESERVED";

export type Difficulty = "practice_1" | "practice_2" | "practice_3" | "challenge_1" | "challenge_2" | "challenge_3";

export type QuizFeedbackMode = "NONE" | "OVERALL_MARK" | "SECTION_MARKS" | "DETAILED_FEEDBACK";

export type GroupMembershipStatus = "ACTIVE" | "INACTIVE" | "DELETED";

export type Gender = "MALE" | "FEMALE" | "OTHER" | "PREFER_NOT_TO_SAY" | "UNKNOWN";

export type Role = "STUDENT" | "TUTOR" | "TEACHER" | "EVENT_LEADER" | "CONTENT_EDITOR" | "EVENT_MANAGER" | "ADMIN";

export type EmailVerificationStatus = "VERIFIED" | "NOT_VERIFIED" | "DELIVERY_FAILED";

export type AuthenticationProvider = "GOOGLE" | "FACEBOOK" | "TWITTER" | "RAVEN" | "TEST" | "SEGUE" | "RASPBERRYPI";

export type GameboardItemState = "PERFECT" | "PASSED" | "IN_PROGRESS" | "NOT_ATTEMPTED" | "FAILED";

export type QuestionPartState = "CORRECT" | "INCORRECT" | "NOT_ATTEMPTED";

export type Stage = "gcse" | "a_level" | "all";

export type ExamBoard = "aqa" | "ocr" | "cie" | "edexcel" | "eduqas" | "wjec" | "all";

export type RoleRequirement = "logged_in" | "teacher";
