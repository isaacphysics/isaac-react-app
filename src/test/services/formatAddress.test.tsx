import { formatAddress } from "../../app/services";

describe("formatAddress", () => {
  it('should return "Unknown Location" if location is undefined', () => {
    expect(formatAddress(undefined)).toBe("Unknown Location");
  });

  it("should return the formatted address if location is defined", () => {
    const location = {
      address: {
        addressLine1: "123 Main St",
        town: "Anytown",
        postalCode: "12345",
      },
    };
    expect(formatAddress(location)).toBe("123 Main St, Anytown, 12345");
  });

  it("should return the formatted address without town if town is undefined", () => {
    const location = {
      address: {
        addressLine1: "123 Main St",
        postalCode: "12345",
      },
    };
    expect(formatAddress(location)).toBe("123 Main St, 12345");
  });

  it("should return the formatted address without postal code if postal code is undefined", () => {
    const location = {
      address: {
        addressLine1: "123 Main St",
        town: "Anytown",
      },
    };
    expect(formatAddress(location)).toBe("123 Main St, Anytown");
  });

  it("should return the formatted address without town and postal code if both are undefined", () => {
    const location = {
      address: {
        addressLine1: "123 Main St",
      },
    };
    expect(formatAddress(location)).toBe("123 Main St");
  });

  it("should return the formatted address without addressline1 if not defined", () => {
    const location = {
      address: {
        town: "Anytown",
        postalCode: "12345",
      },
    };
    expect(formatAddress(location)).toBe("Anytown, 12345");
  });
});
