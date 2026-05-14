import dotenv from 'dotenv';
dotenv.config();

import connectDB from './db/db.js';
import { createUsersTable } from './models/user.model.js';
import { app } from './app.js';

const PORT = process.env.PORT || 8000;

const start = async () => {
    await connectDB();
    await createUsersTable();

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
};

start();
