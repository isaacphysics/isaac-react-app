import {SEARCH_RESULT_TYPE} from "./constants";
import {SITE_SUBJECT_TITLE} from "./siteConstants";

export const searchList = [
    {
        id: "assignments",
        title: "My assignments",
        terms: ["my assignments", "assignments", "homework", "hw"],
        summary: "View your assignments.",
        url: "/assignments",
        type: SEARCH_RESULT_TYPE.SHORTCUT
    }, {
        id: "join_group",
        title: "Teacher connections",
        terms: ["join group", "join class", "teacher connections", "class code", "join a class",
            "classes", "share token", "groups", "group", "join", "group code"],
        summary: "Join groups and manage your teacher connections.",
        url: "/account#teacherconnections",
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
        terms: ["my account", "account", "settings", "account settings", "password"],
        summary: "Click here to view and edit your account details.",
        url: "/account",
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
