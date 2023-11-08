const request = require('supertest');
const app = require('../src/index.js');

describe('Response should be valid hot shot JSON', () => {
    let response;

    beforeEach((done) => {
        request(app)
            .get('/api/test')
            .expect(200)
            .end((error, res) => {
                if (error) {
                    done(error);
                } else {
                    response = res.body;
                    done();
                }
            });
    });

    it('Check if item sku is set', () => {
        expect(response.sku).not.toBeNull();
        expect(response.sku).not.toBe(0);
    });

    it('Check if items amount is set', () => {
        expect(response.amount).not.toBeNull();
        expect(response.amount).not.toBe(0);
    });

    it('Check if item name is set', () => {
        expect(response.itemName).not.toBeNull();
        expect(response.itemName).not.toBe(0);
    });

    it('Check if item thumbnail URL is set', () => {
        expect(response.thumbnailUrl).not.toBeNull();
        expect(response.thumbnailUrl).not.toBe(0);
    });

    it('Check if price is set', () => {
        expect(response.prices.price).not.toBeNull();
        expect(response.prices.price).not.toBe(0);
    });

    it('Check if minimum price is set', () => {
        expect(response.prices.minPrice).not.toBeNull();
        expect(response.prices.minPrice).not.toBe(0);
    });

    it('Check if old price is set', () => {
        expect(response.prices.oldPrice).not.toBeNull();
        expect(response.prices.oldPrice).not.toBe(0);
    });

    it('Check if promotion start is set', () => {
        expect(response.promotionStart).not.toBeNull();
        expect(response.promotionStart).not.toBe(0);
    });

    it('Check if promotion end is set', () => {
        expect(response.promotionEnd).not.toBeNull();
        expect(response.promotionEnd).not.toBe(0);
    });
});
