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
        expect(actual).toEqual({
            "email": false,
            "familyName": false,
            "givenName": false,
            "countryCode": true,
            "emailPreferences": true,
            "school": true,
            "userContexts": true
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
                "email": true,
                "familyName": true,
                "givenName": true,
                "countryCode": false,
                "emailPreferences": true,
                "school": true,
                "userContexts": true
            };
            expect(actual).toEqual(expected);
        });

    } else {
        it.each(['STUDENT', 'TUTOR', 'TEACHER'] as UserRole[])("does not require country code for %s on Isaac", (role) => {
            // Arrange
            const user = {...testUser, user: {...testUser.user, role: role, countryCode: undefined}};

            // Act
            const actual = validateRequiredFields(user.user, user.prefs, user.contexts);

            // Assert
            const expected = {
                "email": true,
                "familyName": true,
                "givenName": true,
                "countryCode": true,
                "emailPreferences": true,
                "school": true,
                "userContexts": true
            };
            expect(actual).toEqual(expected);
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
                "email": true,
                "familyName": true,
                "givenName": true,
                "countryCode": true,
                "emailPreferences": true,
                "school": true,
                "userContexts": true
            };
            expect(actual).toEqual(expected);
        });

        it("requires school for TEACHER on Ada CS", () => {
            // Arrange
            const teacher = {...testUser, user: {...testUser.user, role: "TEACHER", schoolId: undefined} satisfies ValidationUser};

            // Act
            const actual = validateRequiredFields(teacher.user, teacher.prefs, teacher.contexts);

            // Assert
            const expected = {
                "email": true,
                "familyName": true,
                "givenName": true,
                "countryCode": true,
                "emailPreferences": true,
                "school": false,
                "userContexts": true
            };
            expect(actual).toEqual(expected);
        });

    } else {
        it.each(['STUDENT', 'TUTOR', 'TEACHER'] as UserRole[])("does not require school for %s on Isaac", (role: UserRole) => {
            // Arrange
            const user = {...testUser, user: {...testUser.user, schoolId: undefined, role: role}};

            // Act
            const actual = validateRequiredFields(user.user, user.prefs, user.contexts);

            // Assert
            const expected = {
                "email": true,
                "familyName": true,
                "givenName": true,
                "countryCode": true,
                "emailPreferences": true,
                "school": true,
                "userContexts": true
            };
            expect(actual).toEqual(expected);
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
                "email": true,
                "familyName": true,
                "givenName": true,
                "countryCode": true,
                "emailPreferences": true,
                "school": true,
                "userContexts": true
            };
            expect(actual).toEqual(expected);
        });
    } else {
        it.each(['STUDENT', 'TUTOR', 'TEACHER'] as UserRole[])("requires non-default user context for %s on Isaac", (role) => {
            // Arrange
            const user = {...testUser, user: {...testUser.user, role: role}, contexts: []};

            // Act
            const actual = validateRequiredFields(user.user, user.prefs, user.contexts);

            // Arrange
            const expected = {
                "email": true,
                "familyName": true,
                "givenName": true,
                "countryCode": true,
                "emailPreferences": true,
                "school": true,
                "userContexts": false
            };
            expect(actual).toEqual(expected);
        });
    }

    if(isAda) {
        it.each(['STUDENT', 'TUTOR', 'TEACHER'] as UserRole[])("does not require non-default email preferences for %s on Ada CS", (role) => {
            // Arrange
            const user = {...testUser, user: {...testUser.user, role: role}, prefs: {"EMAIL_PREFERENCE": EMAIL_PREFERENCE_DEFAULTS}};

            // Act
            const actual = validateRequiredFields(user.user, user.prefs, user.contexts);

            // Arrange
            const expected = {
                "email": true,
                "familyName": true,
                "givenName": true,
                "countryCode": true,
                "emailPreferences": true,
                "school": true,
                "userContexts": true
            };
            expect(actual).toEqual(expected);
        });
    } else {
        it.each(['STUDENT', 'TUTOR', 'TEACHER'] as UserRole[])("requires non-default email preferences for %s on Isaac", (role) => {
            // Arrange
            const user = {...testUser, user: {...testUser.user, role: role}, prefs: {"EMAIL_PREFERENCE": EMAIL_PREFERENCE_DEFAULTS}};

            // Act
            const actual = validateRequiredFields(user.user, user.prefs, user.contexts);

            // Arrange
            const expected = {
                "email": true,
                "familyName": true,
                "givenName": true,
                "countryCode": true,
                "emailPreferences": false,
                "school": true,
                "userContexts": true
            };
            expect(actual).toEqual(expected);
        });
    }

});