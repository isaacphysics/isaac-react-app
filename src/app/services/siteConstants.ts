export enum SITE {SCI = "sci", ADA = "ada"}
 
export const SITE_SUBJECT = ISAAC_SITE as SITE;

// Boolean representing if the current site is Isaac Physics
export const isPhy = SITE_SUBJECT === SITE.SCI;

// Boolean representing if the current site is Ada CS
export const isAda = SITE_SUBJECT === SITE.ADA;

// Picks between two arguments based on whether the site is Physics or Ada
export const siteSpecific = <P, C>(phy: P, ada: C): P | C => isPhy ? phy : ada;

export const SITE_TITLE = siteSpecific("Isaac Science", "Ada Computer Science");
export const SITE_TITLE_SHORT = siteSpecific("Isaac", "Ada CS");

export const WEBMASTER_EMAIL = siteSpecific("webmaster@isaacscience.org", "webmaster@adacomputerscience.org");

export const TEACHER_REQUEST_ROUTE = siteSpecific("/pages/contact_us_teacher", "/teacher_account_request");
