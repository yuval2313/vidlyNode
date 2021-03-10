const mongoose = require('mongoose');
const request = require('supertest');
const {Genre} = require('../../../models/genre');
const {User} = require('../../../models/user');
let server;
let endpoint = '/vidly/api/genres';

describe(endpoint , () => {
    jest.setTimeout(30000);

    beforeEach(async () => { 
        server = require('../../../index'); 
    });
    afterEach(async () => { 
        await Genre.deleteMany({});
        await server.close(); 
    });

    describe('GET /' , () => {
        it('should return all genres' , async () => {
            await Genre.collection.insertMany([
                {name: 'genre1'},
                {name: 'genre2'}
            ]);

            const res = await request(server).get(endpoint);

            expect(res.status).toBe(200);
            expect(res.body.length).toBe(2);
            expect(res.body.some(g => g.name === 'genre1')).toBeTruthy();
            expect(res.body.some(g => g.name === 'genre2')).toBeTruthy();
        });
    });

    describe('GET /:id' , () => {
        it('should return a genre based on a given id' , async () => {
            const _id = new mongoose.Types.ObjectId();
            await Genre.collection.insertOne({_id: _id, name: 'genre3'});

            const res = await request(server).get(`${endpoint}/${_id}`);

            expect(res.status).toBe(200);
            expect(res.body).toMatchObject({_id: _id.toHexString(), name: 'genre3'});
        });

        it('should return a 404 status when given an invalid id' , async () => {
            const res = await request(server).get(`${endpoint}/1`);

            expect(res.status).toBe(404);
        });

        it('should return a 404 status when a genre was not found' , async () => {
            const _id = new mongoose.Types.ObjectId();

            const res = await request(server).get(`${endpoint}/${_id}`);

            expect(res.status).toBe(404);
        });
    });

    describe('POST /' , () => {
        let token;
        let name;

        const exec = async () => {
            return await request(server)
                .post(endpoint)
                .set('x-auth-token' , token)
                .send({ name });
        }

        beforeEach(() => {
            token = new User().generateAuthToken();
            name = 'genre1';
        })

        it('should return status 401 if user is not logged in' , async () => {
            token = '';

            const res = await exec();

            expect(res.status).toBe(401);
        });
        it('should return status 400 if genre name is less that 5 characters' , async () => {
            name = '1234';
            
            const res = await exec();
            
            expect(res.status).toBe(400);
        });
            it('should return status 400 if genre name is more than 50 characters' , async () => {
                name = new Array(52).join('a');

                const res = await exec();
                
                expect(res.status).toBe(400);
            });
        it('should save the genre if it is valid' , async () => {
            await exec();

            const genre = await Genre.findOne({ name: 'genre1'})
            
            expect(genre).toBeTruthy();
        });
        it('should return the genre if it is valid' , async () => {            
            const res = await exec();
            
            expect(res.body).toHaveProperty('_id');
            expect(res.body).toHaveProperty('name' , 'genre1');
        })
    });

    describe('PUT /:id' , () => {
        let token;
        let user;
        let genre;
        let id;
        let newName;

        const exec = async () => {
            return await request(server)
                .put(`${endpoint}/${id}`)
                .set('x-auth-token' , token)
                .send({ name: newName });
        }

        beforeEach(async () => {
            user = new User({
                isAdmin: true
            });
            token = user.generateAuthToken();

            genre = new Genre({
                name: 'genre1'
            })
            await genre.save();

            id = genre._id;
            newName = 'updatedName';
        })

        it('should return status 401 if user is not logged in' , async () => {
            token = '';

            const res = await exec();

            expect(res.status).toBe(401);
        });

        it('should return status 403 if user is not an admin' , async () => {
            user.isAdmin = false;
            token = user.generateAuthToken();

            const res = await exec();

            expect(res.status).toBe(403);
        });

        it('should return status 404 if an invalid id is given' , async () => {
            id = 1;

            const res = await exec();

            expect(res.status).toBe(404);
        });

        it('should return status 404 if the genre with the given id does not exist' , async () => {
            id = new mongoose.Types.ObjectId();

            const res = await exec();

            expect(res.status).toBe(404);
        });

        it('should return status 400 if the name has less than 5 characters' , async () => {
            newName = '1234';

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should return status 400 if the name has more than 50 characters' , async () => {
            newName = new Array(52).join('a');

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should update the genre with the given id to the given name' , async () => {            
            await exec();
            updatedGenre = await Genre.findOne({ name: newName });

            expect(updatedGenre.name).toBe( newName );
        });

        it('should update the genre with the given id and return it to the client' , async () => {            
            const res = await exec();

            expect(res.body).toHaveProperty('name' , newName);
        });

    });

    describe('DELETE /:id' , () => {
        let token;
        let user;
        let genre;
        let id;

        const exec = async () => {
            return await request(server)
                .delete(`${endpoint}/${id}`)
                .set('x-auth-token' , token)
                .send()
        }

        beforeEach(async () => {
            user = new User({
                isAdmin: true
            });
            token = user.generateAuthToken();

            genre = new Genre({
                name: 'genre1'
            });
            await genre.save();

            id = genre._id;
        })

        it('should return status 401 if user is not logged in' , async () => {
            token = '';

            const res = await exec();

            expect(res.status).toBe(401);
        });

        it('should return status 403 if user is not an admin' , async () => {
            user.isAdmin = false;
            token = user.generateAuthToken();

            const res = await exec();

            expect(res.status).toBe(403);
        });

        it('should return status 404 if an invalid id is given' , async () => {
            id = 1;

            const res = await exec();

            expect(res.status).toBe(404);
        });

        it('should return status 404 if the genre with the given id does not exist' , async () => {
            id = new mongoose.Types.ObjectId();

            const res = await exec();

            expect(res.status).toBe(404);
        });

        it('should delete the genre with the given id' , async () => {
            await exec();
            deletedGenre = await Genre.findById(id);

            expect(deletedGenre).toBeNull();
        });

        it('should return the deleted genre to the client' , async () => {
            const res = await exec();

            expect(res.body).toMatchObject({ _id: genre._id.toHexString(), name: genre.name });
        });
    })
}); 