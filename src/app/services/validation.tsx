

export const validateEmail = (email: string) => {
    return (email.length > 0 && email.includes("@"));
};

export const validateDob = (dateOfBirth: string) => {
    const today = new Date();
    const thirteenYearsAgo = Date.UTC(today.getFullYear() - 13, today.getMonth(), today.getDate())/1000;
    return (dateOfBirth == undefined || (new Date(String(dateOfBirth)).getTime() / 1000) <= thirteenYearsAgo);
};

export const MINIMUM_PASSWORD_LENGTH = 6;
export const validatePassword = (password: string) => {
    return password.length >= MINIMUM_PASSWORD_LENGTH;
};
