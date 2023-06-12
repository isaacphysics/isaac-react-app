// @ts-ignore
import {Remarkable} from "remarkable";
// @ts-ignore
import {linkify} from "remarkable/linkify";
import {BooleanNotation, NOT_FOUND_TYPE} from "../../IsaacAppTypes";
import {
    BookingStatus,
    ContentDTO,
    Difficulty,
    ExamBoard,
    IsaacFastTrackQuestionPageDTO,
    IsaacQuestionPageDTO,
    Stage,
    UserRole
} from "../../IsaacApiTypes";

export const STAGING_URL = "https://www.staging.isaaccomputerscience.org";

// eslint-disable-next-line no-undef
export const API_VERSION: string = REACT_APP_API_VERSION || "any";

/*
 * Configure the api provider with the server running the API:
 * No need if we want to use the same server as the static content.
 */
let apiPath = `${document.location.origin}/api/${API_VERSION}/api`;
if (document.location.hostname === "localhost") {
    apiPath = "http://localhost:8080/isaac-api/api";
} else if (EDITOR_PREVIEW) {
    apiPath = `${STAGING_URL}/api/any/api`;
} else if (document.location.hostname.endsWith(".eu.ngrok.io")) {
    apiPath = "https://isaacscience.eu.ngrok.io/isaac-api/api";
}
export const isStaging = document.location.hostname.startsWith("staging.") || document.location.hostname.startsWith("www.staging.");

export const envSpecific = <L, S, D>(live: L, staging: S, dev: D) => isStaging ? staging : process.env.NODE_ENV === 'production' ? live : dev;

export const API_PATH: string = apiPath;

export const EDITOR_ORIGIN = "https://editor.isaaccomputerscience.org";

export const EDITOR_URL = EDITOR_ORIGIN + "/#!/edit/master/";
export const EDITOR_COMPARE_URL = EDITOR_ORIGIN + "/#!/compare";

export const GOOGLE_ANALYTICS_ACCOUNT_ID = "UA-137475074-1";
export const GOOGLE_ANALYTICS_4_MEASUREMENT_ID = envSpecific("G-H95WP5C8DR", "G-KZJS9ZKWBD", "G-2QRVC1GSQY");

export const SOCIAL_LINKS = {
        youtube: {name: "YouTube", href: "https://www.youtube.com/channel/UC-qoIYj8kgR8RZtQphrRBYQ"},
        twitter: {name: "Twitter", href: "https://twitter.com/isaaccompsci"},
        facebook: {name: "Facebook", href: "https://www.facebook.com/IsaacComputerScience"},
        instagram: {name: "Instagram", href: "https://www.instagram.com/isaaccompsci"}
    };

// Change to "http://localhost:3000" if you want to run a local version of the code editor
export const CODE_EDITOR_BASE_URL = "https://editor.isaaccode.org";

export const API_REQUEST_FAILURE_MESSAGE = "There may be an error connecting to the Isaac platform.";
export const QUESTION_ATTEMPT_THROTTLED_MESSAGE = "You have made too many attempts at this question. Please try again later!";

export const NOT_FOUND: NOT_FOUND_TYPE = 404;
export const NO_CONTENT = 204;

export const MARKDOWN_RENDERER = new Remarkable({
    html: true
}).use(linkify);

export enum ACTION_TYPE {
    TEST_ACTION = "TEST_ACTION",

    USER_SNAPSHOT_PARTIAL_UPDATE = "USER_SNAPSHOT_PARTIAL_UPDATE",

    USER_LOG_IN_REQUEST = "USER_LOG_IN_REQUEST",
    USER_LOG_IN_RESPONSE_SUCCESS = "USER_LOG_IN_RESPONSE_SUCCESS",
    USER_LOG_IN_RESPONSE_FAILURE = "USER_LOG_IN_RESPONSE_FAILURE",

    CURRENT_USER_REQUEST = "CURRENT_USER_REQUEST",
    CURRENT_USER_RESPONSE_SUCCESS = "CURRENT_USER_RESPONSE_SUCCESS",
    CURRENT_USER_RESPONSE_FAILURE = "CURRENT_USER_RESPONSE_FAILURE",

    USER_DETAILS_UPDATE_REQUEST = "USER_DETAILS_UPDATE",
    USER_DETAILS_UPDATE_RESPONSE_SUCCESS = "USER_DETAILS_UPDATE_RESPONSE_SUCCESS",
    USER_DETAILS_UPDATE_RESPONSE_FAILURE = "USER_DETAILS_UPDATE_RESPONSE_FAILURE",

    USER_AUTH_SETTINGS_REQUEST = "USER_AUTH_SETTINGS_REQUEST",
    USER_AUTH_SETTINGS_RESPONSE_SUCCESS = "USER_AUTH_SETTINGS_RESPONSE_SUCCESS",
    USER_AUTH_SETTINGS_RESPONSE_FAILURE = "USER_AUTH_SETTINGS_RESPONSE_FAILURE",

    SELECTED_USER_AUTH_SETTINGS_REQUEST = "SELECTED_USER_AUTH_SETTINGS_REQUEST",
    SELECTED_USER_AUTH_SETTINGS_RESPONSE_SUCCESS = "SELECTED_USER_AUTH_SETTINGS_REQUEST_SUCCESS",
    SELECTED_USER_AUTH_SETTINGS_RESPONSE_FAILURE = "SELECTED_USER_AUTH_SETTINGS_RESPONSE_FAILURE",

    USER_AUTH_LINK_REQUEST = "USER_AUTH_LINK_REQUEST",
    USER_AUTH_LINK_RESPONSE_SUCCESS = "USER_AUTH_LINK_RESPONSE_SUCCESS",
    USER_AUTH_LINK_RESPONSE_FAILURE = "USER_AUTH_LINK_RESPONSE_FAILURE",

    USER_AUTH_UNLINK_REQUEST = "USER_AUTH_UNLINK_REQUEST",
    USER_AUTH_UNLINK_RESPONSE_SUCCESS = "USER_AUTH_UNLINK_RESPONSE_SUCCESS",
    USER_AUTH_UNLINK_RESPONSE_FAILURE = "USER_AUTH_UNLINK_RESPONSE_FAILURE",

    USER_AUTH_MFA_CHALLENGE_REQUIRED = "USER_AUTH_MFA_CHALLENGE_REQUIRED",
    USER_AUTH_MFA_CHALLENGE_REQUEST  = "USER_AUTH_MFA_CHALLENGE_REQUEST",
    USER_AUTH_MFA_CHALLENGE_SUCCESS = "USER_AUTH_MFA_CHALLENGE_SUCCESS",
    USER_AUTH_MFA_CHALLENGE_FAILURE = "USER_AUTH_MFA_CHALLENGE_FAILURE",

    USER_PREFERENCES_REQUEST = "USER_PREFERENCES_REQUEST",
    USER_PREFERENCES_RESPONSE_SUCCESS= "USER_PREFERENCES_RESPONSE_SUCCESS",
    USER_PREFERENCES_RESPONSE_FAILURE = "USER_PREFERENCES_RESPONSE_FAILURE",

    USER_PASSWORD_RESET_REQUEST= "USER_PASSWORD_RESET_REQUEST",
    USER_PASSWORD_RESET_RESPONSE_SUCCESS ="USER_PASSWORD_RESET_RESPONSE_SUCCESS",
    USER_PASSWORD_RESET_RESPONSE_FAILURE = "USER_PASSWORD_RESET_RESPONSE_FAILURE",

    USER_INCOMING_PASSWORD_RESET_REQUEST = "USER_INCOMING_PASSWORD_RESET_REQUEST",
    USER_INCOMING_PASSWORD_RESET_SUCCESS = "USER_INCOMING_PASSWORD_RESET_SUCCESS",
    USER_INCOMING_PASSWORD_RESET_FAILURE = "USER_INCOMING_PASSWORD_RESET_FAILURE",

