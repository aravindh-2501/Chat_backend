import jwt from 'jsonwebtoken';


const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'; 


export const generateToken = (user) => {
    const payload = {
        id: user._id,
        username: user.username,
        email: user.email,
    };

    
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' }); 
};
