import {ZxcvbnResult} from "../../IsaacAppTypes";
import {SITE, SITE_SUBJECT} from "./siteConstants";

export const passwordStrengthText: {[score: number]: string} = {
    0: "Very Weak",
    1: "Weak",
    2: "Fair",
    3: "Strong",
    4: "Very Strong"
};

const zxcvbnSrc = {
    [SITE.CS]: 'https://cdn.isaaccomputerscience.org/vendor/dropbox/zxcvbn-isaac.js',
    [SITE.PHY]: 'https://cdn.isaacphysics.org/vendor/dropbox/zxcvbn-isaac.js'
};


export function loadZxcvbnIfNotPresent() {
    // Since zxcvbn.js is ~1MB we only want to load it when it is genuinely required.
    // We also don't want to load it if we already have:
    let zxcvbnScriptId = "zxcvbn-script";
    if (!('zxcvbn' in window) && !document.getElementById(zxcvbnScriptId)) {
        let zxcvbnScript = document.createElement('script');
        zxcvbnScript.id = zxcvbnScriptId;
        zxcvbnScript.src = zxcvbnSrc[SITE_SUBJECT];
        zxcvbnScript.type = 'text/javascript';
        zxcvbnScript.async = true;
        document.head.appendChild(zxcvbnScript);
    }
}

const maxPasswordCheckChars = 50;  // Check only the first maxPasswordCheckChars of a password.

function calculatePasswordStrength(password: string, firstName?: string, lastName?: string, email?: string) {
    if (!password || !('zxcvbn' in window)) {
        // Fail fast on empty input or if library not loaded!
        return null;
    }
    let isaacTerms = ["Isaac Computer Science", "Isaac", "IsaacComputerScience", "isaaccomputerscience.org",
        "Isaac Computer", "Isaac CS", "IsaacCS", "ICS",
        "ComputerScience", "Computer Science", "Computer", "Science", "CompSci", "Computing",
        "Isaac Physics", "Isaac Chemistry", "Isaac Maths", "IsaacPhysics", "IsaacChemistry", "IsaacMaths",
        "Physics", "Chemistry", "Maths", "Biology", "Phy", "Phys", "Math", "Mathematics", "Physical",
        "isaacphysics.org", "isaacchemistry.org", "isaacmaths.org",
        "Quantum", "Relativity", "Pi", "Newton", "Apple", "Hexagon",
        "Cambridge", "University", "Raspberry Pi", "Raspberry",
        "A Level", "ALevel", "A-Level", "Homework", "Classroom", "School", "College", "Lesson", "Revision",
        "http", "https", "https://", firstName, lastName, email];
    let passwordToCheck = password.substring(0, maxPasswordCheckChars).replace(/\s/g, "");
    let feedback: ZxcvbnResult = (window as any)['zxcvbn'](passwordToCheck, isaacTerms);
    return feedback;
}


let timer: any = null;

export function passwordDebounce(password: string, callback: (feedback: ZxcvbnResult|null) => void) {
    if (timer !== null) {
        clearTimeout(timer);
    }
    timer = setTimeout(() => callback(calculatePasswordStrength(password)), 300);
}
