export enum SITE {PHY = "physics", CS = "cs"}

function getSite() {
    try {
        // eslint-disable-next-line no-undef
        return ISAAC_SITE as SITE;
    } catch {
        return SITE.CS;
    }
}

export const SITE_SUBJECT = getSite();

export const SITE_SUBJECT_TITLE = {
    [SITE.PHY]: "Physics",
    [SITE.CS]: "Computer Science"
}[SITE_SUBJECT];

export const WEBMASTER_EMAIL = {
    [SITE.PHY]: "webmaster@isaacphysics.org",
    [SITE.CS]: "webmaster@isaaccomputerscience.org"
}[SITE_SUBJECT];

export const TEACHER_REQUEST_ROUTE = {
    [SITE.PHY]: "/pages/contact_us_teacher",
    [SITE.CS]: "/pages/teacher_accounts"
}[SITE_SUBJECT];

