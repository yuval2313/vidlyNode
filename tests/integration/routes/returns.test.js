const request = require('supertest');
const {User} = require('../../../models/user');
const {Movie} = require('../../../models/movie');
const {Genre} = require('../../../models/genre');
const {Rental} = require('../../../models/rental');
const mongoose = require('mongoose');

let server;
let endpoint = '/vidly/api/returns';

describe(endpoint , () => {
    jest.setTimeout(30000);

    let customerId;
    let movieId;
    let rental;
    let movie;
    let token;
    let payload;

    Date.prototype.minusDays = function(days) {
        let date = new Date(this.valueOf());
        date.setDate(date.getDate() - days);
        return date;
    }

    const exec = function() {
        return request(server)
        .post(endpoint)
        .set('x-auth-token' , token)
        .send( payload );
    }

    beforeEach(async () => { 
        server = require('../../../index'); 

        customerId = new mongoose.Types.ObjectId();
        movieId = new mongoose.Types.ObjectId();
        token = new User().generateAuthToken();
        payload = { customerId , movieId };

        movie = new Movie({
            _id: movieId,
            title: 'Aaa',
            genre: new Genre({name: 'genre1'}),
            numberInStock: 10,
            dailyRentalRate: 2
        })
        await movie.save();

        rental = new Rental({
            customer: {
                _id: customerId,
                name: 'Aaa',
                phone: '123'
            },
            movie: {
                _id: movieId,
                title: movie.title,
                dailyRentalRate: movie.dailyRentalRate
            }
        });
        await rental.save();
    });
    afterEach(async () => { 
        await Rental.deleteMany({});
        await Movie.deleteMany({});
        await server.close(); 
    });

    describe('POST /' , () => {

        it('should return status 401 if user is not logged in' , async () => {
            token = '';
            
            const res = await exec();

            expect(res.status).toBe(401);
        });

        it('should return status 400 if customerId is not provided' , async () => {
            delete payload.customerId;
            
            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should return status 400 if movieId is not provided' , async () => {
            delete payload.movieId;

            const res = await exec();
            
            expect(res.status).toBe(400);
        });

        it('should return status 404 if no rental is found for this customer + movie' , async () => {
            await Rental.findByIdAndRemove(rental._id);
            
            const res = await exec();

            expect(res.status).toBe(404);
        });

        it('should return status 400 if rental has already been returned' , async () => {
            await Rental.findByIdAndUpdate(rental._id , { returnDate: Date.now() });
            
            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should return status 200 if valid request' , async () => {
            const res = await exec(); 

            expect(res.status).toBe(200);
        });

        it('should set the return date' , async () => {
            await exec();
            
            rentalInDb = await Rental.findById(rental._id);

            expect(new Date(rentalInDb.returnDate).getTime()).toBeLessThan( Date.now() );
        });

        it('should calculate the price based on the daily rental rate of the movie' , async() => {
            await Rental.findByIdAndUpdate(rental._id , { date: new Date().minusDays(4) });

            await exec();

            rentalInDb = await Rental.findById(rental._id);

            expect(rentalInDb.price).toEqual(8);
        });

        it('should increase the stock of the movie' , async () => {            
            await exec();

            movieInDb = await Movie.findById(movieId);

            expect(movieInDb.numberInStock).toBe(movie.numberInStock + 1);
        });

        it('should return the rental back to the client' , async () => {
            const res = await exec();

            rentalInDb = await Rental.findById(rental._id);

            expect(res.body).toHaveProperty( '_id' , rentalInDb._id.toHexString());  
        });

        //it should allow unreturned rental to be returned even if a rental has been returned with same movie + customer in the past

    });
});