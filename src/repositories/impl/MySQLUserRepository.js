const IUserRepository = require('../interfaces/IUserRepository');

class MySQLUserRepository extends IUserRepository {
    /**
     * @param {import('mysql2/promise').Connection} connection
     */
    constructor(connection) {
        super();
        this.connection = connection;
    }

    async create(user) {
        const [result] = await this.connection.execute(
            'INSERT INTO users (id, name, email) VALUES (?, ?, ?)',
            [user.id, user.name, user.email]
        );
        return this.findById(user.id);
    }

    async findById(id) {
        const [rows] = await this.connection.execute('SELECT * FROM users WHERE id = ?', [id]);
        return rows[0] || null;
    }

    async findByEmail(email) {
        const [rows] = await this.connection.execute('SELECT * FROM users WHERE email = ?', [email]);
        return rows[0] || null;
    }

    async update(id, updates) {
        const { name, email } = updates;
        const fields = [];
        const values = [];

        if (name !== undefined) {
            fields.push('name = ?');
            values.push(name);
        }
        if (email !== undefined) {
            fields.push('email = ?');
            values.push(email);
        }

        if (fields.length === 0) return this.findById(id);

        values.push(id);
        const query = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
        
        await this.connection.execute(query, values);
        return this.findById(id);
    }

    async delete(id) {
        const [result] = await this.connection.execute('DELETE FROM users WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }
}

module.exports = MySQLUserRepository;
