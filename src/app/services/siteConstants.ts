export enum SITE {PHY = "physics", CS = "cs"}
// eslint-disable-next-line no-undef
export const SITE_SUBJECT = ISAAC_SITE as SITE;

// Boolean representing if the current site is Isaac Physics
export const isPhy = SITE_SUBJECT === SITE.PHY;

// Boolean representing if the current site is Isaac CS
export const isCS = SITE_SUBJECT === SITE.CS;

// Picks between two arguments based on whether the site is Physics or CS
export function siteSpecific<P, C>(phy: P, cs: C) {
    return isPhy ? phy : cs;
}

export const SITE_SUBJECT_TITLE = siteSpecific("Physics", "Computer Science");

export const WEBMASTER_EMAIL = siteSpecific("webmaster@isaacphysics.org", "webmaster@isaaccomputerscience.org");

export const TEACHER_REQUEST_ROUTE = siteSpecific("/pages/contact_us_teacher", "/pages/teacher_accounts");
