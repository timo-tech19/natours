const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', (err) => {
    console.log('Unhandled Exception!!. App Shutting down...');
    console.log(err);
    process.exit(1);
});

dotenv.config({ path: './config.env' });

const app = require('./app');
const port = process.env.PORT || 3000;
// Connection string
const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DB_PASSWORD);

// Connecting to our database
mongoose
    .connect(DB, {
        // .connect(process.env.DATABASE_LOCAL, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
    })
    .then(() => console.log('DB connection successful'));

// Start server
const server = app.listen(port, () => {
    console.log(`App running on port:${port}`);
});

process.on('unhandledRejection', (err) => {
    console.log('Unhandled Rejection!!. App Shutting down...');
    console.log(err);
    server.close(() => {
        process.exit(1);
    });
});

process.on('SIGTERM', () => {
    console.log('Sigterm recieved, Shutting down...');
    server.close(() => {
        console.log('Process terminated!');
    });
});
