const {User} = require('../../../models/user');
const auth = require('../../../middleware/auth');
const mongoose = require('mongoose');

describe('auth middleware' , () => {
    let payload;
    let user;
    let token;
    let req;
    let res;
    let next;

    beforeEach(() => {
        payload = {
            _id: new mongoose.Types.ObjectId().toHexString(), 
            isAdmin: true
        };
        user = new User(payload);
        token = user.generateAuthToken();
        
        req = {
            header: jest.fn().mockReturnValue(token)
        }
    
        res = {};
    
        next = jest.fn();
    });

    it('should populate req.user with the decoded payload' , () => {
        auth(req, res, next);

        expect(req.user).toMatchObject(payload);
    })

    it('it should call the next middleware function after populating req.body' , () => {
        auth(req, res, next);
        
        expect(next).toHaveBeenCalled();
    })
});
