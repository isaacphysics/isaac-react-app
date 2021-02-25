import Remarkable from "remarkable";
import {NOT_FOUND_TYPE} from "../../IsaacAppTypes";
import {invert} from "lodash";
import {BookingStatus} from "../../IsaacApiTypes";
import {SITE, SITE_SUBJECT} from "./siteConstants";

// eslint-disable-next-line no-undef
export const API_VERSION: string = REACT_APP_API_VERSION || "any";

/*
 * Configure the api provider with the server running the API:
 * No need if we want to use the same server as the static content.
 */
let apiPath = `${document.location.origin}/api/${API_VERSION}/api`;
if (document.location.hostname === "localhost") {
    apiPath = "http://localhost:8080/isaac-api/api";
} else if (document.location.hostname.endsWith(".eu.ngrok.io")) {
    apiPath = "https://isaacscience.eu.ngrok.io/isaac-api/api";
}
export const isTest = document.location.hostname.startsWith("test.");

export const API_PATH: string = apiPath;

const EDITOR_BASE_URL = {
    [SITE.PHY]: "https://editor.isaacphysics.org",
    [SITE.CS]: "https://editor.isaaccomputerscience.org",
}[SITE_SUBJECT];

export const EDITOR_URL = EDITOR_BASE_URL + "/#!/edit/master/";
export const EDITOR_COMPARE_URL = EDITOR_BASE_URL + "/#!/compare";

export const GOOGLE_ANALYTICS_ACCOUNT_ID = {
    [SITE.PHY]: "UA-122616705-1",
    [SITE.CS]: "UA-137475074-1",
}[SITE_SUBJECT];


export const API_REQUEST_FAILURE_MESSAGE = "There may be an error connecting to the Isaac platform.";
export const QUESTION_ATTEMPT_THROTTLED_MESSAGE = "You have made too many attempts at this question. Please try again later!";

export const NOT_FOUND: NOT_FOUND_TYPE = 404;
export const NO_CONTENT = 204;

export const MARKDOWN_RENDERER = new Remarkable({
    linkify: true,
    html: true,
});

export const ACCEPTED_QUIZ_IDS = ['quiz_test', 'class_test_jan20_aqa', 'class_test_jan20_ocr'];

export enum ACTION_TYPE {
    TEST_ACTION = "TEST_ACTION",

    USER_SNAPSHOT_PARTIAL_UPDATE = "USER_SNAPSHOT_PARTIAL_UPDATE",

    ROUTER_PAGE_CHANGE = "ROUTER_PAGE_CHANGE",
    API_SERVER_ERROR = "API_SERVER_ERROR",
    API_GONE_AWAY = "API_GONE_AWAY",

    USER_LOG_IN_REQUEST = "USER_LOG_IN_REQUEST",
    USER_LOG_IN_RESPONSE_SUCCESS = "USER_LOG_IN_RESPONSE_SUCCESS",
    USER_LOG_IN_RESPONSE_FAILURE = "USER_LOG_IN_RESPONSE_FAILURE",

    USER_UPDATE_REQUEST = "USER_UPDATE_REQUEST",
    USER_UPDATE_RESPONSE_SUCCESS = "USER_UPDATE_RESPONSE_SUCCESS",
    USER_UPDATE_RESPONSE_FAILURE = "USER_UPDATE_RESPONSE_FAILURE",

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

    USER_AUTH_MFA_NEW_SECRET_REQUEST = "USER_AUTH_MFA_NEW_SECRET_REQUEST",
    USER_AUTH_MFA_NEW_SECRET_SUCCESS = "USER_AUTH_MFA_NEW_SECRET_SUCCESS",
    USER_AUTH_MFA_NEW_SECRET_FAILURE = "USER_AUTH_MFA_NEW_SECRET_FAILURE",

    USER_AUTH_MFA_SETUP_REQUEST = "USER_AUTH_MFA_SETUP_REQUEST",
    USER_AUTH_MFA_SETUP_SUCCESS = "USER_AUTH_MFA_SETUP_SUCCESS",
    USER_AUTH_MFA_SETUP_FAILURE = "USER_AUTH_MFA_SETUP_FAILURE",

