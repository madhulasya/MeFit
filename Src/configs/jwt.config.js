import jwt from 'jsonwebtoken';

const createToken = (data, expiresIn) => {

    try {
        if (expiresIn) {
            return jwt.sign(data, process.env.JWT_SECRET_KEY, { expiresIn: expiresIn });
        } else {
            return jwt.sign(data, process.env.JWT_SECRET_KEY);
        }
    } catch (error) {
        throw new Error(error);
    }

}


const verifyToken = (token) => {
    try {
        let data = jwt.verify(token, process.env.JWT_SECRET_KEY);
        return data;
    } catch (error) {
        return null;
    }
}

export { createToken, verifyToken }