    USER_LOG_OUT_REQUEST = "USER_LOG_OUT_REQUEST",
    USER_LOG_OUT_RESPONSE_SUCCESS = "USER_LOG_OUT_RESPONSE_SUCCESS",
    USER_LOG_OUT_EVERYWHERE_REQUEST = "USER_LOG_OUT_EVERYWHERE_REQUEST",
    USER_LOG_OUT_EVERYWHERE_RESPONSE_SUCCESS = "USER_LOG_OUT_EVERYWHERE_RESPONSE_SUCCESS",

    MY_PROGRESS_REQUEST = "MY_PROGRESS_REQUEST",
    MY_PROGRESS_RESPONSE_SUCCESS = "MY_PROGRESS_RESPONSE_SUCCESS",
    MY_PROGRESS_RESPONSE_FAILURE = "MY_PROGRESS_RESPONSE_FAILURE",

    USER_PROGRESS_REQUEST = "USER_PROGRESS_REQUEST",
    USER_PROGRESS_RESPONSE_SUCCESS = "USER_PROGRESS_RESPONSE_SUCCESS",
    USER_PROGRESS_RESPONSE_FAILURE = "USER_PROGRESS_RESPONSE_FAILURE",

    USER_SNAPSHOT_REQUEST = "USER_SNAPSHOT_REQUEST",
    USER_SNAPSHOT_RESPONSE_SUCCESS = "USER_SNAPSHOT_RESPONSE_SUCCESS",
    USER_SNAPSHOT_RESPONSE_FAILURE = "USER_SNAPSHOT_RESPONSE_FAILURE",

    AUTHENTICATION_REQUEST_REDIRECT = "AUTHENTICATION_REQUEST_REDIRECT",
    AUTHENTICATION_REDIRECT = "AUTHENTICATION_REDIRECT",
    AUTHENTICATION_HANDLE_CALLBACK = "AUTHENTICATION_HANDLE_CALLBACK",

    USER_CONSISTENCY_ERROR = "USER_CONSISTENCY_ERROR",

    USER_SCHOOL_LOOKUP_REQUEST = "USER_SCHOOL_LOOKUP_REQUEST",
    USER_SCHOOL_LOOKUP_RESPONSE_SUCCESS = "USER_SCHOOL_LOOKUP_RESPONSE_SUCCESS",
    USER_SCHOOL_LOOKUP_RESPONSE_FAILURE = "USER_SCHOOL_LOOKUP_RESPONSE_FAILURE",

    USER_REQUEST_EMAIL_VERIFICATION_REQUEST = "USER_REQUEST_EMAIL_VERIFICATION_REQUEST",
    USER_REQUEST_EMAIL_VERIFICATION_RESPONSE_SUCCESS = "USER_REQUEST_EMAIL_VERIFICATION_RESPONSE_SUCCESS",
    USER_REQUEST_EMAIL_VERIFICATION_RESPONSE_FAILURE = "USER_REQUEST_EMAIL_VERIFICATION_RESPONSE_FAILURE",

    EMAIL_AUTHENTICATION_REQUEST = "EMAIL_AUTHENTICATION_REQUEST",
    EMAIL_AUTHENTICATION_RESPONSE_SUCCESS = "EMAIL_AUTHENTICATION_RESPONSE_SUCCESS",
    EMAIL_AUTHENTICATION_RESPONSE_FAILURE = "EMAIL_AUTHENTICATION_RESPONSE_FAILURE",

    ADMIN_USER_SEARCH_REQUEST = "ADMIN_USER_SEARCH_REQUEST",
    ADMIN_USER_SEARCH_RESPONSE_SUCCESS = "ADMIN_USER_SEARCH_RESPONSE_SUCCESS",
    ADMIN_USER_SEARCH_RESPONSE_FAILURE = "ADMIN_USER_SEARCH_RESPONSE_FAILURE",
    ADMIN_USER_GET_REQUEST = "ADMIN_USER_GET_REQUEST",
    ADMIN_USER_GET_RESPONSE_SUCCESS = "ADMIN_USER_GET_RESPONSE_SUCCESS",
    ADMIN_USER_GET_RESPONSE_FAILURE = "ADMIN_USER_GET_RESPONSE_FAILURE",
    ADMIN_USER_DELETE_REQUEST = "ADMIN_USER_DELETE_REQUEST",
    ADMIN_USER_DELETE_RESPONSE_SUCCESS = "ADMIN_USER_DELETE_RESPONSE_SUCCESS",
    ADMIN_USER_DELETE_RESPONSE_FAILURE = "ADMIN_USER_DELETE_RESPONSE_FAILURE",
    ADMIN_MODIFY_ROLES_REQUEST = "ADMIN_MODIFY_ROLES_REQUEST",
    ADMIN_MODIFY_ROLES_RESPONSE_SUCCESS = "ADMIN_MODIFY_ROLES_RESPONSE_SUCCESS",
    ADMIN_MODIFY_ROLES_RESPONSE_FAILURE = "ADMIN_MODIFY_ROLES_RESPONSE_FAILURE",
    ADMIN_MODIFY_EMAIL_VERIFICATION_STATUSES_REQUEST = "ADMIN_MODIFY_EMAIL_VERIFICATION_STATUSES_REQUEST",
    ADMIN_MODIFY_EMAIL_VERIFICATION_STATUSES_RESPONSE_SUCCESS = "ADMIN_MODIFY_EMAIL_VERIFICATION_STATUSES_RESPONSE_SUCCESS",
    ADMIN_MODIFY_EMAIL_VERIFICATION_STATUSES_RESPONSE_FAILURE = "ADMIN_MODIFY_EMAIL_VERIFICATION_STATUSES_RESPONSE_FAILURE",
    ADMIN_CONTENT_ERRORS_REQUEST = "ADMIN_CONTENT_ERRORS_REQUEST",
    ADMIN_CONTENT_ERRORS_RESPONSE_SUCCESS = "ADMIN_CONTENT_ERRORS_RESPONSE_SUCCESS",
    ADMIN_CONTENT_ERRORS_RESPONSE_FAILURE = "ADMIN_CONTENT_ERRORS_RESPONSE_FAILURE",
    ADMIN_STATS_REQUEST = "ADMIN_STATS_REQUEST",
    ADMIN_STATS_RESPONSE_SUCCESS = "ADMIN_STATS_RESPONSE_SUCCESS",
    ADMIN_STATS_RESPONSE_FAILURE = "ADMIN_STATS_RESPONSE_FAILURE",
    ADMIN_EMAIL_TEMPLATE_REQUEST = "ADMIN_EMAIL_TEMPLATE_REQUEST",
    ADMIN_EMAIL_TEMPLATE_RESPONSE_SUCCESS = "ADMIN_EMAIL_TEMPLATE_RESPONSE_SUCCESS",
    ADMIN_EMAIL_TEMPLATE_RESPONSE_FAILURE = "ADMIN_EMAIL_TEMPLATE_RESPONSE_FAILURE",
    ADMIN_SEND_EMAIL_REQUEST = "ADMIN_SEND_EMAIL_REQUEST",
    ADMIN_SEND_EMAIL_RESPONSE_SUCCESS = "ADMIN_SEND_EMAIL_RESPONSE_SUCCESS",
    ADMIN_SEND_EMAIL_RESPONSE_FAILURE = "ADMIN_SEND_EMAIL_RESPONSE_FAILURE",
    ADMIN_SEND_EMAIL_WITH_IDS_REQUEST = "ADMIN_SEND_EMAIL_WITH_IDS_REQUEST",
    ADMIN_SEND_EMAIL_WITH_IDS_RESPONSE_SUCCESS = "ADMIN_SEND_EMAIL_WITH_IDS_RESPONSE_SUCCESS",
    ADMIN_SEND_EMAIL_WITH_IDS_RESPONSE_FAILURE = "ADMIN_SEND_EMAIL_WITH_IDS_RESPONSE_FAILURE",
    CONTENT_SEND_EMAIL_WITH_IDS_REQUEST = "CONTENT_SEND_EMAIL_WITH_IDS_REQUEST",
    CONTENT_SEND_EMAIL_WITH_IDS_RESPONSE_SUCCESS = "CONTENT_SEND_EMAIL_WITH_IDS_RESPONSE_SUCCESS",
    CONTENT_SEND_EMAIL_WITH_IDS_RESPONSE_FAILURE = "CONTENT_SEND_EMAIL_WITH_IDS_RESPONSE_FAILURE",
    ADMIN_MERGE_USERS_REQUEST = "ADMIN_MERGE_USERS_REQUEST",
    ADMIN_MERGE_USERS_RESPONSE_SUCCESS = "ADMIN_MERGE_USERS_RESPONSE_SUCCESS",
    ADMIN_MERGE_USERS_RESPONSE_FAILURE = "ADMIN_MERGE_USERS_RESPONSE_FAILURE",