    USER_AUTH_MFA_DISABLE_REQUEST = "USER_AUTH_MFA_DISABLE_REQUEST",
    USER_AUTH_MFA_DISABLE_SUCCESS = "USER_AUTH_MFA_DISABLE_SUCCESS",
    USER_AUTH_MFA_DISABLE_FAILURE = "USER_AUTH_MFA_DISABLE_FAILURE",

    USER_PREFERENCES_REQUEST = "USER_PREFERENCES_REQUEST",
    USER_PREFERENCES_RESPONSE_SUCCESS= "USER_PREFERENCES_RESPONSE_SUCCESS",
    USER_PREFERENCES_RESPONSE_FAILURE = "USER_PREFERENCES_RESPONSE_FAILURE",

    EXAM_BOARD_SET_TEMP = "EXAM_BOARD_SET_TEMP",

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
    GROUP_PROGRESS_REQUEST = "GROUP_PROGRESS_REQUEST",
    GROUP_PROGRESS_RESPONSE_SUCCESS = "GROUP_PROGRESS_RESPONSE_SUCCESS",
    GROUP_PROGRESS_RESPONSE_FAILURE = "GROUP_PROGRESS_RESPONSE_FAILURE",

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

    NEWS_REQUEST = "NEWS_REQUEST",
    NEWS_RESPONSE_SUCCESS = "NEWS_RESPONSE_SUCCESS",
    NEWS_RESPONSE_FAILURE = "NEWS_RESPONSE_FAILURE",

    FRAGMENT_REQUEST = "FRAGMENT_REQUEST",
    FRAGMENT_RESPONSE_SUCCESS = "FRAGMENT_RESPONSE_SUCCESS",
    FRAGMENT_RESPONSE_FAILURE = "FRAGMENT_RESPONSE_FAILURE",

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

    TEST_QUESTION_REQUEST = "TEST_QUESTION_REQUEST",
    TEST_QUESTION_RESPONSE_SUCCESS = "TEST_QUESTION_RESPONSE_SUCCESS",
    TEST_QUESTION_RESPONSE_FAILURE = "TEST_QUESTION_RESPONSE_FAILURE",

    GRAPH_SKETCHER_GENERATE_SPECIFICATION_REQUEST = "GRAPH_SKETCHER_GENERATE_SPECIFICATION_REQUEST",
    GRAPH_SKETCHER_GENERATE_SPECIFICATION_RESPONSE_SUCCESS = "GRAPH_SKETCHER_GENERATE_SPECIFICATION_RESPONSE_SUCCESS",
    GRAPH_SKETCHER_GENERATE_SPECIFICATION_RESPONSE_FAILURE = "GRAPH_SKETCHER_GENERATE_SPECIFICATION_RESPONSE_FAILURE",

    TOPIC_REQUEST = "TOPIC_REQUEST",
    TOPIC_RESPONSE_SUCCESS = "TOPIC_RESPONSE_SUCCESS",
    TOPIC_RESPONSE_FAILURE = "TOPIC_RESPONSE_FAILURE",

    GAMEBOARD_REQUEST = "GAMEBOARD_REQUEST",
    GAMEBOARD_RESPONSE_SUCCESS = "GAMEBOARD_RESPONSE_SUCCESS",
    GAMEBOARD_RESPONSE_NO_CONTENT = "GAMEBOARD_RESPONSE_NO_CONTENT",
    GAMEBOARD_RESPONSE_FAILURE = "GAMEBOARD_RESPONSE_FAILURE",

    GAMEBOARD_ADD_REQUEST = "GAMEBOARD_ADD_REQUEST",
    GAMEBOARD_ADD_RESPONSE_SUCCESS = "GAMEBOARD_ADD_RESPONSE_SUCCESS",
    GAMEBOARD_ADD_RESPONSE_FAILURE = "GAMEBOARD_ADD_RESPONSE_FAILURE",

    GAMEBOARD_CREATE_REQUEST = "GAMEBOARD_CREATE_REQUEST",
    GAMEBOARD_CREATE_RESPONSE_SUCCESS = "GAMEBOARD_CREATE_RESPONSE_SUCCESS",
    GAMEBOARD_CREATE_RESPONSE_FAILURE = "GAMEBOARD_CREATE_RESPONSE_FAILURE",

