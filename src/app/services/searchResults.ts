
export const searchList = [
    {
        id: "assignments",
        title: "My Assignments",
        terms: ["my assignments", "assignments", "homework", "assignemts"],
        summary: "View your assignments.",
        url: "/assignments",
        type: "shortcut"
    }, {
        id: "join_group",
        title: "Teacher Connections",
        terms: ["join group", "join class", "teacher connections", "class code", "join a class", "classes", "share token", "groups", "group"],
        summary: "Join groups and manage your teacher connections.",
        url: "/account#teacherconnections",
        type: "shortcut"
    }, {
        id: "logout",
        title: "Logout",
        terms: ["logout"],
        summary: "You can logout using the link in the menu, or by clicking here.",
        url: "/logout",
        type: "shortcut"
    }, {
        id: "spc",
        title: "Senior Physics Challenge",
        terms: ["senior physics challenge", "spc", "masterclass", "bootcamp"],
        summary: "Learn more about the Senior Physics Challenge.",
        url: "/spc",
        type: "shortcut"
    }, {
        id: "help",
        title: "Student Support",
        terms: ["help", "support"],
        summary: "View student FAQs for using Isaac Physics.",
        url: "/support/student/general",
        type: "shortcut"
    }, {
        id: "login",
        title: "Login",
        terms: ["login", "sign up", "register"],
        summary: "You can login using the link in the menu, or by clicking here.",
        url: "/login",
        type: "shortcut"
    }, {
        id: "register",
        title: "Create an Account",
        terms: ["register"],
        summary: "Click here to register for an Isaac account.",
        url: "/register",
        type: "shortcut"
    }, {
        id: "chemistry",
        title: "Isaac Chemistry",
        terms: ["chemistry", "isaac chemistry", "chem"],
        summary: "View our Chemistry material.",
        url: "/chemistry",
        type: "shortcut"
    }, {
        id: "teacher_support",
        title: "Teacher Support",
        terms: ["teacher", "teacher support", "teaching", "teachers", "help", "support"],
        summary: "View teacher FAQs for using Isaac Physics.",
        url: "/support/teacher/assignments",
        type: "shortcut"
    }, {
        id: "answers",
        title: "Where can I find answers?",
        terms: ["answers", "solutions", "worked answers", "working"],
        summary: "We don't provide answers to Isaac questions. Learn more here.",
        url: "/answers",
        type: "shortcut"
    }, {
        id: "my_account",
        title: "My Account",
        terms: ["my account", "account", "settings", "account settings", "password"],
        summary: "Click here to view and edit your account details.",
        url: "/account",
        type: "shortcut"
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
            type: "shortcut"
        });
    }
    else {
        for (var i in searchList) {
            for (var j in searchList[i].terms) {
                if (searchList[i].terms[j] === lterm) {
                    response.push(searchList[i]);
                }
            }
        }
    }
    return response;
};
