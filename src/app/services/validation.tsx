

export const validateEmail = (email: string) => {
    return (email.length > 0 && email.includes("@"));
};

export const isDobOverThirteen = (dateOfBirth: Date | null) => {
    const today = new Date();
    const thirteenYearsAgo = new Date(today.getFullYear() - 13, today.getMonth(), today.getDate());
    const hundredAndTwentyYearsAgo = new Date(today.getFullYear() - 120, today.getMonth(), today.getDate());
    return !!dateOfBirth && dateOfBirth <= thirteenYearsAgo && dateOfBirth >= hundredAndTwentyYearsAgo;
};

export const MINIMUM_PASSWORD_LENGTH = 6;
export const validatePassword = (password: string) => {
    return password.length >= MINIMUM_PASSWORD_LENGTH;
};