    GAMEBOARD_WILDCARDS_REQUEST = "GAMEBOARD_WILDCARDS_REQUEST",
    GAMEBOARD_WILDCARDS_RESPONSE_SUCCESS = "GAMEBOARD_WILDCARDS_RESPONSE_SUCCESS",
    GAMEBOARD_WILDCARDS_RESPONSE_FAILURE = "GAMEBOARD_WILDCARDS_RESPONSE_FAILURE",

    CONTACT_FORM_SEND_REQUEST = "CONTACT_FORM_SEND_REQUEST",
    CONTACT_FORM_SEND_RESPONSE_SUCCESS = "CONTACT_FORM_SEND_RESPONSE_SUCCESS",
    CONTACT_FORM_SEND_RESPONSE_FAILURE = "CONTACT_FORM_SEND_RESPONSE_FAILURE",

    ASSIGNMENTS_REQUEST = "ASSIGNMENTS_REQUEST",
    ASSIGNMENTS_RESPONSE_SUCCESS = "ASSIGNMENTS_RESPONSE_SUCCESS",

    ASSIGNMENTS_BY_ME_REQUEST = "ASSIGNMENTS_BY_ME_REQUEST",
    ASSIGNMENTS_BY_ME_RESPONSE_SUCCESS = "ASSIGNMENTS_BY_ME_RESPONSE_SUCCESS",

    PROGRESS_REQUEST = "PROGRESS_REQUEST",
    PROGRESS_RESPONSE_SUCCESS = "PROGRESS_SUCCESS",
    PROGRESS_RESPONSE_FAILURE = "PROGRESS_RESPONSE_FAILURE",

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

    GROUPS_REQUEST = "GROUPS_REQUEST",
    GROUPS_RESPONSE_SUCCESS = "GROUPS_RESPONSE_SUCCESS",

    GROUPS_SELECT = "GROUPS_SELECT",

    GROUPS_CREATE_REQUEST = "GROUPS_CREATE_REQUEST",
    GROUPS_CREATE_RESPONSE_SUCCESS = "GROUPS_CREATE_RESPONSE_SUCCESS",

    GROUPS_DELETE_REQUEST = "GROUPS_DELETE_REQUEST",
    GROUPS_DELETE_RESPONSE_SUCCESS = "GROUPS_DELETE_RESPONSE_SUCCESS",
    GROUPS_DELETE_RESPONSE_FAILURE = "GROUPS_DELETE_RESPONSE_FAILURE",

    GROUPS_UPDATE_REQUEST = "GROUPS_UPDATE_REQUEST",
    GROUPS_UPDATE_RESPONSE_SUCCESS = "GROUPS_UPDATE_RESPONSE_SUCCESS",
    GROUPS_UPDATE_RESPONSE_FAILURE = "GROUPS_UPDATE_RESPONSE_FAILURE",

    GROUPS_MEMBERS_REQUEST = "GROUPS_MEMBERS_REQUEST",
    GROUPS_MEMBERS_RESPONSE_SUCCESS = "GROUPS_MEMBERS_RESPONSE_SUCCESS",
    GROUPS_MEMBERS_RESPONSE_FAILURE = "GROUPS_MEMBERS_RESPONSE_FAILURE",

    GROUPS_TOKEN_REQUEST = "GROUPS_TOKEN_REQUEST",
    GROUPS_TOKEN_RESPONSE_SUCCESS = "GROUPS_TOKEN_RESPONSE_SUCCESS",
    GROUPS_TOKEN_RESPONSE_FAILURE = "GROUPS_TOKEN_RESPONSE_FAILURE",

    GROUPS_MEMBERS_RESET_PASSWORD_REQUEST = "GROUPS_MEMBERS_RESET_PASSWORD_REQUEST",
    GROUPS_MEMBERS_RESET_PASSWORD_RESPONSE_SUCCESS = "GROUPS_MEMBERS_RESET_PASSWORD_RESPONSE_SUCCESS",
    GROUPS_MEMBERS_RESET_PASSWORD_RESPONSE_FAILURE = "GROUPS_MEMBERS_RESET_PASSWORD_RESPONSE_FAILURE",

