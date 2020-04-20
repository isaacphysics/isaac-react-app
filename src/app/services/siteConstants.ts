export enum SITE {PHY = "physics", CS = "cs"}
// eslint-disable-next-line no-undef
export const SITE_SUBJECT = ISAAC_SITE as SITE;

export const SITE_SUBJECT_TITLE = {
    [SITE.PHY]: "Physics",
    [SITE.CS]: "Computer Science"
}[SITE_SUBJECT];

export const WEBMASTER_EMAIL = {
    [SITE.PHY]: "webmaster@isaacphysics.org",
    [SITE.CS]: "webmaster@isaaccomputerscience.org"
}[SITE_SUBJECT];