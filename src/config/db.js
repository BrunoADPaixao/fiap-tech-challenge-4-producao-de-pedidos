// config/db.js
const { MongoClient } = require("mongodb");
require("dotenv").config();

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);

let db;

async function connectDB() {
  if (db) return db;
  try {
    await client.connect();
    console.log("Conectado ao MongoDB com sucesso!");
    db = client.db(); // Se o nome do banco já estiver na URI, não precisa passar aqui.
    return db;
  } catch (error) {
    console.error("Não foi possível conectar ao MongoDB", error);
    process.exit(1); // Encerra a aplicação se não conseguir conectar ao DB
  }
}

const getDB = () => {
  if (!db) {
    throw new Error("A conexão com o banco de dados não foi inicializada!");
  }
  return db;
};

module.exports = { connectDB, getDB };