    GROUPS_MEMBERS_DELETE_REQUEST = "GROUPS_MEMBERS_DELETE_REQUEST",
    GROUPS_MEMBERS_DELETE_RESPONSE_SUCCESS = "GROUPS_MEMBERS_DELETE_RESPONSE_SUCCESS",
    GROUPS_MEMBERS_DELETE_RESPONSE_FAILURE = "GROUPS_MEMBERS_DELETE_RESPONSE_FAILURE",

    GROUPS_MANAGER_ADD_REQUEST = "GROUPS_MANAGER_ADD_REQUEST",
    GROUPS_MANAGER_ADD_RESPONSE_SUCCESS = "GROUPS_MANAGER_ADD_RESPONSE_SUCCESS",
    GROUPS_MANAGER_ADD_RESPONSE_FAILURE = "GROUPS_MANAGER_ADD_RESPONSE_FAILURE",

    GROUPS_MANAGER_DELETE_REQUEST = "GROUPS_MANAGER_DELETE_REQUEST",
    GROUPS_MANAGER_DELETE_RESPONSE_SUCCESS = "GROUPS_MANAGER_DELETE_RESPONSE_SUCCESS",
    GROUPS_MANAGER_DELETE_RESPONSE_FAILURE = "GROUPS_MANAGER_DELETE_RESPONSE_FAILURE",

    BOARDS_REQUEST = "BOARDS_REQUEST",
    BOARDS_RESPONSE_SUCCESS = "BOARDS_RESPONSE_SUCCESS",

    BOARDS_GROUPS_REQUEST = "BOARDS_GROUPS_REQUEST",
    BOARDS_GROUPS_RESPONSE_SUCCESS = "BOARDS_GROUPS_RESPONSE_SUCCESS",
    BOARDS_GROUPS_RESPONSE_FAILURE = "BOARDS_GROUPS_RESPONSE_FAILURE",

    BOARDS_DELETE_REQUEST = "BOARDS_DELETE_REQUEST",
    BOARDS_DELETE_RESPONSE_SUCCESS = "BOARDS_DELETE_RESPONSE_SUCCESS",
    BOARDS_DELETE_RESPONSE_FAILURE = "BOARDS_DELETE_RESPONSE_FAILURE",

    BOARDS_UNASSIGN_REQUEST = "BOARDS_UNASSIGN_REQUEST",
    BOARDS_UNASSIGN_RESPONSE_SUCCESS = "BOARDS_UNASSIGN_RESPONSE_SUCCESS",
    BOARDS_UNASSIGN_RESPONSE_FAILURE = "BOARDS_UNASSIGN_RESPONSE_FAILURE",

    BOARDS_ASSIGN_REQUEST = "BOARDS_ASSIGN_REQUEST",
    BOARDS_ASSIGN_RESPONSE_SUCCESS = "BOARDS_ASSIGN_RESPONSE_SUCCESS",
    BOARDS_ASSIGN_RESPONSE_FAILURE = "BOARDS_ASSIGN_RESPONSE_FAILURE",

    PRINTING_SET_HINTS = "PRINTING_SET_HINTS",

    CONCEPTS_REQUEST = "CONCEPTS_REQUEST",
    CONCEPTS_RESPONSE_SUCCESS = "CONCEPTS_RESPONSE_SUCCESS",
    CONCEPTS_RESPONSE_FAILURE = "CONCEPTS_RESPONSE_FAILURE",

    FASTTRACK_CONCEPTS_REQUEST = "FASTTRACK_CONCEPTS_REQUEST",
    FASTTRACK_CONCEPTS_RESPONSE_SUCCESS = "FASTTRACK_CONCEPTS_RESPONSE_SUCCESS",
    FASTTRACK_CONCEPTS_RESPONSE_FAILURE = "FASTTRACK_CONCEPTS_RESPONSE_FAILURE",

    LOG_EVENT = "LOG_EVENT",

    SET_MAIN_CONTENT_ID = "SET_MAIN_CONTENT_ID",

    QUIZZES_REQUEST = "QUIZZES_REQUEST",
    QUIZZES_RESPONSE_SUCCESS = "QUIZZES_RESPONSE_SUCCESS",
    QUIZZES_RESPONSE_FAILURE = "QUIZZES_RESPONSE_FAILURE",

