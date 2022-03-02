const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = (req, res, next) => {
    // Get token from header 
    const token = req.header('x-auth-token');

    // Check if not token 
    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    // Verify token
    try {
        const decoded = jwt.verify(token, config.get('JWTSECRET'));

        // เอา user ที่ได้จาก token มาแปะ ( จะใช้ req.user ได้ทุก protected route )
        req.user = decoded.user;
        // console.log(req.user);
        next();
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
}