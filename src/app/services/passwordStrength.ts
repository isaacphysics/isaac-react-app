import {PasswordFeedback, ZxcvbnResult} from "../../IsaacAppTypes";
import axios from "axios";

export const passwordStrengthText: {[score: number]: string} = {
    0: "Very Weak",
    1: "Weak",
    2: "Fair",
    3: "Strong",
    4: "Very Strong"
};

const zxcvbnSrc = 'https://cdn.isaaccomputerscience.org/vendor/dropbox/zxcvbn-isaac.js';


export function loadZxcvbnIfNotPresent() {
    // Since zxcvbn.js is ~1MB we only want to load it when it is genuinely required.
    // We also don't want to load it if we already have:
    const zxcvbnScriptId = "zxcvbn-script";
    if (!('zxcvbn' in window) && !document.getElementById(zxcvbnScriptId)) {
        const zxcvbnScript = document.createElement('script');
        zxcvbnScript.id = zxcvbnScriptId;
        zxcvbnScript.src = zxcvbnSrc;
        zxcvbnScript.type = 'text/javascript';
        zxcvbnScript.async = true;
        document.head.appendChild(zxcvbnScript);
    }
}

const maxPasswordCheckChars = 50;  // Check only the first maxPasswordCheckChars of a password.

function calculatePasswordStrength(password: string, additionalTerms?: string[]) {
    if (!password || !('zxcvbn' in window)) {
        // Fail fast on empty input or if library not loaded!
        return null;
    }
    const isaacTerms = ["Isaac Computer Science", "Isaac", "IsaacComputerScience", "isaaccomputerscience.org",
        "Isaac Computer", "Isaac CS", "IsaacCS", "ICS",
        "ComputerScience", "Computer Science", "Computer", "Science", "CompSci", "Computing",
        "Isaac Physics", "Isaac Chemistry", "Isaac Maths", "IsaacPhysics", "IsaacChemistry", "IsaacMaths",
        "Physics", "Chemistry", "Maths", "Biology", "Phy", "Phys", "Math", "Mathematics", "Physical",
        "isaacphysics.org", "isaacchemistry.org", "isaacmaths.org", "isaacbiology.org",
        "Quantum", "Relativity", "Pi", "Newton", "Apple", "Hexagon",
        "Cambridge", "University", "Raspberry Pi", "Raspberry",
        "A Level", "ALevel", "A-Level", "Homework", "Classroom", "School", "College", "Lesson", "Revision",
        "http", "https", "https://"];
    if (additionalTerms) {
        isaacTerms.push(...additionalTerms);
    }
    const passwordToCheck = password.substring(0, maxPasswordCheckChars).replace(/\s/g, "");
    const zxcvbnResult: ZxcvbnResult = (window as any)['zxcvbn'](passwordToCheck, isaacTerms);
    const feedback: PasswordFeedback = {zxcvbn: zxcvbnResult, feedbackText: passwordStrengthText[zxcvbnResult.score]};
    return feedback;
}


// Pwned Passwords Functionality:

export const pwnedPasswordsAPI = axios.create({
    baseURL: "https://api.pwnedpasswords.com/",
});

async function getSHA1Hash(value: string) {
    const bytes = await window.crypto.subtle.digest({name: "SHA-1"}, new TextEncoder().encode(value));
    return Array.from(new Uint8Array(bytes)).map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
}
function breachedPasswordUseCount(responseData: string, sha1Suffix: string) {
    const lines = responseData.split('\n');
    for (const line of lines) {
        if (line.indexOf(sha1Suffix) === 0) {
            return parseInt(line.split(":")[1]);
        }
    }
    return 0;
}

export async function checkPwnedPasswords(password: string, callback: (feedback: PasswordFeedback|null) => void) {
    try {
        const sha1Hex = await getSHA1Hash(password)
        const sha1Prefix = sha1Hex.substr(0, 5);
        const sha1Suffix = sha1Hex.substring(5);
        const pwnedPasswordResponse = await pwnedPasswordsAPI.get(`/range/${sha1Prefix}`);
        const useCount = breachedPasswordUseCount(pwnedPasswordResponse.data, sha1Suffix);
        let feedback: PasswordFeedback | null = null;
        if (useCount > 10000) {
            feedback = {feedbackText: "Useless", pwnedPasswordCount: useCount};
        } else if (useCount >= 100) {
            feedback = {feedbackText: passwordStrengthText[0], pwnedPasswordCount: useCount};
        } else if (useCount > 0) {
            feedback = {feedbackText: passwordStrengthText[1], pwnedPasswordCount: useCount};
        }
        if (feedback) {
            callback(feedback);
        }
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Failed to get Pwned Passwords response, skipping!")
    }
}

// Debouncing:

let timer: any = null;

export function passwordDebounce(password: string, callback: (feedback: PasswordFeedback|null) => void) {
    if (timer !== null) {
        clearTimeout(timer);
    }
    timer = setTimeout(() => {
        callback(calculatePasswordStrength(password));
        //checkPwnedPasswords(password, callback);
    }, 350);
}
