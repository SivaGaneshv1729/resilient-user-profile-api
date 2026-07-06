const mongoose = require('mongoose');
const IUnitOfWork = require('../interfaces/IUnitOfWork');
const MongoUserRepository = require('./MongoUserRepository');

class MongoUnitOfWork extends IUnitOfWork {
    constructor() {
        super();
        this.session = null;
    }

    async startTransaction() {
        this.session = await mongoose.startSession();
        this.session.startTransaction();
    }

    async commit() {
        if (this.session) {
            await this.session.commitTransaction();
            this.session.endSession();
            this.session = null;
        }
    }

    async rollback() {
        if (this.session) {
            await this.session.abortTransaction();
            this.session.endSession();
            this.session = null;
        }
    }

    getUserRepository() {
        return new MongoUserRepository(this.session);
    }
}

module.exports = MongoUnitOfWork;