    AUTHORISATIONS_ACTIVE_REQUEST = "AUTHORISATIONS_ACTIVE_REQUEST",
    AUTHORISATIONS_ACTIVE_RESPONSE_SUCCESS = "AUTHORISATIONS_ACTIVE_RESPONSE_SUCCESS",
    AUTHORISATIONS_ACTIVE_RESPONSE_FAILURE = "AUTHORISATIONS_ACTIVE_RESPONSE_FAILURE",
    AUTHORISATIONS_OTHER_USERS_REQUEST = "AUTHORISATIONS_OTHER_USERS_REQUEST",
    AUTHORISATIONS_OTHER_USERS_RESPONSE_SUCCESS = "AUTHORISATIONS_OTHER_USERS_RESPONSE_SUCCESS",
    AUTHORISATIONS_OTHER_USERS_RESPONSE_FAILURE = "AUTHORISATIONS_OTHER_USERS_RESPONSE_FAILURE",
    AUTHORISATIONS_TOKEN_OWNER_REQUEST = "AUTHORISATIONS_TOKEN_OWNER_REQUEST",
    AUTHORISATIONS_TOKEN_OWNER_RESPONSE_SUCCESS = "AUTHORISATIONS_TOKEN_OWNER_RESPONSE_SUCCESS",
    AUTHORISATIONS_TOKEN_OWNER_RESPONSE_FAILURE = "AUTHORISATIONS_TOKEN_OWNER_RESPONSE_FAILURE",
    AUTHORISATIONS_TOKEN_APPLY_REQUEST = "AUTHORISATIONS_TOKEN_APPLY_REQUEST",
    AUTHORISATIONS_TOKEN_APPLY_RESPONSE_SUCCESS = "AUTHORISATIONS_TOKEN_APPLY_RESPONSE_SUCCESS",
    AUTHORISATIONS_TOKEN_APPLY_RESPONSE_FAILURE = "AUTHORISATIONS_TOKEN_APPLY_RESPONSE_FAILURE",
    AUTHORISATIONS_REVOKE_REQUEST = "AUTHORISATIONS_REVOKE_REQUEST",
    AUTHORISATIONS_REVOKE_RESPONSE_SUCCESS = "AUTHORISATIONS_REVOKE_RESPONSE_SUCCESS",
    AUTHORISATIONS_REVOKE_RESPONSE_FAILURE = "AUTHORISATIONS_REVOKE_RESPONSE_FAILURE",
    AUTHORISATIONS_RELEASE_USER_REQUEST = "AUTHORISATIONS_RELEASE_USER_REQUEST",
    AUTHORISATIONS_RELEASE_USER_RESPONSE_SUCCESS = "AUTHORISATIONS_RELEASE_USER_RESPONSE_SUCCESS",
    AUTHORISATIONS_RELEASE_USER_RESPONSE_FAILURE = "AUTHORISATIONS_RELEASE_USER_RESPONSE_FAILURE",
    AUTHORISATIONS_RELEASE_ALL_USERS_REQUEST = "AUTHORISATIONS_RELEASE_ALL_USERS_REQUEST",
    AUTHORISATIONS_RELEASE_ALL_USERS_RESPONSE_SUCCESS = "AUTHORISATIONS_RELEASE_ALL_USERS_RESPONSE_SUCCESS",
    AUTHORISATIONS_RELEASE_ALL_USERS_RESPONSE_FAILURE = "AUTHORISATIONS_RELEASE_ALL_USERS_RESPONSE_FAILURE",

    GROUP_GET_MEMBERSHIPS_REQUEST = "GROUP_GET_MEMBERSHIP_REQUEST",
    GROUP_GET_MEMBERSHIPS_RESPONSE_SUCCESS = "GROUP_GET_MEMBERSHIP_RESPONSE_SUCCESS",
    GROUP_GET_MEMBERSHIPS_RESPONSE_FAILURE = "GROUP_GET_MEMBERSHIP_RESPONSE_FAILURE",
    GROUP_CHANGE_MEMBERSHIP_STATUS_REQUEST = "GROUP_CHANGE_MEMBERSHIP_STATUS_REQUEST",
    GROUP_CHANGE_MEMBERSHIP_STATUS_RESPONSE_SUCCESS = "GROUP_CHANGE_MEMBERSHIP_STATUS_RESPONSE_SUCCESS",
    GROUP_CHANGE_MEMBERSHIP_STATUS_RESPONSE_FAILURE = "GROUP_CHANGE_MEMBERSHIP_STATUS_RESPONSE_FAILURE",

    CONSTANTS_UNITS_REQUEST = "CONSTANTS_UNITS_REQUEST",
    CONSTANTS_UNITS_RESPONSE_SUCCESS = "CONSTANTS_UNITS_SUCCESS",
    CONSTANTS_UNITS_RESPONSE_FAILURE = "CONSTANTS_UNITS_RESPONSE_FAILURE",

    CONSTANTS_SEGUE_VERSION_REQUEST = "CONSTANTS_SEGUE_VERSION_REQUEST",
    CONSTANTS_SEGUE_VERSION_RESPONSE_SUCCESS = "CONSTANTS_SEGUE_VERSION_RESPONSE_SUCCESS",
    CONSTANTS_SEGUE_VERSION_RESPONSE_FAILURE = "CONSTANTS_SEGUE_VERSION_RESPONSE_FAILURE",

    CONSTANTS_SEGUE_ENVIRONMENT_REQUEST = "CONSTANTS_SEGUE_ENVIRONMENT_REQUEST",
    CONSTANTS_SEGUE_ENVIRONMENT_RESPONSE_SUCCESS = "CONSTANTS_SEGUE_ENVIRONMENT_RESPONSE_SUCCESS",
    CONSTANTS_SEGUE_ENVIRONMENT_RESPONSE_FAILURE = "CONSTANTS_SEGUE_ENVIRONMENT_RESPONSE_FAILURE",

    NOTIFICATIONS_REQUEST = "NOTIFICATIONS_REQUEST",
    NOTIFICATIONS_RESPONSE_SUCCESS = "NOTIFICATIONS_RESPONSE_SUCCESS",
    NOTIFICATIONS_RESPONSE_FAILURE = "NOTIFICATIONS_RESPONSE_FAILURE",

    DOCUMENT_REQUEST = "DOCUMENT_REQUEST",
    DOCUMENT_RESPONSE_SUCCESS = "DOCUMENT_RESPONSE_SUCCESS",
    DOCUMENT_RESPONSE_FAILURE = "DOCUMENT_RESPONSE_FAILURE",

    EVENT_REQUEST = "EVENT_REQUEST",
    EVENT_RESPONSE_SUCCESS = "EVENT_RESPONSE_SUCCESS",
    EVENT_RESPONSE_FAILURE = "EVENT_RESPONSE_FAILURE",

    EVENTS_REQUEST = "EVENTS_REQUEST",
    EVENTS_RESPONSE_SUCCESS = "EVENTS_RESPONSE_SUCCESS",
    EVENTS_RESPONSE_FAILURE = "EVENTS_RESPONSE_FAILURE",
    EVENTS_CLEAR = "EVENTS_CLEAR",

