const BaseService = require('../../../base/base_service');

class ProfileServiceV1 extends BaseService {
    constructor(opts) {
        super(opts, 'Users');
    }
    
    async getProfile(user_id) {
        let user_detail=await this.get(user_id);
        user_detail.password=undefined;
        return user_detail;
    }
    
    async updateProfile(user_id,body) {
        let user_detail=await this.update(user_id,body);
        user_detail.password=undefined;
        return user_detail;
    }
    
    async changePassword(body,user) {
        let {new_password, old_password}=body;
        let {_id}=user
        let user_detail=await this.getOne({_id},this.modelName,false,{
            password:1
        });
        if(await this.utils.compare(old_password,user_detail.password)){
            let password=await this.utils.getHash(new_password)
            await this.update(_id,{password});
            return true;
        }else{
            return "old password is wrong";
        }
    }
}

module.exports = ProfileServiceV1;
