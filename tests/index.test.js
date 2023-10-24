const request = require('supertest');
const app = require('../src/index.js');

describe('Your Test Suite', () => {
    it('should do something', (done) => {
        request(app)
            .get('/api/test')
            .expect(200)
            .end((error, response) => {
                if (error) return done(error);

                if (response.body.sku < 1) {
                    done(new Error("BLAD KURWA"));
                }

                console.log(response.body)

                done()
            });
    });
});