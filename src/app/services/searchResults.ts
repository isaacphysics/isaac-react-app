import {HUMAN_STAGES, HUMAN_SUBJECTS, isValidStageSubjectPair, PATHS, SEARCH_RESULT_TYPE, SITE_TITLE, siteSpecific, STAGE_TO_LEARNING_STAGE, Subject} from "./";
import {SearchShortcut} from "../../IsaacAppTypes";
import {Stage} from "../../IsaacApiTypes";

const searchList: SearchShortcut[] = [
    {
        id: "assignments",
        title: "My assignments",
        terms: ["my assignments", "assignments", "assignment", "homework", "hw", "my assignment", "assign", "my isaac", ...(siteSpecific(["quiz", "quizzes"], []))],
        summary: "View your assignments.",
        url: "/assignments",
        type: SEARCH_RESULT_TYPE.SHORTCUT
    }, {
        id: "join_group",
        title: "Teacher connections",
        terms: ["join group", "join class", "teacher connections", "teacher connection", "class code", "join a class",
            "classes", "class", "share token", "groups", "group", "join", "group code", "code", "token", "teacher code",
            "teachers connections", "join a group", "teacher conections", "teacher connect", "teachers connection",
            "teacher", "connections"],
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
        summary: `View student FAQs for using ${SITE_TITLE}.`,
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
        summary: `Click here to register for an ${SITE_TITLE} account.`,
        url: "/register",
        type: SEARCH_RESULT_TYPE.SHORTCUT
    }, {
        id: "teacher_support",
        title: "Teacher support",
        terms: ["teacher", "teacher support", "teaching", "teachers", "help", "teacher account",
            "support", "tutor", "tutor support", "tutors", "tutoring"],
        summary: `View teacher FAQs for using ${SITE_TITLE}.`,
        url: "/support/teacher/general",
        type: SEARCH_RESULT_TYPE.SHORTCUT
    }, {
        id: "my_account",
        title: "My account",
        terms: ["my account", "account", "settings", "account settings", "password", "emails", "email preferences",
            "preferences", "my isaac", "my ada"],
        summary: "Click here to view and edit your account details.",
        url: "/account",
        type: SEARCH_RESULT_TYPE.SHORTCUT
    }, {
        id: "glossary",
        title: "Glossary",
        terms: ["glossary"],
        summary: "View the definitions of technical terms used on the site.",
        url: "/glossary",
        type: SEARCH_RESULT_TYPE.SHORTCUT
    }, {
        id: "question_finder",
        title: "Question finder",
        terms: ["question finder", "questions", "question search", "practice questions"],
        summary: "Find questions to try by topic and difficulty.",
        url: PATHS.QUESTION_FINDER,
        type: SEARCH_RESULT_TYPE.SHORTCUT
    }, {
        id: "my_progress",
        title: "My progress",
        terms: ["progress", "my progress", siteSpecific("my isaac", "my ada")],
        summary: `View your ${SITE_TITLE} progress.`,
        url: "/progress",
        type: SEARCH_RESULT_TYPE.SHORTCUT
    }
];

