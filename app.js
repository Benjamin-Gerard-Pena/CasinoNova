import dotenv from 'dotenv';
import mongoose from 'mongoose';
import express from 'express';
import cors from 'cors';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const conectarBD = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000
        });
        console.log("¡Conectado a MongoDB Atlas con éxito, hermano! 🚀");
    } catch (error) {
        console.error("Error al conectar con la base de datos:", error.message);
    }
};
conectarBD();

const jugadorSchema = new mongoose.Schema({
    usuario: { type: String, required: true, unique: true, trim: true },
    contrasena: { type: String, required: true },
    saldo: { type: Number, default: 100000, min: 0 }
}, { collection: 'jugadores', timestamps: true });

const Jugador = mongoose.model('Jugador', jugadorSchema);

const partidaSchema = new mongoose.Schema({
    usuario: { type: String, required: true },
    juegoId: { type: String, required: true },
    apuesta: { type: Number, required: true },
    multiplicador: { type: Number, required: true },
    premio: { type: Number, required: true },
    resultado: { type: String, enum: ['GANADO', 'PERDIDO', 'EMPATE'] },
    saldoPosterior: { type: Number, required: true },
    fecha: { type: Date, default: Date.now }
}, { collection: 'partidas' });

const Partida = mongoose.model('Partida', partidaSchema);

app.post('/api/partidas', async (req, res) => {
    try {
        const { usuario, juegoId, apuesta, multiplicador, saldoPosterior } = req.body;
        const premioCalculado = Math.round(apuesta * multiplicador);

        let resultado = 'PERDIDO';
        if (premioCalculado > apuesta) resultado = 'GANADO';
        else if (premioCalculado === apuesta) resultado = 'EMPATE';

        const nuevaPartida = new Partida({
            usuario: usuario || 'benjamin',
            juegoId,
            apuesta,
            multiplicador,
            premio: premioCalculado,
            resultado,
            saldoPosterior
        });

        await nuevaPartida.save();

        await Jugador.findOneAndUpdate(
            { usuario: usuario || 'benjamin' },
            { $set: { saldo: saldoPosterior } },
            { upsert: true, new: true }
        );

        console.log(`🎰 Jugada guardada: ${juegoId} | Apuesta: $${apuesta} | Resultado: ${resultado}`);
        res.status(201).json({ ok: true, partida: nuevaPartida });
    } catch (error) {
        console.error("Error al guardar partida:", error);
        res.status(500).json({ ok: false, error: error.message });
    }
});

app.get('/api/partidas/:usuario', async (req, res) => {
    try {
        const historial = await Partida.find({ usuario: req.params.usuario })
            .sort({ fecha: -1 })
            .limit(20);
        res.json({ ok: true, historial });
    } catch (error) {
        res.status(500).json({ ok: false, error: error.message });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { usuario, contrasena } = req.body;
        let jugador = await Jugador.findOne({ usuario });

        if (!jugador) {
            jugador = new Jugador({ usuario, contrasena, saldo: 100000 });
            await jugador.save();
        } else if (jugador.contrasena !== contrasena) {
            return res.status(401).json({ ok: false, error: "Contraseña incorrecta" });
        }
        res.json({ ok: true, usuario: jugador.usuario, saldo: jugador.saldo });
    } catch (error) {
        res.status(500).json({ ok: false, error: error.message });
    }
});

app.get('/api/estado', (req, res) => {
    res.json({ estado: "Online", juego: "Casino Nova" });
});

app.get('/api/saldo/:usuario', async (req, res) => {
    try {
        let jugador = await Jugador.findOne({ usuario: req.params.usuario });
        if (!jugador) {
            jugador = await Jugador.create({
                usuario: req.params.usuario,
                contrasena: '123',
                saldo: 100000
            });
        }
        res.json({ ok: true, saldo: jugador.saldo });
    } catch (error) {
        res.status(500).json({ ok: false, error: error.message });
    }
});

app.post('/api/deposito', async (req, res) => {
    try {
        const { usuario, monto } = req.body;
        const jugador = await Jugador.findOneAndUpdate(
            { usuario: usuario || 'benjamin' },
            { $inc: { saldo: Number(monto) } },
            { new: true, upsert: true }
        );
        res.json({ ok: true, nuevoSaldo: jugador.saldo });
    } catch (error) {
        res.status(500).json({ ok: false, error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT} 🎰`);
});