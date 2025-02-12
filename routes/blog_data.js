const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const Blog = require('../models/blog-model');
const UserData = require('../models/user-model');
const { CgPathCrop } = require('react-icons/cg');


const blog_router = express.Router();

// Secret key for JWT (store in .env in production)
const JWT_SECRET = "sayan";



// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1]; // Extract token
    if (!token) return res.status(401).json({ message: "Unauthorized: No token provided" });
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ message: "Invalid or expired token" });
        req.user = decoded; // Attach user data
        next();
    });
};


// Protected Profile Route
blog_router.get("/profile", async (req, res) => {
    try {
        // Get token from request headers
        const token = req.headers.authorization;
        if (!token) {
            return res.status(401).json({ message: "No token, authorization denied" });
        }

        // Verify token
        const decoded = jwt.verify(token.split(" ")[1], JWT_SECRET);
        console.log("Decoded token:", decoded);

        // Fetch user data from database
        const user = await UserData.findById(decoded.userId).select("-password"); // Don't return password
        if (!user) return res.status(404).json({ message: "User not found" });

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});


// User Login (Generates JWT Token)
blog_router.post('/login', async (req, res) => {
    try {
        console.log("Login request received:", req.body);  // Log request body
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required." });
        }
        const user = await UserData.findOne({ email });
        if (!user) {
            console.log("User not found:", email);
            return res.status(400).json({ message: "User not found." });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log("Password does not match");
            return res.status(400).json({ message: "Invalid credentials." });
        }
        // Generate JWT token
        const token = jwt.sign({ userId: user._id, email: user.email, name: user.name, mobile: user.mobile }, JWT_SECRET, { expiresIn: "1d" });
        // console.log("Token generated:", token);
        res.json({ token, message: "Login successful!" });

    } catch (error) {
        res.status(500).json({ message: "Server error.", error });
    }
});

// registration ....
blog_router.post('/registration', async (req, res) => {
    try {
        const { name, mobile, email, password } = req.body;
        // Check if user already exists
        const existingUser = await UserData.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists." });
        }
        // Hash the password before saving
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        // Create new user
        const newUser = new UserData({
            name,
            mobile,
            email,
            password: hashedPassword
        });
        await newUser.save();
        res.status(201).json({ message: "User registered successfully" });
    } catch (e) {
        res.status(500).json({ message: "Server error.", error });
    }
});


blog_router.post("/add_blog", async (req, res) => {
    try {
        // Get token from request headers
        const token = req.headers.authorization;
        if (!token) {
            return res.status(401).json({ message: "No token, authorization denied" });
        }
        // Verify token
        const decoded = jwt.verify(token.split(" ")[1], JWT_SECRET);
        console.log("Decoded token:", decoded);

        const { title, description, image } = req.body;
        if (!title || !description) {
            return res.status(400).json({ message: "Title and description are required" });
        }

        // Ensure image is a valid string
        let imageUrl = "";
        if (typeof image === "string" && image.trim() !== "") {
            imageUrl = image;
        }

        const newBlog = new Blog({
            blog_title: title,
            blog_description: description,
            image,
            email: decoded.email, // Extract email from token
            name: decoded.name
        });
        await newBlog.save();
        res.status(201).json({ message: "Blog added successfully!", newBlog });
    } catch (e) {
        console.error("Error while saving blog:", e); // NEW DEBUGGING LINE
        res.status(500).json({ message: "Failed to add blog", error: e.message });
    }
});



// Fetch Blogs
blog_router.get('/fetch_blog', async (req, res) => {
    try {
        // Get token from request headers
        const token = req.headers.authorization;
        if (!token) {
            return res.status(401).json({ message: "No token, authorization denied" });
        }
        // Verify token
        const decoded = jwt.verify(token.split(" ")[1], JWT_SECRET);
        // console.log("Decoded token:", decoded);

        const blogs = await Blog.find();
        console.log("Fetched Blogs:", blogs);
        res.json(blogs);
    } catch (e) {
        res.status(500).json({ message: "Failed to fetch blogs", error });
    }
});



// Fetch my Blogs

blog_router.get('/my_blog', async (req, res) => {
    try {
        // Get token from request headers
        const token = req.headers.authorization;
        if (!token || !token.startsWith("Bearer ")) {
            return res.status(401).json({ message: "No token, authorization denied" });
        }
        // Verify token
        const decoded = jwt.verify(token.split(" ")[1], JWT_SECRET);
        const email = decoded.email;
        // console.log("User Email:", email);
        // Fetch all blogs associated with the user's email
        const blogs = await Blog.find({ email });
        if (!blogs || blogs.length === 0) {
            return res.status(404).json({ message: "No blogs found" });
        }
        // console.log("Fetched Blogs:", blogs);
        res.json(blogs);
    } catch (e) {
        console.error("Error fetching blogs:", e);
        res.status(500).json({ message: "Failed to fetch blogs", error: e });
    }
});



