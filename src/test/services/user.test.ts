import {
  USER_ROLES,
  UserRoleAndLoggedInStatus,
  extractTeacherName,
  isAdmin,
  isAdminOrEventManager,
  isEventLeader,
  isEventLeaderOrStaff,
  isEventManager,
  isLoggedIn,
  isStaff,
  isStudent,
  isTeacher,
  isTeacherOrAbove,
  isTeacherPending,
  isTutor,
  isTutorOrAbove,
  roleRequirements,
  schoolNameWithPostcode,
} from "../../app/services/";
import { Role } from "../../IsaacApiTypes";
import { School } from "../../IsaacAppTypes";
import { mockUser } from "../../mocks/data";

const generateTestCases = (userCheck: (user?: UserRoleAndLoggedInStatus | null) => boolean) => {
  const roleRequirements = {
    STUDENT: [isStudent],
    TUTOR: [isTutorOrAbove, isTutor],
    TEACHER: [isTeacherOrAbove, isTeacher, isTutorOrAbove],
    EVENT_LEADER: [isEventLeader, isTeacherOrAbove, isTutorOrAbove, isEventLeaderOrStaff],
    CONTENT_EDITOR: [isStaff, isTeacherOrAbove, isTutorOrAbove, isEventLeaderOrStaff],
    EVENT_MANAGER: [
      isEventManager,
      isStaff,
      isTeacherOrAbove,
      isTutorOrAbove,
      isEventLeaderOrStaff,
      isAdminOrEventManager,
    ],
    ADMIN: [isAdmin, isStaff, isTeacherOrAbove, isTutorOrAbove, isEventLeaderOrStaff, isAdminOrEventManager],
  };

  const generateTestCase = (
    role: Role,
  ): {
    role: Role | undefined | null;
    value: UserRoleAndLoggedInStatus | undefined | null;
    expected: boolean;
  } => {
    const value = { role, loggedIn: true };
    const expected = roleRequirements[role].includes(userCheck);
    return { role, value, expected };
  };

  const testCases = USER_ROLES.map(generateTestCase);
  testCases.push({ role: undefined, value: undefined, expected: false }, { role: null, value: null, expected: false });

  return testCases;
};

describe("User Checks", () => {
  const functionNames = [
    isStudent,
    isTutor,
    isTeacher,
    isEventLeader,
    isEventManager,
    isAdmin,
    isTutorOrAbove,
    isTeacherOrAbove,
    isStaff,
    isEventLeaderOrStaff,
    isAdminOrEventManager,
  ];

  functionNames.forEach((userCheck) => {
    describe(`${userCheck.name} function`, () => {
      const testCases = generateTestCases(userCheck);
      it.each(testCases)(`returns $expected for $role`, ({ value, expected }) => {
        expect(userCheck(value)).toBe(expected);
      });
    });
  });

  describe("Role Requirements function", () => {
    USER_ROLES.forEach((role) => {
      const user = { role, loggedIn: true };

      it(`should correctly check ${role} role`, () => {
        const requirementFunction = roleRequirements[role];
        expect(requirementFunction(user)).toBe(true);
      });
    });

    it("should handle null user", () => {
      const requirementFunction = roleRequirements["STUDENT"];
      expect(requirementFunction(null)).toBe(false);
    });
  });

  describe("extractTeacherName function", () => {
    it("should return null for null input", () => {
      const result = extractTeacherName(null);
      expect(result).toBeNull();
    });

    it("should return null for undefined input", () => {
      const result = extractTeacherName(undefined);
      expect(result).toBeNull();
    });

    it("should return the formatted teacher name (e.g. `J. Doe`) when given both givenName and familyName", () => {
      const teacher = { givenName: "John", familyName: "Doe" };
      const result = extractTeacherName(teacher);
      expect(result).toBe("J. Doe");
    });

    it("should return only the familyName if givenName is not provided", () => {
      const teacher = { familyName: "Doe" };
      const result = extractTeacherName(teacher);
      expect(result).toBe("Doe");
    });
  });

  describe("schoolNameWithPostcode function", () => {
    const mockSchool: School = {
      urn: "12345",
      name: "Example School",
      postcode: "AB12 3CD",
      closed: false,
      dataSource: "MockDataSource",
    };

    it("should return the school name and postcode when both are provided", () => {
      const result = schoolNameWithPostcode(mockSchool);
      expect(result).toBe(mockSchool.name + ", " + mockSchool.postcode);
    });

    it("should return the school name if no postcode is provided", () => {
      const result = schoolNameWithPostcode({ ...mockSchool, postcode: "" });
      expect(result).toBe(mockSchool.name);
    });
  });

  describe("isLoggedIn function", () => {
    it("should return true for a logged-in user", () => {
      const result = isLoggedIn({ ...mockUser, loggedIn: true });
      expect(result).toBe(true);
    });

    it("should return false for a logged-out user", () => {
      const result = isLoggedIn({ loggedIn: false });
      expect(result).toBe(false);

      const resultWithUser = isLoggedIn({ ...mockUser, loggedIn: false });
      expect(resultWithUser).toBe(false);
    });

    it("should return false for null user", () => {
      const result = isLoggedIn(null);
      expect(result).toBe(false);
    });
  });

  it("should return false for undefined user", () => {
    const result = isLoggedIn();
    expect(result).toBe(false);
  });
});

describe("isTeacherPending function", () => {
  it("should return true for a logged-in user with teacherPending true", () => {
    const result = isTeacherPending({ ...mockUser, teacherPending: true, loggedIn: true });
    expect(result).toBe(true);
  });

  it("should return false for a logged-in user with teacherPending false", () => {
    const result = isTeacherPending({ ...mockUser, loggedIn: true });
    expect(result).toBe(false);
  });

  it("should return false for null  user", () => {
    const result = isTeacherPending(null);
    expect(result).toBe(false);
  });

  it("should return false for undefined user", () => {
    const result = isTeacherPending();
    expect(result).toBe(false);
  });
});
