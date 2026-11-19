// The English text both sites use: one file (namespace) per area of the site, so translators can see what
// they're working on. Each site's own file (ada.json / sci.json) is added in src/i18n.ts and src/test/i18nForTests.ts.
import common from "./en/common.json";
import account from "./en/account.json";
import teaching from "./en/teaching.json";
import questions from "./en/questions.json";
import pages from "./en/pages.json";
import events from "./en/events.json";
import admin from "./en/admin.json";

export const sharedEnglish = { common, account, teaching, questions, pages, events, admin };
export const SHARED_NAMESPACES = Object.keys(sharedEnglish);
