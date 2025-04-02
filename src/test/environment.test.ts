describe('Testing environment', () => {
    it('is set to the Europe/London timezone', () => {
        expect(new Date("2025-04-01").getTimezoneOffset()).toEqual(-60);
    });
});