const siteShortcuts: SearchShortcut[] = siteSpecific([
    // Physics:
    {
        id: "ambassador",
        title: "Ambassador",
        terms: ["ambassador", "ambassadors", "isaac ambassador"],
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
        terms: ["spreadsheet of questions", "spreadsheet"],
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
    }, {
        id: "answers",
        title: "Answers",
        terms: ["answers", "book answers", "physics answers"],
        summary: "Where are the answers?",
        url: "/support/student/questions",
        hash: "answers",
        type: SEARCH_RESULT_TYPE.SHORTCUT
    }, {
        id: "my_gameboards",
        title: "My question decks",
        terms: ["gameboards", "gameboard", "my gameboards", "boards", "question deck", "question decks", "my question decks", "decks"],
        summary: "View your saved question decks.",
        url: PATHS.MY_GAMEBOARDS,
        hash: "my_gameboards",
        type: SEARCH_RESULT_TYPE.SHORTCUT
    }, {
        id: "events",
        title: "Events",
        terms: ["events", "classes"],
        summary: "Our events for students and teachers.",
        url: "/events",
        hash: "events",
        type: SEARCH_RESULT_TYPE.SHORTCUT
    }, {
        id: "physics",
        title: "Isaac Physics",
        terms: ["physics", "isaac physics", "phy"],
        url: "/physics",
        tags: ["physics"],
        type: SEARCH_RESULT_TYPE.SHORTCUT
    }, {
        id: "maths",
        title: "Isaac Maths",
        terms: ["maths", "isaac maths", "math", "isaac math"],
        url: "/maths",
        tags: ["maths"],
        type: SEARCH_RESULT_TYPE.SHORTCUT
    }, {
        id: "chemistry",
        title: "Isaac Chemistry",
        terms: ["chemistry", "isaac chemistry", "chem"],
        url: "/chemistry",
        tags: ["chemistry"],
        type: SEARCH_RESULT_TYPE.SHORTCUT
    }, {
        id: "biology",
        title: "Isaac Biology",
        terms: ["biology", "isaac biology", "bio"],
        url: "/biology",
        tags: ["biology"],
        type: SEARCH_RESULT_TYPE.SHORTCUT
    }, {
        id: "computer_science",
        title: "Ada Computer Science",
        terms: ["ada", "computer science", "ada computer science", "computing", "cs", "ada cs"],
        summary: "Ada Computer Science, our partner platform",
        url: "/computer_science",
        type: SEARCH_RESULT_TYPE.SHORTCUT
    }, {
        id: "further_maths",
        title: "Further Maths question decks (pure)",
        terms: ["further maths", "further math", "further", "fm"],
        summary: "Question decks for pure topics in A Level Further Maths",
        url: "/maths/a_level/question_decks#further",
        type: SEARCH_RESULT_TYPE.SHORTCUT
    }, {
        id: "further_stats",
        title: "Further Maths question decks (statistics)",
        terms: ["further maths", "further math", "further", "fm", "further stats", "stats", "statistics"],
        summary: "Question decks for statistics topics in A Level Further Maths",
        url: "/maths/a_level/question_decks#further_stats",
        type: SEARCH_RESULT_TYPE.SHORTCUT
    }, {
        id: "books",
        title: "Isaac Books",
        terms: ["books", "book", "isaac books"],
        summary: "Isaac books: in print and online",
        url: "/books",
        type: SEARCH_RESULT_TYPE.SHORTCUT
    }, {
        id: "phy_tests",
        title: "Physics practice admissions tests",
        terms: ["pat", "esat"],
        summary: "Use tests to prepare for university admissions tests. These tests are available for you to freely attempt.",
        url: "/physics/university/practice_tests",
        type: SEARCH_RESULT_TYPE.SHORTCUT
    }, {
        id: "maths_tests",
        title: "Maths practice admissions tests",
        terms: ["tmua", "esat"],
        summary: "Use tests to prepare for university admissions tests. These tests are available for you to freely attempt.",
        url: "/maths/university/practice_tests",
        type: SEARCH_RESULT_TYPE.SHORTCUT
    }, {
        id: "chem_tests",
        title: "Chemistry practice admissions tests",
        terms: ["esat"],
        summary: "Use tests to prepare for university admissions tests. These tests are available for you to freely attempt.",
        url: "/chemistry/university/practice_tests",
        type: SEARCH_RESULT_TYPE.SHORTCUT
    }, {
        id: "bio_tests",
        title: "Biology practice admissions tests",
        terms: ["esat"],
        summary: "Use tests to practise a range of topics. These tests are available for you to freely attempt.",
        url: "/biology/a_level/practice_tests",
        type: SEARCH_RESULT_TYPE.SHORTCUT
    }, {
        id: "teacher_features",
        title: "Teacher features",
        terms: ["teacher", "teaching", "teachers", "teacher account", "teacher features"],
        summary: "View teacher features on Isaac Science.",
        url: "/teacher_features",
        type: SEARCH_RESULT_TYPE.SHORTCUT
    }, {
        id: "tutor_support",
        title: "Tutor support",
        terms: ["tutor", "tutor support", "tutoring", "tutors", "tutor account", "help", "support"],
        summary: "View tutor FAQs for using Isaac Science.",
        url: "/support/tutor/general",
        type: SEARCH_RESULT_TYPE.SHORTCUT
    }, {
        id: "tutor_features",
        title: "Tutor features",
        terms: ["tutor", "tutoring", "tutors", "tutor account", "tutor features"],
        summary: "View tutor features on Isaac Science.",
        url: "/tutor_features",
        type: SEARCH_RESULT_TYPE.SHORTCUT
    }
],
// Ada:
[
    // No Ada-specific shortcuts currently
]);
searchList.push(...siteShortcuts);

const group = /^[ABCDEFGHJKLMNPQRTUVWXYZ2346789]{6}$/;

const stages = /(year 9|gcse|a( |-)level|university)/;
const subjects = /(physics|maths|chemistry|biology)/;
const stageAndSubject = new RegExp(`${stages.source} ${subjects.source}|${subjects.source} ${stages.source}`);

export function shortcuts(term: string) {
    const lterm = decodeURIComponent(term).toLowerCase();
    const response = [];
    if (group.test(term)) {
        response.push({
            id: "teacher_connections",
            title: "Teacher Connections",
            terms: ["connect", "teacher connection"],
            summary: "Click here to connect to a teacher using the code you entered.",
            url: ("/account?authToken=" + term),
            type: SEARCH_RESULT_TYPE.SHORTCUT
        });
    } else if (stageAndSubject.test(lterm)) {
        const subject = lterm.match(subjects)![0].toString();
        const stage = lterm.match(stages)![0].toString().replace(/[- ]/g, "_");
        const learningStage = STAGE_TO_LEARNING_STAGE[stage as Stage];
        if (learningStage && isValidStageSubjectPair(subject as Subject, learningStage)) {
            response.push({
                id: `${learningStage} ${subject}`,
                title: `${HUMAN_STAGES[learningStage]} ${HUMAN_SUBJECTS[subject]}`,
                url: `/${subject}/${learningStage}`,
                tags: [subject],
                type: SEARCH_RESULT_TYPE.SHORTCUT
            });
        }
    } else {
        for (const i in searchList) {
            for (const j in searchList[i].terms) {
                if (searchList[i].terms[j] === lterm) {
                    response.push(searchList[i]);
                }
            }
        }
    }
    return response;
}
