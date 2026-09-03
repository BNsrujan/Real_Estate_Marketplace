import 'dotenv/config';

import connectDB from './db/db.js';
import { app } from './app.js';

const PORT = process.env.PORT || 8000;

const start = async () => {
    await connectDB();

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
};

start();