    EVENT_OVERVIEWS_REQUEST = "EVENT_OVERVIEWS_REQUEST",
    EVENT_OVERVIEWS_RESPONSE_SUCCESS = "EVENT_OVERVIEWS_RESPONSE_SUCCESS",
    EVENT_OVERVIEWS_RESPONSE_FAILURE = "EVENT_OVERVIEWS_RESPONSE_FAILURE",

    EVENT_MAP_DATA_REQUEST = "EVENT_MAP_DATA_REQUEST",
    EVENT_MAP_DATA_RESPONSE_SUCCESS = "EVENT_MAP_DATA_RESPONSE_SUCCESS",
    EVENT_MAP_DATA_RESPONSE_FAILURE = "EVENT_MAP_DATA_RESPONSE_FAILURE",


    EVENT_BOOKINGS_REQUEST = "EVENT_BOOKINGS_REQUEST",
    EVENT_BOOKINGS_RESPONSE_SUCCESS = "EVENT_BOOKINGS_RESPONSE_SUCCESS",
    EVENT_BOOKINGS_RESPONSE_FAILURE = "EVENT_BOOKINGS_RESPONSE_FAILURE",

    EVENT_BOOKINGS_FOR_GROUP_REQUEST = "EVENT_BOOKINGS_FOR_GROUP_REQUEST",
    EVENT_BOOKINGS_FOR_GROUP_RESPONSE_SUCCESS = "EVENT_BOOKINGS_FOR_GROUP_RESPONSE_SUCCESS",
    EVENT_BOOKINGS_FOR_GROUP_RESPONSE_FAILURE = "EVENT_BOOKINGS_FOR_GROUP_RESPONSE_FAILURE",

    EVENT_BOOKINGS_FOR_ALL_GROUPS_REQUEST = "EVENT_BOOKINGS_FOR_ALL_GROUPS_REQUEST",
    EVENT_BOOKINGS_FOR_ALL_GROUPS_RESPONSE_SUCCESS = "EVENT_BOOKINGS_FOR_ALL_GROUPS_RESPONSE_SUCCESS",
    EVENT_BOOKINGS_FOR_ALL_GROUPS_RESPONSE_FAILURE = "EVENT_BOOKINGS_FOR_ALL_GROUPS_RESPONSE_FAILURE",

    EVENT_BOOKING_CSV_REQUEST = "EVENT_BOOKING_CSV_REQUEST",
    EVENT_BOOKING_CSV_RESPONSE_SUCCESS = "EVENT_BOOKING_CSV_RESPONSE_SUCCESS",
    EVENT_BOOKING_CSV_RESPONSE_FAILURE = "EVENT_BOOKING_CSV_RESPONSE_FAILURE",

    EVENT_BOOKING_REQUEST = "EVENT_BOOKING_REQUEST",
    EVENT_BOOKING_RESPONSE_SUCCESS = "EVENT_BOOKING_RESPONSE_SUCCESS",
    EVENT_BOOKING_RESPONSE_FAILURE = "EVENT_BOOKING_RESPONSE_FAILURE",

    EVENT_RESERVATION_REQUEST = "EVENT_RESERVATION_REQUEST",
    EVENT_RESERVATION_RESPONSE_SUCCESS = "EVENT_RESERVATION_RESPONSE_SUCCESS",
    EVENT_RESERVATION_RESPONSE_FAILURE = "EVENT_RESERVATION_RESPONSE_FAILURE",

    CANCEL_EVENT_RESERVATIONS_REQUEST = "CANCEL_EVENT_RESERVATIONS_REQUEST",
    CANCEL_EVENT_RESERVATIONS_RESPONSE_SUCCESS = "CANCEL_EVENT_RESERVATIONS_RESPONSE_SUCCESS",
    CANCEL_EVENT_RESERVATIONS_RESPONSE_FAILURE = "CANCEL_EVENT_RESERVATIONS_RESPONSE_FAILURE",

    EVENT_BOOKING_USER_REQUEST = "EVENT_BOOKING_USER_REQUEST",
    EVENT_BOOKING_USER_RESPONSE_SUCCESS = "EVENT_BOOKING_USER_RESPONSE_SUCCESS",
    EVENT_BOOKING_USER_RESPONSE_FAILURE = "EVENT_BOOKING_USER_RESPONSE_FAILURE",

    EVENT_BOOKING_WAITING_LIST_REQUEST = "EVENT_BOOKING_WAITING_LIST_REQUEST",
    EVENT_BOOKING_WAITING_LIST_RESPONSE_SUCCESS = "EVENT_BOOKING_WAITING_LIST_RESPONSE_SUCCESS",
    EVENT_BOOKING_WAITING_LIST_RESPONSE_FAILURE = "EVENT_BOOKING_WAITING_LIST_RESPONSE_FAILURE",

    EVENT_BOOKING_RESEND_EMAIL_REQUEST = "EVENT_BOOKING_RESEND_EMAIL_REQUEST",
    EVENT_BOOKING_RESEND_EMAIL_RESPONSE_SUCCESS = "EVENT_BOOKING_RESEND_EMAIL_RESPONSE_SUCCESS",
    EVENT_BOOKING_RESEND_EMAIL_RESPONSE_FAILURE = "EVENT_BOOKING_RESEND_EMAIL_RESPONSE_FAILURE",

    EVENT_BOOKING_PROMOTION_REQUEST = "EVENT_BOOKING_PROMOTION_REQUEST",
    EVENT_BOOKING_PROMOTION_RESPONSE_SUCCESS = "EVENT_BOOKING_PROMOTION_RESPONSE_SUCCESS",
    EVENT_BOOKING_PROMOTION_RESPONSE_FAILURE = "EVENT_BOOKING_PROMOTION_RESPONSE_FAILURE",

    EVENT_BOOKING_SELF_CANCELLATION_REQUEST = "EVENT_BOOKING_SELF_CANCELLATION_REQUEST",
    EVENT_BOOKING_SELF_CANCELLATION_RESPONSE_SUCCESS = "EVENT_BOOKING_SELF_CANCELLATION_RESPONSE_SUCCESS",
    EVENT_BOOKING_SELF_CANCELLATION_RESPONSE_FAILURE = "EVENT_BOOKING_SELF_CANCELLATION_RESPONSE_FAILURE",

    EVENT_BOOKING_CANCELLATION_REQUEST = "EVENT_BOOKING_CANCELLATION_REQUEST",
    EVENT_BOOKING_CANCELLATION_RESPONSE_SUCCESS = "EVENT_BOOKING_CANCELLATION_RESPONSE_SUCCESS",
    EVENT_BOOKING_CANCELLATION_RESPONSE_FAILURE = "EVENT_BOOKING_CANCELLATION_RESPONSE_FAILURE",

    EVENT_BOOKING_DELETION_REQUEST = "EVENT_BOOKING_DELETION_REQUEST",
    EVENT_BOOKING_DELETION_RESPONSE_SUCCESS = "EVENT_BOOKING_DELETION_RESPONSE_SUCCESS",
    EVENT_BOOKING_DELETION_RESPONSE_FAILURE = "EVENT_BOOKING_DELETION_RESPONSE_FAILURE",

    EVENT_RECORD_ATTENDANCE_REQUEST = "EVENT_RECORD_ATTENDANCE_REQUEST",
    EVENT_RECORD_ATTENDANCE_RESPONSE_SUCCESS = "EVENT_RECORD_ATTENDANCE_RESPONSE_SUCCESS",
    EVENT_RECORD_ATTENDANCE_RESPONSE_FAILURE = "EVENT_RECORD_ATTENDANCE_RESPONSE_FAILURE",

    GLOSSARY_TERMS_REQUEST = "GLOSSARY_TERMS_REQUEST",
    GLOSSARY_TERMS_RESPONSE_SUCCESS = "GLOSSARY_TERMS_RESPONSE_SUCCESS",
    GLOSSARY_TERMS_RESPONSE_FAILURE = "GLOSSARY_TERMS_RESPONSE_FAILURE",

