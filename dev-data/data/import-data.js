const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: '../../config.env' });
const Tour = require('../../models/tourModel');
const User = require('../../models/userModel');
const Review = require('../../models/reviewModel');
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
    .then(() => console.log('DB connection successful'))
    .catch((err) => console.log(err));

// Read json file
const tours = JSON.parse(fs.readFileSync(__dirname + '/tours.json', 'utf-8'));
const users = JSON.parse(fs.readFileSync(__dirname + '/users.json', 'utf-8'));
const reviews = JSON.parse(
    fs.readFileSync(__dirname + '/reviews.json', 'utf-8')
);

const importData = async () => {
    try {
        console.log('Data getting ready...');
        await Tour.create(tours);
        await User.create(users, { validateBeforeSave: false });
        await Review.create(reviews);
        console.log('Data Loaded');
    } catch (error) {
        console.log(error);
    }
    process.exit();
};

// Delete data in DB
const deleteData = async () => {
    try {
        await Tour.deleteMany();
        await User.deleteMany();
        await Review.deleteMany();
        console.log('Data gone');
    } catch (error) {
        console.log(error);
    }
    process.exit();
};

if (process.argv[2] === '--import') {
    importData();
} else if (process.argv[2] === '--delete') {
    deleteData();
}

console.log(process.argv);
