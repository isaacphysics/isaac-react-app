import { securePadCredentials, securePadPasswordReset, utf8ByteLength } from "../../app/services/credentialPadding";
import { CredentialsAuthDTO } from "../../IsaacAppTypes";

describe("Unicode string lengths in Bytes", () => {
  it("length of ASCII string", async () => {
    const expectedResult = 6;
    const actualResult = utf8ByteLength("123456");
    expect(actualResult).toEqual(expectedResult);
  });

  it("length of a Unicode string", async () => {
    const expectedResult = 34;
    const actualResult = utf8ByteLength("Iñtërnâtiônàlizætiøn☃💩");
    expect(actualResult).toEqual(expectedResult);
  });
});

describe("Credentials are securely padded", () => {
  const credentials = { email: "test@test.com", password: "test", rememberMe: false } as CredentialsAuthDTO;
  const paddedCredentials = securePadCredentials(credentials);

  it("credential padding added", async () => {
    expect(paddedCredentials._randomPadding).toEqual(expect.anything());
  });

  it("credential padding length >= 0", () => {
    expect(paddedCredentials._randomPadding.length).toBeGreaterThan(0);
  });

  it("padded length = 256", () => {
    const paddedLength = utf8ByteLength(JSON.stringify(paddedCredentials));
    expect(paddedLength).toEqual(256);
  });

  it("long credential padding 2^N", () => {
    const longCredentials = {
      email: "test@test.com",
      password: "a".repeat(300),
      rememberMe: false,
    } as CredentialsAuthDTO;
    const paddedLongCredentials = securePadCredentials(longCredentials);
    const paddedLength = utf8ByteLength(JSON.stringify(paddedLongCredentials));
    const log2OfLength = Math.log2(paddedLength);
    const intergerPowerOfTwo = Math.floor(log2OfLength);
    expect(log2OfLength).toEqual(intergerPowerOfTwo);
  });
});

describe("Password resets are securely padded", () => {
  const credentials = { password: "test" };
  const paddedCredentials = securePadPasswordReset(credentials);

  it("password reset padding added", async () => {
    expect(paddedCredentials._randomPadding).toEqual(expect.anything());
  });

  it("password reset padding length >= 0", () => {
    expect(paddedCredentials._randomPadding.length).toBeGreaterThan(0);
  });

  it("password reset padded length = 256", () => {
    const paddedLength = utf8ByteLength(JSON.stringify(paddedCredentials));
    expect(paddedLength).toEqual(256);
  });
});