    QUESTION_REGISTRATION = "QUESTION_REGISTRATION",
    QUESTION_DEREGISTRATION = "QUESTION_DEREGISTRATION",
    QUESTION_ATTEMPT_REQUEST = "QUESTION_ATTEMPT_REQUEST",
    QUESTION_ATTEMPT_RESPONSE_SUCCESS = "QUESTION_ATTEMPT_RESPONSE_SUCCESS",
    QUESTION_ATTEMPT_RESPONSE_FAILURE = "QUESTION_ATTEMPT_RESPONSE_FAILURE",
    QUESTION_UNLOCK = "QUESTION_UNLOCK",
    QUESTION_SET_CURRENT_ATTEMPT = "QUESTION_SET_CURRENT_ATTEMPT",

    QUESTION_SEARCH_REQUEST = "QUESTION_SEARCH_REQUEST",
    QUESTION_SEARCH_RESPONSE_SUCCESS = "QUESTION_SEARCH_RESPONSE_SUCCESS",
    QUESTION_SEARCH_RESPONSE_FAILURE = "QUESTION_SEARCH_RESPONSE_FAILURE",

    MY_QUESTION_ANSWERS_BY_DATE_REQUEST = "MY_QUESTION_ANSWERS_BY_DATE_REQUEST",
    MY_QUESTION_ANSWERS_BY_DATE_RESPONSE_SUCCESS = "MY_QUESTION_ANSWERS_BY_DATE_RESPONSE_SUCCESS",
    MY_QUESTION_ANSWERS_BY_DATE_RESPONSE_FAILURE = "MY_QUESTION_ANSWERS_BY_DATE_RESPONSE_FAILURE",

    USER_QUESTION_ANSWERS_BY_DATE_REQUEST = "USER_QUESTION_ANSWERS_BY_DATE_REQUEST",
    USER_QUESTION_ANSWERS_BY_DATE_RESPONSE_SUCCESS = "USER_QUESTION_ANSWERS_BY_DATE_RESPONSE_SUCCESS",
    USER_QUESTION_ANSWERS_BY_DATE_RESPONSE_FAILURE = "USER_QUESTION_ANSWERS_BY_DATE_RESPONSE_FAILURE",

    QUIZ_SUBMISSION_REQUEST = "QUIZ_SUBMISSION_REQUEST",
    QUIZ_SUBMISSION_RESPONSE_SUCCESS = "QUIZ_SUBMISSION_RESPONSE_SUCCESS",
    QUIZ_SUBMISSION_RESPONSE_FAILURE = "QUIZ_SUBMISSION_RESPONSE_FAILURE",

    QUIZ_ASSIGNMENT_RESULTS_CSV_REQUEST = "QUIZ_ASSIGNMENT_RESULTS_CSV_REQUEST",
    QUIZ_ASSIGNMENT_RESULTS_CSV_RESPONSE_SUCCESS = "QUIZ_ASSIGNMENT_RESULTS_CSV_RESPONSE_SUCCESS",
    QUIZ_ASSIGNMENT_RESULTS_CSV_RESPONSE_FAILURE = "QUIZ_ASSIGNMENT_RESULTS_CSV_RESPONSE_FAILURE",

    TEST_QUESTION_REQUEST = "TEST_QUESTION_REQUEST",
    TEST_QUESTION_RESPONSE_SUCCESS = "TEST_QUESTION_RESPONSE_SUCCESS",
    TEST_QUESTION_RESPONSE_FAILURE = "TEST_QUESTION_RESPONSE_FAILURE",

    GRAPH_SKETCHER_GENERATE_SPECIFICATION_REQUEST = "GRAPH_SKETCHER_GENERATE_SPECIFICATION_REQUEST",
    GRAPH_SKETCHER_GENERATE_SPECIFICATION_RESPONSE_SUCCESS = "GRAPH_SKETCHER_GENERATE_SPECIFICATION_RESPONSE_SUCCESS",
    GRAPH_SKETCHER_GENERATE_SPECIFICATION_RESPONSE_FAILURE = "GRAPH_SKETCHER_GENERATE_SPECIFICATION_RESPONSE_FAILURE",

    TOPIC_REQUEST = "TOPIC_REQUEST",
    TOPIC_RESPONSE_SUCCESS = "TOPIC_RESPONSE_SUCCESS",
    TOPIC_RESPONSE_FAILURE = "TOPIC_RESPONSE_FAILURE",

    CONTACT_FORM_SEND_REQUEST = "CONTACT_FORM_SEND_REQUEST",
    CONTACT_FORM_SEND_RESPONSE_SUCCESS = "CONTACT_FORM_SEND_RESPONSE_SUCCESS",
    CONTACT_FORM_SEND_RESPONSE_FAILURE = "CONTACT_FORM_SEND_RESPONSE_FAILURE",

    CONTENT_VERSION_GET_REQUEST = "CONTENT_VERSION_GET_REQUEST",
    CONTENT_VERSION_GET_RESPONSE_SUCCESS = "CONTENT_VERSION_GET_RESPONSE_SUCCESS",
    CONTENT_VERSION_GET_RESPONSE_FAILURE = "CONTENT_VERSION_GET_RESPONSE_FAILURE",

    CONTENT_VERSION_SET_REQUEST = "CONTENT_VERSION_SET_REQUEST",
    CONTENT_VERSION_SET_RESPONSE_SUCCESS = "CONTENT_VERSION_SET_RESPONSE_SUCCESS",
    CONTENT_VERSION_SET_RESPONSE_FAILURE = "CONTENT_VERSION_SET_RESPONSE_FAILURE",

    SEARCH_REQUEST = "SEARCH_REQUEST",
    SEARCH_RESPONSE_SUCCESS = "SEARCH_RESPONSE_SUCCESS",

    TOASTS_SHOW = "TOASTS_SHOW",
    TOASTS_HIDE = "TOASTS_HIDE",
    TOASTS_REMOVE = "TOASTS_REMOVE",

    ACTIVE_MODAL_OPEN = "ACTIVE_MODAL_OPEN",
    ACTIVE_MODAL_CLOSE = "ACTIVE_MODAL_CLOSE",

    GROUPS_MEMBERS_RESET_PASSWORD_REQUEST = "GROUPS_MEMBERS_RESET_PASSWORD_REQUEST",
    GROUPS_MEMBERS_RESET_PASSWORD_RESPONSE_SUCCESS = "GROUPS_MEMBERS_RESET_PASSWORD_RESPONSE_SUCCESS",
    GROUPS_MEMBERS_RESET_PASSWORD_RESPONSE_FAILURE = "GROUPS_MEMBERS_RESET_PASSWORD_RESPONSE_FAILURE",

    CONCEPTS_REQUEST = "CONCEPTS_REQUEST",
    CONCEPTS_RESPONSE_SUCCESS = "CONCEPTS_RESPONSE_SUCCESS",
    CONCEPTS_RESPONSE_FAILURE = "CONCEPTS_RESPONSE_FAILURE",

    FASTTRACK_CONCEPTS_REQUEST = "FASTTRACK_CONCEPTS_REQUEST",
    FASTTRACK_CONCEPTS_RESPONSE_SUCCESS = "FASTTRACK_CONCEPTS_RESPONSE_SUCCESS",
    FASTTRACK_CONCEPTS_RESPONSE_FAILURE = "FASTTRACK_CONCEPTS_RESPONSE_FAILURE",

    LOG_EVENT = "LOG_EVENT",

    QUIZZES_REQUEST = "QUIZZES_REQUEST",
    QUIZZES_RESPONSE_SUCCESS = "QUIZZES_RESPONSE_SUCCESS",
    QUIZZES_RESPONSE_FAILURE = "QUIZZES_RESPONSE_FAILURE",

    QUIZ_SET_REQUEST = "QUIZ_SET_REQUEST",
    QUIZ_SET_RESPONSE_SUCCESS = "QUIZ_SET_RESPONSE_SUCCESS",

    QUIZ_ASSIGNMENTS_REQUEST = "QUIZ_ASSIGNMENTS_REQUEST",
    QUIZ_ASSIGNMENTS_RESPONSE_SUCCESS = "QUIZ_ASSIGNMENTS_RESPONSE_SUCCESS",
    QUIZ_ASSIGNMENTS_RESPONSE_FAILURE = "QUIZ_ASSIGNMENTS_RESPONSE_FAILURE",

