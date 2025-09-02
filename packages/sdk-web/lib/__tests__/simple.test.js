"use strict";
describe('Simple Test Suite', () => {
    it('should pass a basic test', () => {
        expect(1 + 1).toBe(2);
    });
    it('should handle string operations', () => {
        const message = 'Hello, Jest!';
        expect(message).toContain('Jest');
        expect(message.length).toBeGreaterThan(0);
    });
    it('should work with arrays', () => {
        const numbers = [1, 2, 3, 4, 5];
        expect(numbers).toHaveLength(5);
        expect(numbers).toContain(3);
        expect(numbers[0]).toBe(1);
    });
    it('should work with objects', () => {
        const obj = { name: 'Test', value: 42 };
        expect(obj.name).toBe('Test');
        expect(obj.value).toBe(42);
        expect(obj).toHaveProperty('name');
    });
    it('should work with TypeScript types', () => {
        const status = 'success';
        expect(status).toBe('success');
        expect(['pending', 'success', 'error']).toContain(status);
    });
    it('should work with async/await', async () => {
        const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
        const start = Date.now();
        await delay(10);
        const end = Date.now();
        expect(end - start).toBeGreaterThanOrEqual(5);
    });
});
