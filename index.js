const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;
const secretKey = 'your-secret-key'; // Asegúrate de usar esta misma clave en el middleware de verificación

const app = express();

app.use(express.json());

app.use("/customer",session({secret:"fingerprint_customer",resave: true, saveUninitialized: true}))

app.use("/customer/auth/*", function auth(req, res, next) {
    const token = req.headers['authorization'];
    if (!token) {
        console.log("No token provided");
        return res.status(403).send('Token required');
    }
    
    console.log("Token provided:", token);

    jwt.verify(token.split(' ')[1], 'your-secret-key', (err, decoded) => {
        if (err) {
            console.log("Token invalid:", err.message);
            return res.status(403).send('Invalid token');
        }
        req.user = decoded;
        next();
    });
});
 
const PORT =5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running"));