    QUIZ_ASSIGNED_TO_ME_REQUEST = "QUIZ_ASSIGNED_TO_ME_REQUEST",
    QUIZ_ASSIGNED_TO_ME_RESPONSE_SUCCESS = "QUIZ_ASSIGNED_TO_ME_RESPONSE_SUCCESS",
    QUIZ_ASSIGNED_TO_ME_RESPONSE_FAILURE = "QUIZ_ASSIGNED_TO_ME_RESPONSE_FAILURE",

    // Different ways of loading attempts, but ultimately either an attempt is loaded or it isn't
    QUIZ_LOAD_ASSIGNMENT_ATTEMPT_REQUEST = "QUIZ_LOAD_ASSIGNMENT_ATTEMPT_REQUEST",
    QUIZ_LOAD_ATTEMPT_FEEDBACK_REQUEST = "QUIZ_LOAD_ATTEMPT_FEEDBACK_REQUEST",
    QUIZ_START_FREE_ATTEMPT_REQUEST = "QUIZ_START_FREE_ATTEMPT_REQUEST",
    QUIZ_LOAD_ATTEMPT_RESPONSE_SUCCESS = "QUIZ_LOAD_ATTEMPT_RESPONSE_SUCCESS",
    QUIZ_LOAD_ATTEMPT_RESPONSE_FAILURE = "QUIZ_LOAD_ATTEMPT_RESPONSE_FAILURE",
    QUIZ_LOAD_STUDENT_ATTEMPT_FEEDBACK_REQUEST = "QUIZ_LOAD_STUDENT_ATTEMPT_FEEDBACK_REQUEST",
    QUIZ_LOAD_STUDENT_ATTEMPT_FEEDBACK_RESPONSE_SUCCESS = "QUIZ_LOAD_STUDENT_ATTEMPT_FEEDBACK_RESPONSE_SUCCESS",
    QUIZ_LOAD_STUDENT_ATTEMPT_FEEDBACK_RESPONSE_FAILURE = "QUIZ_LOAD_STUDENT_ATTEMPT_FEEDBACK_RESPONSE_FAILURE",

    QUIZ_ATTEMPT_MARK_COMPLETE_REQUEST = "QUIZ_ATTEMPT_MARK_COMPLETE_REQUEST",
    QUIZ_ATTEMPT_MARK_COMPLETE_RESPONSE_SUCCESS = "QUIZ_ATTEMPT_MARK_COMPLETE_RESPONSE_SUCCESS",

    QUIZ_ASSIGNMENT_FEEDBACK_REQUEST = "QUIZ_ASSIGNMENT_FEEDBACK_REQUEST",
    QUIZ_ASSIGNMENT_FEEDBACK_RESPONSE_SUCCESS = "QUIZ_ASSIGNMENT_FEEDBACK_RESPONSE_SUCCESS",
    QUIZ_ASSIGNMENT_FEEDBACK_RESPONSE_FAILURE = "QUIZ_ASSIGNMENT_FEEDBACK_RESPONSE_FAILURE",

    QUIZ_CANCEL_ASSIGNMENT_REQUEST = "QUIZ_CANCEL_ASSIGNMENT_REQUEST",
    QUIZ_CANCEL_ASSIGNMENT_RESPONSE_SUCCESS = "QUIZ_CANCEL_ASSIGNMENT_RESPONSE_SUCCESS",
    QUIZ_CANCEL_ASSIGNMENT_RESPONSE_FAILURE = "QUIZ_CANCEL_ASSIGNMENT_RESPONSE_FAILURE",

    QUIZ_LOAD_PREVIEW_REQUEST = "QUIZ_LOAD_PREVIEW_REQUEST",
    QUIZ_LOAD_PREVIEW_RESPONSE_SUCCESS = "QUIZ_LOAD_PREVIEW_RESPONSE_SUCCESS",
    QUIZ_LOAD_PREVIEW_RESPONSE_FAILURE = "QUIZ_LOAD_PREVIEW_RESPONSE_FAILURE",

    QUIZ_ATTEMPTED_FREELY_BY_ME_REQUEST = "QUIZ_ATTEMPTED_FREELY_BY_ME_REQUEST",
    QUIZ_ATTEMPTED_FREELY_BY_ME_RESPONSE_SUCCESS = "QUIZ_ATTEMPTED_FREELY_BY_ME_RESPONSE_SUCCESS",
    QUIZ_ATTEMPTED_FREELY_BY_ME_RESPONSE_FAILURE = "QUIZ_ATTEMPTED_FREELY_BY_ME_RESPONSE_FAILURE",

    QUIZ_ATTEMPT_MARK_INCOMPLETE_REQUEST = "QUIZ_ATTEMPT_MARK_INCOMPLETE_REQUEST",
    QUIZ_ATTEMPT_MARK_INCOMPLETE_RESPONSE_SUCCESS = "QUIZ_ATTEMPT_MARK_INCOMPLETE_RESPONSE_SUCCESS",

    QUIZ_ASSIGNMENT_UPDATE_REQUEST = "QUIZ_ASSIGNMENT_UPDATE_REQUEST",
    QUIZ_ASSIGNMENT_UPDATE_RESPONSE_SUCCESS = "QUIZ_ASSIGNMENT_UPDATE_RESPONSE_SUCCESS",
}

export enum PROGRAMMING_LANGUAGE {
    PSEUDOCODE = "PSEUDOCODE",
    JAVASCRIPT = "JAVASCRIPT",
    PYTHON = "PYTHON",
    PHP = "PHP",
    CSHARP = "CSHARP",
    ASSEMBLY = "ASSEMBLY",
    PLAINTEXT = "PLAINTEXT",
    SQL = "SQL",
    NONE = "NONE",
}

export const programmingLanguagesMap: {[language: string]: string} = {
    [PROGRAMMING_LANGUAGE.PSEUDOCODE]: "Pseudocode",
    [PROGRAMMING_LANGUAGE.JAVASCRIPT]: "Javascript",
    [PROGRAMMING_LANGUAGE.PYTHON]: "Python",
    [PROGRAMMING_LANGUAGE.PHP]: "PHP",
    [PROGRAMMING_LANGUAGE.CSHARP]: "C#",
    [PROGRAMMING_LANGUAGE.ASSEMBLY]: "Assembly",
    [PROGRAMMING_LANGUAGE.PLAINTEXT]: "plaintext",
    [PROGRAMMING_LANGUAGE.SQL]: "SQL",
};

// EXAM BOARDS
export enum EXAM_BOARD {
    AQA = "aqa",
    CIE = "cie",
    EDEXCEL = "edexcel",
    EDUQAS = "eduqas",
    OCR = "ocr",
    WJEC = "wjec",
    ALL = "all",
}
export const examBoardLabelMap: {[examBoard in ExamBoard]: string} = {
    [EXAM_BOARD.AQA]: "AQA",
    [EXAM_BOARD.CIE]: "CIE",
    [EXAM_BOARD.EDEXCEL]: "EDEXCEL",
    [EXAM_BOARD.EDUQAS]: "EDUQAS",
    [EXAM_BOARD.OCR]: "OCR",
    [EXAM_BOARD.WJEC]: "WJEC",
    [EXAM_BOARD.ALL]: "All exam boards",
}
export const EXAM_BOARD_NULL_OPTIONS = new Set([EXAM_BOARD.ALL]);
export const EXAM_BOARDS_CS_A_LEVEL = new Set([EXAM_BOARD.AQA, EXAM_BOARD.CIE, EXAM_BOARD.OCR, EXAM_BOARD.EDUQAS, EXAM_BOARD.WJEC]);
export const EXAM_BOARDS_CS_GCSE = new Set([EXAM_BOARD.AQA, EXAM_BOARD.EDEXCEL, EXAM_BOARD.EDUQAS, EXAM_BOARD.OCR, EXAM_BOARD.WJEC]);

