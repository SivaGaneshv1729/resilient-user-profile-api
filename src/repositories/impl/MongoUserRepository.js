const IUserRepository = require('../interfaces/IUserRepository');
const User = require('../../models/User');

class MongoUserRepository extends IUserRepository {
    constructor(session = null) {
        super();
        this.session = session;
    }

    async create(userData) {
        const user = new User(userData);
        await user.save({ session: this.session });
        return user;
    }

    async findById(id) {
        return await User.findOne({ id }).session(this.session);
    }

    async update(id, updates) {
        return await User.findOneAndUpdate({ id }, updates, { new: true, session: this.session });
    }

    async delete(id) {
        const result = await User.deleteOne({ id }).session(this.session);
        return result.deletedCount > 0;
    }

    async findByEmail(email) {
        return await User.findOne({ email }).session(this.session);
    }

    async findAll() {
        return await User.find({}).session(this.session);
    }
}

module.exports = MongoUserRepository;
