export enum SITE {PHY = "physics", ADA = "ada"}
// eslint-disable-next-line no-undef
export const SITE_SUBJECT = ISAAC_SITE as SITE;

// Boolean representing if the current site is Isaac Physics
export const isPhy = SITE_SUBJECT === SITE.PHY;

// Boolean representing if the current site is Ada CS
export const isAda = SITE_SUBJECT === SITE.ADA;

// Picks between two arguments based on whether the site is Physics or Ada
export function siteSpecific<P, C>(phy: P, ada: C) {
    return isPhy ? phy : ada;
}

export const SITE_TITLE = siteSpecific("Isaac Physics", "Ada Computer Science");
export const SITE_TITLE_SHORT = siteSpecific("Isaac", "Ada");

export const WEBMASTER_EMAIL = siteSpecific("webmaster@isaacphysics.org", "webmaster@adacomputerscience.org");

export const TEACHER_REQUEST_ROUTE = siteSpecific("/pages/contact_us_teacher", "/pages/teacher_accounts");