    QUIZ_SET_REQUEST = "QUIZ_SET_REQUEST",
    QUIZ_SET_RESPONSE_SUCCESS = "QUIZ_SET_RESPONSE_SUCCESS",
}

export enum EXAM_BOARD {
    AQA = "AQA",
    OCR = "OCR",
    OTHER = "OTHER",
    NONE = ""
}

export enum SUBJECTS {
    PHYSICS = 'physics',
    MATHS = 'maths',
    CHEMISTRY = 'chemistry',
    CS = 'computer_science'
}

export const fastTrackProgressEnabledBoards = [
    'ft_core_2017', 'ft_core_2018', 'ft_core_stage2',
    'ft_mech_year1_2018', 'ft_mech_year2_2018', 'ft_further_stage1_2018',
];

export const examBoardTagMap: {[examBoard: string]: string} = {
    [EXAM_BOARD.AQA]: "examboard_aqa",
    [EXAM_BOARD.OCR]: "examboard_ocr",
};

export const tagExamBoardMap: {[tag: string]: string} = invert(examBoardTagMap);

export enum TAG_ID {
    // CS ----
    // Categories
    theory = "theory",
    programming = "programming",

    // Theory sub-categories
    gcseToALevel = "gcse_to_a_level",
    dataStructuresAndAlgorithms = "data_structures_and_algorithms",
    computerNetworks = "computer_networks",
    computerSystems = "computer_systems",
    dataAndInformation = "data_and_information",
    // Programming sub-categories
    programmingParadigms = "programming_paradigms",
    programmingFundamentals = "programming_fundamentals",
    computingPracticalProject = "computing_practical_project",

    // GCSE to A level transition topics
    gcseBooleanLogic = "gcse_boolean_logic",
    gcseProgrammingConcepts = "gcse_programming_concepts",
    gcseNetworking = "gcse_networking",
    gcseDataRepresentation = "gcse_data_representation",
    gcseSystems = "gcse_systems",
    // Data structures and algorithms topics
    searchingSortingPathfinding = "searching_sorting_pathfinding",
    complexity = "complexity",
    theoryOfComputation = "theory_of_computation",
    computationalThinking = "computational_thinking",
    dataStructures = "data_structures",
    // Computer networks topics
    security = "security",
    networking = "networking",
    networkHardware = "network_hardware",
    communication = "communication",
    theInternet = "the_internet",
    // Computer systems topics
    booleanLogic = "boolean_logic",
    architecture = "architecture",
    hardware = "hardware",
    operatingSystemsAndSoftware = "operating_systems_and_software",
    translators = "translators",
    programmingLanguages = "programming_languages",
    // Data and information topics
    numberSystems = "number_systems",
    numberBases = "number_bases",
    representation = "representation",
    databases = "databases",
    bigData = "big_data",
    compression = "compression",
    encryption = "encryption",

    // Programming fundamentals topics
    programmingConcepts = "programming_concepts",
    subroutines = "subroutines",
    files = "files",
    recursion = "recursion",
    stringManipulation = "string_manipulation",
    guis = "guis",
    softwareEngineeringPrinciples = "software_engineering_principles",
    // Programming paradigms topics
    objectOrientedProgramming = "object_oriented_programming",
    functionalProgramming = "functional_programming",
    proceduralAndStructuredProgramming = "procedural_and_structured_programming",
    // Computing practical project topics
    softwareProject = "software_project",

    // PHY ----
    // Subjects
    physics = "physics",
    maths = "maths",
    chemistry = "chemistry",

    // Physics fields
    mechanics = "mechanics",
    waves = "waves",
    fields = "fields",
    circuits = "circuits",
    chemPhysics = "chemphysics",
    // Maths fields
    geometry = "geometry",
    calculus = "calculus",
    algebra = "algebra",
    functions = "functions",

    // Mechanics topics
    statics = "statics",
    dynamics = "dynamics",
    shm = "shm",
    angularMotion = "angular_motion",
    circularMotion = "circular_motion",
    kinematics = "kinematics",
    // Fields topics
    electric = "electric",
    magnetic = "magnetic",
    gravitational = "gravitational",
    combined = "combined",
    // Circuits topics
    resistors = "resistors",
    capacitors = "capacitors",
    generalCircuits = "general_circuits",
    // Waves topics:
    optics = "optics",
    superposition = "superposition",
    waveMotion = "wave_motion",
    // Physical Chemistry topics:
    thermodynamics = "thermodynamics",
    kinetics = "kinetics",

