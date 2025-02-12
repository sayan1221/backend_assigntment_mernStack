const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDb = require("./db.js");
const BlogRoutes = require("./routes/blog_data.js");

const PORT = 5000;
const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

// ✅ Proper CORS Configuration
app.use(cors({
    origin: "http://localhost:3000",  //  Allow frontend origin explicitly
    credentials: true,                //  Allow cookies and authentication headers
    // methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    // allowedHeaders: ["Content-Type", "Authorization"]
}));

// ✅ Handle Preflight Requests
app.options("*", (req, res) => {
    res.header("Access-Control-Allow-Origin", "http://localhost:3000");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.sendStatus(200);
});

// Routes
app.use("/auth", BlogRoutes);

// Start Server
const server_start = async () => {
    try {
        await connectDb();
        app.listen(PORT, () => {
            console.log(` Server is running at port: ${PORT}`);
        });
    } catch (error) {
        console.error("Failed to start server:", error);
    }
};

console.log(app._router.stack.map(r => r.route && r.route.path));

server_start();
