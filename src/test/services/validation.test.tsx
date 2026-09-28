import {EMAIL_PREFERENCE_DEFAULTS, isAda, validateRequiredFields} from "../../app/services";
import {ValidationUser} from "../../IsaacAppTypes";
import {UserPreferencesDTO} from "../../IsaacAppTypes";
import {UserContext, UserRole} from "../../IsaacApiTypes";

const testUser = {
    user: {
        familyName: "Smith",
        givenName: "John",
        email: "john.smith@example.com",
        role: "STUDENT",
        countryCode: "GB-IE",
        schoolId: "12345",
        schoolOther: undefined,
        password: null
    },
    prefs: {
        EMAIL_PREFERENCE: {
            NEWS_AND_UPDATES: false,
            ASSIGNMENTS: true,
            EVENTS: false
        }
    },
    contexts: [{
        stage: "gcse",
        examBoard: "aqa",
    }]
} satisfies {
    user: ValidationUser;
    prefs: UserPreferencesDTO;
    contexts: UserContext[];
};

describe('Required field validation', () => {
    it.each(['STUDENT', 'TUTOR', 'TEACHER'] as UserRole[])("requires names, email for %s", (role) => {
        // Arrange
        const user = {...testUser, user: {...testUser.user, role: role, familyName: undefined, givenName: undefined, email: undefined}};

        // Act
        const actual = validateRequiredFields(user.user, user.prefs, user.contexts);

        // Assert
        expect(actual).toMatchObject({
            "email": false,
            "familyName": false,
            "givenName": false,
        });
    });

    if(isAda) {
        it.each(['STUDENT', 'TUTOR', 'TEACHER'] as UserRole[])("requires country code for %s on Ada CS", (role) => {
            // Arrange
            const user = {...testUser, user: {...testUser.user, role: role, countryCode: undefined}};

            // Act
            const actual = validateRequiredFields(user.user, user.prefs, user.contexts);

            // Assert
            const expected = {
                "countryCode": false,
            };
            expect(actual).toMatchObject(expected);
        });

    } else {
        it.each(['STUDENT', 'TUTOR', 'TEACHER'] as UserRole[])("requires country code for %s on Isaac", (role) => {
            // Arrange
            const user = {...testUser, user: {...testUser.user, role: role, countryCode: undefined}};

            // Act
            const actual = validateRequiredFields(user.user, user.prefs, user.contexts);

            // Assert
            const expected = {
                "countryCode": false,
            };
            expect(actual).toMatchObject(expected);
        });
    }

    if (isAda) {
        it.each(['STUDENT', 'TUTOR'] as UserRole[])("does not require school for %s on Ada CS", (role) => {
            // Arrange
            const user = {...testUser, user: {...testUser.user, role: role, schoolId: undefined}};

            // Act
            const actual = validateRequiredFields(user.user, user.prefs, user.contexts);

            // Assert
            const expected = {
                "school": true,
            };
            expect(actual).toMatchObject(expected);
        });

        it("requires school for TEACHER on Ada CS", () => {
            // Arrange
            const teacher = {...testUser, user: {...testUser.user, role: "TEACHER", schoolId: undefined} satisfies ValidationUser};

            // Act
            const actual = validateRequiredFields(teacher.user, teacher.prefs, teacher.contexts);

            // Assert
            const expected = {
                "school": false,
            };
            expect(actual).toMatchObject(expected);
        });

    } else {
        it.each(['STUDENT', 'TUTOR', 'TEACHER'] as UserRole[])("does not require school for %s on Isaac", (role: UserRole) => {
            // Arrange
            const user = {...testUser, user: {...testUser.user, schoolId: undefined, role: role}};

            // Act
            const actual = validateRequiredFields(user.user, user.prefs, user.contexts);

            // Assert
            const expected = {
                "school": true,
            };
            expect(actual).toMatchObject(expected);
        });
    }

    if(isAda) {
        it.each(['STUDENT', 'TUTOR', 'TEACHER'] as UserRole[])("does not require non-default user context for %s on Ada CS", (role) => {
            // Arrange
            const user = {...testUser, user: {...testUser.user, role: role}, contexts: []};

            // Act
            const actual = validateRequiredFields(user.user, user.prefs, user.contexts);

            // Arrange
            const expected = {
                "userContexts": true,
            };
            expect(actual).toMatchObject(expected);
        });
    } else {
        it.each(['STUDENT', 'TUTOR', 'TEACHER'] as UserRole[])("requires non-default user context for %s on Isaac", (role) => {
            // Arrange
            const user = {...testUser, user: {...testUser.user, role: role}, contexts: []};

            // Act
            const actual = validateRequiredFields(user.user, user.prefs, user.contexts);

            // Arrange
            const expected = {
                "userContexts": false
            };
            expect(actual).toMatchObject(expected);
        });
    }

    it.each(['STUDENT', 'TUTOR', 'TEACHER'] as UserRole[])("requires non-default email preferences for %s", (role) => {
        // Arrange
        const user = {...testUser, user: {...testUser.user, role: role}, prefs: {"EMAIL_PREFERENCE": EMAIL_PREFERENCE_DEFAULTS}};

        // Act
        const actual = validateRequiredFields(user.user, user.prefs, user.contexts);

        // Arrange
        const expected = {
            "emailPreferences": false,
        };
        expect(actual).toMatchObject(expected);
    });

    if (isAda) {
        it.each(['STUDENT', 'TUTOR', 'TEACHER'] as UserRole[])("requires specified gender for %s for Ada CS", (role) => {
            // Arrange
            const user = {...testUser, user: {...testUser.user, role: role, gender: undefined}};

            // Act
            const actual = validateRequiredFields(user.user, user.prefs, user.contexts);

            // Assert
            const expected = {
                "gender": false,
            };
            expect(actual).toMatchObject(expected);
        });
    } else {
        it.each(['STUDENT', 'TUTOR', 'TEACHER'] as UserRole[])("does not require specified gender for %s for Isaac", (role) => {
            // Arrange
            const user = {...testUser, user: {...testUser.user, role: role, gender: undefined}};

            // Act
            const actual = validateRequiredFields(user.user, user.prefs, user.contexts);

            // Assert
            const expected = {
                "gender": true,
            };
            expect(actual).toMatchObject(expected);
        });
    }

    if (isAda) {
        it.each(['STUDENT', 'TUTOR', 'TEACHER'] as UserRole[])("requires specified date of birth for %s for Ada CS", (role) => {
            // Arrange
            const user = {...testUser, user: {...testUser.user, role: role, dateOfBirth: undefined}};

            // Act
            const actual = validateRequiredFields(user.user, user.prefs, user.contexts);

            // Assert
            const expected = {
                "dateOfBirth": false,
            };
            expect(actual).toMatchObject(expected);
        });
    } else {
        it.each(['STUDENT', 'TUTOR', 'TEACHER'] as UserRole[])("does not require specified date of birth for %s for Isaac", (role) => {
            // Arrange
            const user = {...testUser, user: {...testUser.user, role: role, dateOfBirth: undefined}};

            // Act
            const actual = validateRequiredFields(user.user, user.prefs, user.contexts);

            // Assert
            const expected = {
                "dateOfBirth": true,
            };
            expect(actual).toMatchObject(expected);
        });
    }
});
