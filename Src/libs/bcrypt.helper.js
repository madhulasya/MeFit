import bcrypt from "bcrypt";

const SALT_ROUNDS = Number(process.env.SALT_ROUNDS) || 10;

async function generateHash(itemToHash) {
    return await bcrypt.hash(itemToHash, SALT_ROUNDS);
}

async function compareHash(valueByUser, valueStored) {
    return await bcrypt.compare(valueByUser, valueStored);
}

export { generateHash, compareHash };
