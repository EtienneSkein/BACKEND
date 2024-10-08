import jwt from "jsonwebtoken";

const checkauth = (req, res, next) => {
    try {
        // Extract the token from the Authorization header
        const token = req.headers.authorization && req.headers.authorization.split(" ")[1];
        
        if (!token) {
            return res.status(403).json({ message: "Authentication token missing" });
        }

        // Verify the token using the same secret that was used to sign it
        jwt.verify(token, process.env.JWT_SECRET || "this_secret_should_be_longer_than_it_is", (err, decoded) => {
            if (err) {
                return res.status(401).json({ message: "Token is invalid or has expired" });
            }
            req.userData = decoded;
            next();
        });
    } catch (error) {
        // If the token is invalid or verification fails, return a 401 Unauthorized response
        res.status(401).json({
            message: "Authentication failed"
        });
    }
};

export default checkauth;
