const request = require('supertest');
const {User} = require('../../../models/user');
const {Genre} = require('../../../models/genre');
let server;
let endpoint = '/vidly/api/genres';

describe('auth middleware' , () => {
    jest.setTimeout(30000);

    let token;
    let name;

    const exec = () => {
        return request(server)
        .post(endpoint)
        .set('x-auth-token' , token)
        .send({ name });
    }
    
    beforeEach(() => {
        server = require('../../../index');
        token = User().generateAuthToken();
        name = 'genre1'; 
    });

    afterEach(async () => {
        await Genre.deleteMany({});
        await server.close(); 
    });

    it('should return status 401 if no token is provided' , async () => {
        token = '';

        const res = await exec();

        expect(res.status).toBe(401);
    });

    it('should return status 400 if an invalid token is provided' , async () => {
        token = 'a';

        const res = await exec();

        expect(res.status).toBe(400);
    })
});