export const EXAM_BOARD_ITEM_OPTIONS = Object.keys(EXAM_BOARD).map(s => ({value: s, label: examBoardLabelMap[s as EXAM_BOARD]}));

// BOOLEAN LOGIC NOTATION OPTIONS
export enum BOOLEAN_NOTATION {
    ENG = "ENG",
    MATH = "MATH"
}
export const EMPTY_BOOLEAN_NOTATION_RECORD: {[bn in BOOLEAN_NOTATION]: false} & BooleanNotation = {
    [BOOLEAN_NOTATION.ENG]: false, [BOOLEAN_NOTATION.MATH]: false
}
export const examBoardBooleanNotationMap: {[examBoard in ExamBoard]: BOOLEAN_NOTATION} = {
    [EXAM_BOARD.AQA]: BOOLEAN_NOTATION.ENG,
    [EXAM_BOARD.EDUQAS]: BOOLEAN_NOTATION.ENG,
    [EXAM_BOARD.WJEC]: BOOLEAN_NOTATION.ENG,
    [EXAM_BOARD.OCR]: BOOLEAN_NOTATION.MATH,
    [EXAM_BOARD.EDEXCEL]: BOOLEAN_NOTATION.MATH,
    [EXAM_BOARD.CIE]: BOOLEAN_NOTATION.ENG,
    [EXAM_BOARD.ALL]: BOOLEAN_NOTATION.MATH,
};

// STAGES
export enum STAGE {
    YEAR_7_AND_8 = "year_7_and_8",
    YEAR_9 = "year_9",
    GCSE = "gcse",
    A_LEVEL = "a_level",
    FURTHER_A = "further_a",
    UNIVERSITY = "university",
    ALL = "all",
}
export const STAGE_NULL_OPTIONS = new Set([STAGE.ALL]);
export const STAGES_PHY = new Set([STAGE.ALL, STAGE.YEAR_7_AND_8, STAGE.YEAR_9, STAGE.GCSE, STAGE.A_LEVEL, STAGE.FURTHER_A, STAGE.UNIVERSITY]);
export const STAGES_CS = new Set([STAGE.ALL, STAGE.GCSE, STAGE.A_LEVEL]);
export const STAGES_CS_STUDENT = new Set([STAGE.GCSE, STAGE.A_LEVEL]);
export const stagesOrdered: Stage[] = ["year_7_and_8", "year_9", "gcse", "a_level", "further_a", "university", "all"];
export const stageLabelMap: {[stage in Stage]: string} = {
    year_7_and_8: "Year\u00A07&8",
    year_9: "Year\u00A09",
    gcse: "GCSE",
    a_level: "A\u00A0Level",
    further_a: "Further\u00A0A",
    university: "University",
    all: "All stages",
}

// DIFFICULTIES
export const difficultyShortLabelMap: {[difficulty in Difficulty]: string} = {
    practice_1: "P1",
    practice_2: "P2",
    practice_3: "P3",
    challenge_1: "C1",
    challenge_2: "C2",
    challenge_3: "C3",
}
export const difficultyLabelMap: {[difficulty in Difficulty]: string} = {
    practice_1: "Practice\u00A0(P1)",
    practice_2: "Practice\u00A0(P2)",
    practice_3: "Practice\u00A0(P3)",
    challenge_1: "Challenge\u00A0(C1)",
    challenge_2: "Challenge\u00A0(C2)",
    challenge_3: "Challenge\u00A0(C3)",
}
export const difficultyIconLabelMap: {[difficulty in Difficulty]: string} = {
    practice_1: `Practice (P1) \u2B22\u2B21`,
    practice_2: `Practice (P2) \u2B22\u2B22`,
    practice_3: "Practice (P3) \u2B22\u2B22\u2B22",
    challenge_1: `Challenge (C1) \u25A0\u25A1`,
    challenge_2: `Challenge (C2) \u25A0\u25A0`,
    challenge_3: "Challenge (C3) \u25A0\u25A0\u25A0",
}
export const difficultiesOrdered: Difficulty[] = ["practice_1", "practice_2", "challenge_1", "challenge_2"];
export const DIFFICULTY_ITEM_OPTIONS: {value: Difficulty, label: string}[] = difficultiesOrdered.map(d => (
    {value: d, label: difficultyLabelMap[d]}
));
export const DIFFICULTY_ICON_ITEM_OPTIONS: {value: Difficulty, label: string}[] = difficultiesOrdered.map(d => (
    {value: d, label: difficultyIconLabelMap[d]}
));

// QUESTION CATEGORIES
export enum QUESTION_CATEGORY {
    LEARN_AND_PRACTICE = "learn_and_practice", /* pseudo option */
    PROBLEM_SOLVING = "problem_solving",
    BOOK_QUESTIONS = "book",
    QUICK_QUIZ = "quick_quiz",
    TOPIC_TEST = "topic_test",
}

export const QUESTION_CATEGORY_ITEM_OPTIONS = [
    {label: "Learn and Practice", value: QUESTION_CATEGORY.LEARN_AND_PRACTICE},
    {label: "Quick Quiz", value: QUESTION_CATEGORY.QUICK_QUIZ},
    // {label: "Topic Test", value: QUESTION_CATEGORY.TOPIC_TEST},
];

export enum SUBJECTS {
    CS = 'computer_science'
}

export const fastTrackProgressEnabledBoards = [
    'ft_core_2017', 'ft_core_2018', 'ft_core_stage2',
    'ft_mech_year1_2018', 'ft_mech_year2_2018', 'ft_further_stage1_2018',
    'ft_further_stage2_2018',
];

export enum TAG_ID {
    // CS ----
    // Categories
    computerScience = "computer_science",

    // Strands
    computerNetworks = "computer_networks",
    computerSystems = "computer_systems",
    cyberSecurity = "cyber_security",
    dataAndInformation = "data_and_information",
    dataStructuresAndAlgorithms = "data_structures_and_algorithms",
    gcseToALevel = "gcse_to_a_level",
    impactsOfDigitalTechnology = "impacts_of_digital_tech",
    machineLearningAi = "machine_learning_ai",
    mathsForCs = "maths_for_cs",
    programmingFundamentals = "programming_fundamentals",
    programmingParadigms = "programming_paradigms",
    softwareEngineering = "software_engineering",
    theoryOfComputation = "theory_of_computation",

    // Computer networks topics
    networking = "networking",
    networkHardware = "network_hardware",
    communication = "communication",
    theInternet = "the_internet",
    webTechnologies = "web_technologies",
    // Computer systems topics
    booleanLogic = "boolean_logic",
    architecture = "architecture",
    memoryAndStorage = "memory_and_storage",
    hardware = "hardware",
    software = "software",
    operatingSystems = "operating_systems",
    translators = "translators",
    programmingLanguages = "programming_languages",
    // Cyber security
    security = "security",
    socialEngineering = "social_engineering",
    maliciousCode = "malicious_code",
    // Data and information topics
    numberRepresentation = "number_representation",
    textRepresentation = "text_representation",
    imageRepresentation = "image_representation",
    soundRepresentation = "sound_representation",
    compression = "compression",
    encryption = "encryption",
    databases = "databases",
    fileOrganisation = "file_organisation",
    sql = "sql",
    bigData = "big_data",
    // Data structures and algorithms topics
    searching = "searching",
    sorting = "sorting",
    pathfinding = "pathfinding",
    complexity = "complexity",
    dataStructures = "data_structures",
    // GCSE to A level transition topics
    gcseBooleanLogic = "gcse_boolean_logic",
    gcseProgrammingConcepts = "gcse_programming_concepts",
    gcseNetworking = "gcse_networking",
    gcseSystems = "gcse_systems",
    // Impacts of digital technology
    legislation = "legislation",
    impactsOfTech = "impacts_of_tech",
    // Maths for CS
    numberSystems = "number_systems",
    mathsFunctions = "functions",
    // Machine learning and ai
    graphsForAi = "graphs_for_ai",
    neuralNetworks = "neural_networks",
    machineLearning = "machine_learning",
    backpropagationAndRegression = "regression",
    // Programming fundamentals topics
    programmingConcepts = "programming_concepts",
    subroutines = "subroutines",
    files = "files",
    recursion = "recursion",
    stringHandling = "string_handling",
    ide = "ide",
    // Programming paradigms topics
    objectOrientedProgramming = "object_oriented_programming",
    functionalProgramming = "functional_programming",
    eventDrivenProgramming = "event_driven_programming",
    declarativeProgramming = "declarative_programming",
    proceduralProgramming = "procedural_programming",
    // Software engineering
    softwareEngineeringPrinciples = "software_engineering_principles",
    programDesign = "program_design",
    testing = "testing",
    softwareProject = "software_project",
    //Theory of computation
    computationalThinking = "computational_thinking",
    modelsOfComputation = "models_of_computation",
}

