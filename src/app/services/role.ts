
export function extractTeacherName(teacher: {givenName?: string; familyName?: string} | null) {
    if (null == teacher)
        return null;
    return (teacher.givenName ? teacher.givenName.charAt(0) + ". " : "") + teacher.familyName;
}
