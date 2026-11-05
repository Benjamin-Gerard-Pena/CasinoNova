const mongoose = require('mongoose');
require('dotenv').config();

const conectarDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Casino Nova conectado a MongoDB Atlas');
    } catch (error) {
        console.error('Cagó la conexión, pelotudo:', error);
        process.exit(1);
    }
};

module.exports = conectarDB;