    // Geometry topics
    geomVectors = "geom_vectors",
    trigonometry = "trigonometry",
    shapes = "shapes",
    // Calculus topics
    differentiation = "differentiation",
    integration = "integration",
    differentialEq = "differential_eq",
    // Algebra topics
    simultaneous = "simultaneous",
    quadratics = "quadratics",
    manipulation = "manipulation",
    series = "series",
    complex_numbers = "complex_numbers",
    // Functions topics
    generalFunctions = "general_functions",
    graphSketching = "graph_sketching",
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
export enum SEARCH_RESULT_TYPE {SHORTCUT = "shortcut"}

export const documentDescription: {[documentType in DOCUMENT_TYPE]: string} = {
    [DOCUMENT_TYPE.CONCEPT]: "Concepts",
    [DOCUMENT_TYPE.QUESTION]: "Questions",
    [DOCUMENT_TYPE.FAST_TRACK_QUESTION]: "Questions",
    [DOCUMENT_TYPE.EVENT]: "Events",
    [DOCUMENT_TYPE.TOPIC_SUMMARY]: "Topics",
    [DOCUMENT_TYPE.GENERIC]: "Other pages",
    [DOCUMENT_TYPE.QUIZ]: "Quizzes",
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

export const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export const HOME_CRUMB = {title: "Home", to: "/"};
export const ALL_TOPICS_CRUMB = {title: "All topics", to: "/topics"};
export const ADMIN_CRUMB = {title: "Admin", to: "/admin"};
export const EVENTS_CRUMB = {title: "Events", to: "/events"};
export const ASSIGNMENT_PROGRESS_CRUMB = SITE_SUBJECT == SITE.PHY ?
    {title: "Assignment Progress", to: "/assignment_progress"} :
    {title: "My markbook", to: "/my_markbook"};

export enum UserRole {
    ADMIN = "ADMIN",
    EVENT_MANAGER = "EVENT_MANAGER",
    CONTENT_EDITOR = "CONTENT_EDITOR",
    EVENT_LEADER = "EVENT_LEADER",
    TEACHER = "TEACHER",
    STUDENT = "STUDENT"
}

export enum UserFacingRole {
    ADMIN = "Admin",
    EVENT_MANAGER = "Event Manager",
    CONTENT_EDITOR = "Content Editor",
    EVENT_LEADER = "Event Leader",
    TEACHER = "Teacher",
    STUDENT = "Student"
}

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

let _REVERSE_GREEK_LETTERS_MAP: { [key: string]: string } = {};
for(let entry of Object.entries(GREEK_LETTERS_MAP)) {
    _REVERSE_GREEK_LETTERS_MAP[entry[1]] = entry[0];
}
_REVERSE_GREEK_LETTERS_MAP["ε"] = "epsilon"; // Take this one in preference!
export const REVERSE_GREEK_LETTERS_MAP = _REVERSE_GREEK_LETTERS_MAP;


export enum QUESTION_CATEGORY {
    PROBLEM_SOLVING = "problem_solving"
}

export const specificDoughnutColours: { [key: string]: string } = {
    [SITE.PHY]: {
        "Physics": "#944cbe",
        "Maths": "#007fa9",
        "Chemistry": "#e22e25"
    },
    [SITE.CS]: {}
}[SITE_SUBJECT];

export const doughnutColours = {
    [SITE.PHY]: [
        "#944cbe",
        "#007fa9",
        "#e22e25",
        "#991846",
        "#448525",
        "#fea100"
    ],
    [SITE.CS]: [
        "#feae42",
        "#000000",
        "#e51f6f",
        "#ef67ac",
        "#bf6707",
        "#0f8294",
        "#aaaaaa",
        "#dbdbdb"
    ]
}[SITE_SUBJECT];

export const progressColour = {
    [SITE.PHY]: '#509E2E',
    [SITE.CS]: '#000000'
}[SITE_SUBJECT];

export const GRAY_120 = '#c9cad1';

export const SEARCH_CHAR_LENGTH_LIMIT = 255;