export enum TAG_LEVEL {
    subject = "subject",
    field = "field",
    category = "category",
    subcategory = "subcategory",
    topic = "topic",
}

export enum DOCUMENT_TYPE {
    CONCEPT = "isaacConceptPage",
    QUESTION = "isaacQuestionPage",
    FAST_TRACK_QUESTION = "isaacFastTrackQuestionPage",
    EVENT = "isaacEventPage",
    TOPIC_SUMMARY = "isaacTopicSummaryPage",
    GENERIC = "page",
    QUIZ = "isaacQuiz",
}
export function isAQuestionLikeDoc(doc: ContentDTO): doc is IsaacQuestionPageDTO | IsaacFastTrackQuestionPageDTO {
    return doc.type === DOCUMENT_TYPE.QUESTION || doc.type === DOCUMENT_TYPE.FAST_TRACK_QUESTION;
}

export enum SEARCH_RESULT_TYPE {SHORTCUT = "shortcut"}

export const documentDescription: {[documentType in DOCUMENT_TYPE]: string} = {
    [DOCUMENT_TYPE.CONCEPT]: "Concepts",
    [DOCUMENT_TYPE.QUESTION]: "Questions",
    [DOCUMENT_TYPE.FAST_TRACK_QUESTION]: "Questions",
    [DOCUMENT_TYPE.EVENT]: "Events",
    [DOCUMENT_TYPE.TOPIC_SUMMARY]: "Topics",
    [DOCUMENT_TYPE.GENERIC]: "Other pages",
    [DOCUMENT_TYPE.QUIZ]: "Tests",
};

export const documentTypePathPrefix: {[documentType in DOCUMENT_TYPE]: string} = {
    [DOCUMENT_TYPE.GENERIC]: "pages",
    [DOCUMENT_TYPE.CONCEPT]: "concepts",
    [DOCUMENT_TYPE.QUESTION]: "questions",
    [DOCUMENT_TYPE.FAST_TRACK_QUESTION]: "questions",
    [DOCUMENT_TYPE.EVENT]: "events",
    [DOCUMENT_TYPE.TOPIC_SUMMARY]: "topics",
    [DOCUMENT_TYPE.QUIZ]: "quiz",
};

export enum ContentVersionUpdatingStatus {
    UPDATING = "UPDATING",
    SUCCESS = "SUCCESS",
    FAILURE = "FAILURE"
}

export enum MEMBERSHIP_STATUS {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE",
}

export enum ACCOUNT_TAB {account, passwordreset, teacherconnections, emailpreferences, betafeatures}

export enum MANAGE_QUIZ_TAB {set = 1, manage = 2}
export enum MARKBOOK_TYPE_TAB {assignments = 1, tests = 2}

export const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export const HOME_CRUMB = {title: "Home", to: "/"};
export const ALL_TOPICS_CRUMB = {title: "All topics", to: "/topics"};
export const ADMIN_CRUMB = {title: "Admin", to: "/admin"};
export const EVENTS_CRUMB = {title: "Events", to: "/events"};
export const ASSIGNMENT_PROGRESS_CRUMB = {title: "My markbook", to: "/my_markbook"};

export const UserFacingRole: {[role in UserRole]: string} = {
    ADMIN: "Admin",
    EVENT_MANAGER: "Event Manager",
    CONTENT_EDITOR: "Content Editor",
    EVENT_LEADER: "Event Leader",
    TEACHER: "Teacher",
    TUTOR: "Tutor",
    STUDENT: "Student"
};

export enum SortOrder {
    ASC = "ASC",
    DESC = "DESC",
    NONE = "NONE"
}

export const bookingStatusMap: {[status in BookingStatus]: string} = {
    "ABSENT": "Absent",
    "ATTENDED": "Attended",
    "CANCELLED": "Booking cancelled",
    "CONFIRMED": "Booking confirmed",
    "RESERVED": "Place reserved",
    "WAITING_LIST": "In waiting list"
}

export enum sortIcon {
    "sortable" = '⇕',
    "ascending" = '⇑',
    "descending" = '⇓'
}

export enum EventStatusFilter {
    "All events" = "all",
    "Upcoming events" = "upcoming",
    "My booked events" = "showBookedOnly",
    "My event reservations" = "showReservationsOnly"
}
export enum EventTypeFilter {
    "All events" = "all",
    "Student events" = "student",
    "Teacher events" = "teacher",
    "Online tutorials" = "virtual",
}

export enum EventStageFilter {
    "All stages" = "all",
    "GCSE" = "gcse",
    "A-Level" = "a_level",
    "Further A" = "further_a",
    "University" = "university"
}

export const GREEK_LETTERS_MAP: { [letter: string]: string } = {
    "alpha": "α",
    "beta": "β",
    "gamma": "γ",
    "delta": "δ",
    "epsilon": "ε",
    "varepsilon": "ε",
    "zeta": "ζ",
    "eta": "η",
    "theta": "θ",
    "iota": "ι",
    "kappa": "κ",
    "lambda": "λ",
    "mu": "μ",
    "nu": "ν",
    "xi": "ξ",
    "omicron": "ο",
    "pi": "π",
    "rho": "ρ",
    "sigma": "σ",
    "tau": "τ",
    "upsilon": "υ",
    "phi": "ϕ",
    "chi": "χ",
    "psi": "ψ",
    "omega": "ω",
    "Gamma": "Γ",
    "Delta": "Δ",
    "Theta": "Θ",
    "Lambda": "Λ",
    "Xi": "Ξ",
    "Pi": "Π",
    "Sigma": "Σ",
    "Upsilon": "Υ",
    "Phi": "Φ",
    "Psi": "Ψ",
    "Omega": "Ω",
};

const _REVERSE_GREEK_LETTERS_MAP: { [key: string]: string } = {};
for(const entry of Object.entries(GREEK_LETTERS_MAP)) {
    _REVERSE_GREEK_LETTERS_MAP[entry[1]] = entry[0];
}
_REVERSE_GREEK_LETTERS_MAP["ε"] = "epsilon"; // Take this one in preference!
export const REVERSE_GREEK_LETTERS_MAP = _REVERSE_GREEK_LETTERS_MAP;


export const doughnutColours = [
        "#feae42",
        "#000000",
        "#e51f6f",
        "#ef67ac",
        "#bf6707",
        "#0f8294",
        "#aaaaaa",
        "#dbdbdb"
    ];

export const progressColour = '#000000';

export const GRAY_120 = '#c9cad1';

export const SEARCH_CHAR_LENGTH_LIMIT = 255;

export const QUESTION_FINDER_CONCEPT_LABEL_PLACEHOLDER = "Loading...";

export const FEATURED_NEWS_TAG = "featured";

export const ASSIGNMENT_PROGRESS_PATH = "my_markbook";

export const CLOZE_ITEM_SECTION_ID = "non-selected-items";
export const CLOZE_DROP_ZONE_ID_PREFIX = "drop-zone-";
// Matches: [drop-zone], [drop-zone|w-50], [drop-zone|h-50] or [drop-zone|w-50h-200]
export const dropZoneRegex = /\[drop-zone(?<params>\|(?<index>i-\d+?)?(?<width>w-\d+?)?(?<height>h-\d+?)?)?]/g;