blog_router.get('/fetch_email', async (req, res) => {
    try {
        // Get token from request headers
        const token = req.headers.authorization;
        if (!token) {
            return res.status(401).json({ message: "No token, authorization denied" });
        }
        // Verify token
        const decoded = jwt.verify(token.split(" ")[1], JWT_SECRET);
        // console.log("Decoded token:", decoded);
        res.json(decoded.email);
    } catch (e) {
        res.status(500).json({ message: "Failed to fetch blogs", error });
    }
})


// Route to add a comment
blog_router.post("/add_comment", async (req, res) => {
    try {
        const { blogId, comment } = req.body;
        if (!blogId || !comment) {
            return res.status(400).json({ error: "Invalid data" });
        }
        // Get token from request headers
        const token = req.headers.authorization;
        console.log("Received Token:", token);
        if (!token) {
            return res.status(401).json({ message: "No token, authorization denied" });
        }
        // Verify token
        const decoded = jwt.verify(token.split(" ")[1], JWT_SECRET);
        console.log("Decoded token:", decoded);
        // Check if decoded data contains email
        if (!decoded.email || !decoded.name) {
            return res.status(400).json({ error: "Invalid token data" });
        }

        // Find the blog and update
        const updatedBlog = await Blog.findByIdAndUpdate(
            blogId,
            {
                $push: { comments: { email: decoded.email, name: decoded.name, description: comment } }
            },
            { new: true } // Return updated document
        );
        if (!updatedBlog) {
            return res.status(404).json({ error: "Blog not found" });
        }
        res.json({ message: "Comment added", updatedBlog });
    } catch (error) {
        console.error("Error adding comment:", error);
        res.status(500).json({ error: "Server error" });
    }
});


blog_router.delete("/delete_comment/:blogId/:commentId", async (req, res) => {
    try {
        const { blogId, commentId } = req.params;
        console.log("Received Blog ID:", blogId);
        console.log("Received Comment ID:", commentId);

        const token = req.headers.authorization;
        if (!token) {
            return res.status(401).json({ message: "No token, authorization denied" });
        }
        // Verify token
        const decoded = jwt.verify(token.split(" ")[1], JWT_SECRET);
         // Check if decoded data contains email
         if (!decoded.email || !decoded.name) {
            return res.status(400).json({ error: "Invalid token data" });
        }
        // Find the blog
        const blog = await Blog.findById(blogId);
        if (!blog) {
            return res.status(404).json({ error: "Blog not found" });
        }
        // Find the comment and ensure the user owns it
        const comment = blog.comments.id(commentId);
        if (!comment) {
            return res.status(404).json({ error: "Comment not found" });
        }
        if (comment.email !== decoded.email) {
            return res.status(403).json({ error: "You can only delete your own comments" });
        }
        // Remove the comment
        blog.comments.pull(commentId);
        await blog.save();
        res.json({ message: "Comment deleted successfully", updatedBlog: blog });
    } catch (error) {
        console.error("Error deleting comment:", error);
        res.status(500).json({ error: "Server error" });
    }
});


// blog_router.post("/add_like", async(req,res) => {
//     try{
//         const { blogId} = req.body;
//         if (!blogId ) {
//             return res.status(400).json({ error: "Invalid data" });
//         }
//         // Get token from request headers
//         const token = req.headers.authorization;
//         console.log("Received Token:", token);
//         if (!token) {
//             return res.status(401).json({ message: "No token, authorization denied" });
//         }
//         // Verify token
//         const decoded = jwt.verify(token.split(" ")[1], JWT_SECRET);
//         console.log("Decoded token:", decoded);

//         // Find the blog and update
//         const updatedLike = await Blog.findByIdAndUpdate(
//             blogId,
//             {
//                 $addToSet: { likes: decoded.user.id  }
//             },
//             { new: true } // Return updated document
//         );

//         if (!updatedLike) {
//             return res.status(404).json({ error: "Blog not found" });
//         }
//         res.json({ message: "Like added", updatedLike });

//     }catch(e){
//         console.error("Error like :", error);
//         res.status(500).json({ error: "Server error" });
//     }

// });


blog_router.delete("/delete_blog/:id", async (req, res) => {
    try {
        const blogId = req.params.id;
        await Blog.findByIdAndDelete(blogId);
        res.status(200).json({ message: "Blog deleted successfully" });
    } catch (error) {
        console.error("Error deleting blog", error);
        res.status(500).json({ message: "Internal server error" });
    }
});


module.exports = blog_router;
