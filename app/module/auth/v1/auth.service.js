const BaseService = require('../../../base/base_service');
const { OAuth2Client } = require("google-auth-library");
const { app_config } = require('../../../config');
const client = new OAuth2Client(app_config.GOOGLE_KEY);

class AuthServiceV1 extends BaseService {
    constructor(opts) {
        super(opts, 'Users');
    }
    
    async login(body) {
        let { email, password, keep_login } = body;
        let user = await this.databaseService.getByQuery(this.modelName, { email }, true, ['_id', 'name', 'email', 'password']);
        if (await this.utils.compare(password, user.password)) {
            let data={_id:user._id}
            let token = await this.utils.signToken(data,keep_login);
            return { token };
        } else {
            const err = this.errs(
                this.httpStatus.UNAUTHORIZED,
                'Invalid Combination of Credentials is wrong'
            );
            throw err;
        }
    }

    async register(body) {
        let regBody={...body, password: await this.utils.getHash(body.password)};
        let prevUser = await this.databaseService.getOneByQuery(this.modelName, { email:body.email },true);
        if(!prevUser){
        let user = await this.databaseService.create(this.modelName, regBody);
        let data={_id:user._id}
        let token = await this.utils.signToken(data,true);
        return { token,user };
        }else{
            const err = this.errs(
                this.httpStatus.CONFLICT,
                'User already exists'
            );
            throw err;
        }
    }

    async googleLogin(body) {
        try{
            //TODO: TEST THIS FEATURE
            var { idToken } = body;
            const ticket = await client.verifyIdToken({
              idToken,
              audience: app_config.GOOGLE_KEY,
            });
            const payload = ticket.getPayload();
            var name = payload.name;
            var email = payload.email;
            var picture = payload.picture;
            var password= this.utils.getRandomString(20);
            let user = await this.databaseService.findOneOrCreate(this.modelName,{email}, { email,name,picture,password },true);
            let token = await this.utils.signToken({ ...user, password: undefined, isAuthenticated: true });
            return { token,user };
    
            
        }catch(err){

        }
    }
}

module.exports = AuthServiceV1;
