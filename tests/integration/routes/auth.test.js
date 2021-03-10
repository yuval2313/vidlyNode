const request = require('supertest');
const bcrypt = require('bcrypt');
const {User} = require('../../../models/user');

let endpoint = '/api/auth';
let server;

describe(endpoint , () => {
    jest.setTimeout(30000);

    beforeEach(async () => { 
        server = require('../../../index'); 
    });
    afterEach(async () => { 
        await User.deleteMany({});
        await server.close(); 
    });

    describe('POST /' , () => {
        let email;
        let password;
        let user;

        const exec = () => {
            return request(server)
                .post(endpoint)
                .send({ email , password });
        }

        beforeEach(async () => {
            email = 'email@email.email';
            password = 'password';
            user = new User({
                name: 'Aaaaa',
                email,
                password
            });
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(user.password , salt);
            await user.save()
        });

        it('should return status 400 if email is invalid' , async () => {
            email = 'bademail';

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should return status 400 if email is less than 5 characters' , async () => {
            email = 'a@a.';

            const res = await exec();

            expect(res.status).toBe(400);
        });
        
        it('should return status 400 if email is more than 255 characters' , async () => {
            email = new Array(256).join('a');
            email[0] = 'email@email.email';

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should return status 400 password is less than 5 characters' , async () => {
            password = '1234';

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should return status 400 if password is more than 255 characters' , async () => {
            password = new Array(257).join('a');

            const res = await exec();

            expect(res.status).toBe(400);            
        });

        it('should return status 200 if valid request' , async () => {
            const res = await exec();

            expect(res.status).toBe(200);
        })

    });
});