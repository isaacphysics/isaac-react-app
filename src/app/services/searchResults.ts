import {SEARCH_RESULT_TYPE} from "./constants";
import {SITE_SUBJECT_TITLE} from "./siteConstants";

export const searchList = [
    {
        id: "assignments",
        title: "My assignments",
        terms: ["my assignments", "assignments", "homework", "hw", "my assignment", "assign", "my isaac"],
        summary: "View your assignments.",
        url: "/assignments",
        type: SEARCH_RESULT_TYPE.SHORTCUT
    }, {
        id: "join_group",
        title: "Teacher connections",
        terms: ["join group", "join class", "teacher connections", "teacher connection", "class code", "join a class",
            "classes", "share token", "groups", "group", "join", "group code", "code", "token", "teacher code",
            "teachers connections", "join a group", "teacher conections", "teacher connect", "teachers connection"],
        summary: "Join groups and manage your teacher connections.",
        url: "/account",
        hash: "teacherconnections",
        type: SEARCH_RESULT_TYPE.SHORTCUT
    }, {
        id: "logout",
        title: "Logout",
        terms: ["logout", "log out", "sign out", "signout"],
        summary: "You can logout using the link in the header, or by clicking here.",
        url: "/logout",
        type: SEARCH_RESULT_TYPE.SHORTCUT
    }, {
        id: "help",
        title: "Student support",
        terms: ["help", "support"],
        summary: `View student FAQs for using Isaac ${SITE_SUBJECT_TITLE}.`,
        url: "/support/student/general",
        type: SEARCH_RESULT_TYPE.SHORTCUT
    }, {
        id: "login",
        title: "Login",
        terms: ["login", "log in", "signin", "sign in"],
        summary: "You can log in using the link in the header, or by clicking here.",
        url: "/login",
        type: SEARCH_RESULT_TYPE.SHORTCUT
    }, {
        id: "register",
        title: "Create an account",
        terms: ["register", "signup", "sign up"],
        summary: `Click here to register for an Isaac ${SITE_SUBJECT_TITLE} account.`,
        url: "/register",
        type: SEARCH_RESULT_TYPE.SHORTCUT
    },  {
        id: "teacher_support",
        title: "Teacher support",
        terms: ["teacher", "teacher support", "teaching", "teachers", "help", "support"],
        summary: `View teacher FAQs for using Isaac ${SITE_SUBJECT_TITLE}.`,
        url: "/support/teacher/assignments",
        type: SEARCH_RESULT_TYPE.SHORTCUT
    }, {
        id: "my_account",
        title: "My account",
        terms: ["my account", "account", "settings", "account settings", "password", "emails", "email preferences",
            "preferences", "my isaac"],
        summary: "Click here to view and edit your account details.",
        url: "/account",
        type: SEARCH_RESULT_TYPE.SHORTCUT
    }, {
        id: "ambassador",
        title: "Ambassador",
        terms: ["ambassador"],
        summary: "View ambassador information",
        url: "/support/teacher/partner",
        hash: "ambassadors",
        type: SEARCH_RESULT_TYPE.SHORTCUT
    }, {
        id: "embedded_school",
        title: "Embedded schools",
        terms: ["embedded school"],
        summary: "View embedded school information",
        url: "/support/teacher/partner",
        hash: "embedded_schools",
        type: SEARCH_RESULT_TYPE.SHORTCUT
    }, {
        id: "edit_group_managers",
        title: "Edit group managers",
        terms: ["edit group managers"],
        summary: "View information on editing group managers",
        url: "/support/teacher/general",
        hash: "create_group",
        type: SEARCH_RESULT_TYPE.SHORTCUT
    }, {
        id: "email_notifications",
        title: "Email notifications",
        terms: ["email notifications"],
        summary: "View email notification information",
        url: "/support/teacher/troubleshooting",
        hash: "email_preferences",
        type: SEARCH_RESULT_TYPE.SHORTCUT
    }, {
        id: "ske",
        title: "Ske",
        terms: ["ske"],
        summary: "View ske information",
        url: "/support/teacher/direct",
        hash: "teacher_mentoring",
        type: SEARCH_RESULT_TYPE.SHORTCUT
    }, {
        id: "spreadsheet_of_questions",
        title: "Spreadsheet of questions",
        terms: ["spreadsheet of questions"],
        summary: "View a spreadsheet of questions",
        url: "/support/teacher/suggestions",
        hash: "spreadsheet",
        type: SEARCH_RESULT_TYPE.SHORTCUT
    }, {
        id: "constants",
        title: "Physical constants",
        terms: ["constants", "value of g", "value of epsilon0", "value of e", "value of h", "physical constants", "table of constants"],
        summary: "View a list of constants",
        url: "/solving_problems",
        hash: "physical_constants",
        type: SEARCH_RESULT_TYPE.SHORTCUT
    }, {
        id: "equation_editor",
        title: "Equation editor help",
        terms: ["equation editor", "equation editor help"],
        summary: "Information about the symbolic editor",
        url: "/solving_problems",
        hash: "symbolic",
        type: SEARCH_RESULT_TYPE.SHORTCUT
    }, {
        id: "significant_figures",
        title: "Significant figures",
        terms: ["significant figures", "sig figs", "sig fig", "sf"],
        summary: "Help on significant figures",
        url: "/solving_problems",
        hash: "acc_solving_problems_sig_figs",
        type: SEARCH_RESULT_TYPE.SHORTCUT
    }

];

let group = /^[ABCDEFGHJKLMNPQRTUVWXYZ2346789]{6}$/;

export function shortcuts(term: string) {
    let lterm = term.toLowerCase();
    let response = [];
    if (group.test(term)) {
        response.push({
            id: "teacher_connections",
            title: "Teacher Connections",
            terms: ["connect", "teacher connection"],
            summary: "Click here to connect to a teacher using the code you entered.",
            url: ("/account?authToken=" + term),
            type: SEARCH_RESULT_TYPE.SHORTCUT
        });
    }
    else {
        for (let i in searchList) {
            for (let j in searchList[i].terms) {
                if (searchList[i].terms[j] === lterm) {
                    response.push(searchList[i]);
                }
            }
        }
    }
    return response;
}
