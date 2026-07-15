const IUnitOfWork = require('../interfaces/IUnitOfWork');
const MySQLUserRepository = require('./MySQLUserRepository');
const pool = require('../../config/db');

class MySQLUnitOfWork extends IUnitOfWork {
    constructor() {
        super();
        this.connection = null;
        this.userRepository = null;
    }

    async startTransaction() {
        if (this.connection) {
            throw new Error('Transaction already started');
        }
        this.connection = await pool.getConnection();
        await this.connection.beginTransaction();
        this.userRepository = new MySQLUserRepository(this.connection);
    }

    async commit() {
        if (!this.connection) {
            throw new Error('No transaction to commit');
        }
        await this.connection.commit();
        this.connection.release();
        this.connection = null;
        this.userRepository = null;
    }

    async rollback() {
        if (!this.connection) {
            return; // Nothing to rollback
        }
        await this.connection.rollback();
        this.connection.release();
        this.connection = null;
        this.userRepository = null;
    }

    getUserRepository() {
        if (!this.userRepository) {
            throw new Error('Unit of work not started');
        }
        return this.userRepository;
    }
}

module.exports = MySQLUnitOfWork;
