const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const SECRET_KEY = "COZY_ELITE_99"; // Change this in production

// MongoDB connection
mongoose.connect('mongodb+srv://emmanueloche096_db_user:UiyBvStbftVVysUe@strange.zf9cc3p.mongodb.net/STRANGE')
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// User Schema
const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    wallet: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Product Schema
const productSchema = new mongoose.Schema({
    title: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    image: { type: String, required: true },
    rating: {
        rate: { type: Number, default: 0 },
        count: { type: Number, default: 0 }
    },
    createdAt: { type: Date, default: Date.now }
});

const Product = mongoose.model('Product', productSchema);

app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));

app.use('/api', (req, res, next) => {
    console.log(`[API] ${req.method} ${req.originalUrl}`);
    next();
});

const uploadsDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use(express.static('public'));

// AUTHENTICATION API
app.post('/api/register', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({
            email,
            password: hashedPassword,
            wallet: 0
        });

        await user.save();
        res.json({ success: true, message: "User Registered" });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (user && await bcrypt.compare(password, user.password)) {
            const token = jwt.sign({ email: user.email }, SECRET_KEY);
            res.json({ success: true, token, wallet: user.wallet });
        } else {
            res.status(401).json({ success: false, message: "Invalid Credentials" });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// Seed initial products if database is empty
async function seedProducts() {
    try {
        const count = await Product.countDocuments();
        if (count === 0) {
            const initialProducts = [
                { title: "Industrial Grade Generator", price: 850000, description: "Powerful generator for industrial use, reliable and durable.", category: "Electronics", image: "https://via.placeholder.com/300x250?text=Generator", rating: { rate: 4.2, count: 15 } },
                { title: "Luxury Sectional Sofa", price: 420000, description: "Comfortable and stylish sectional sofa for modern homes.", category: "Home & Furniture", image: "https://via.placeholder.com/300x250?text=Sofa", rating: { rate: 4.5, count: 28 } },
                { title: "Smart Double-Door Fridge", price: 650000, description: "Energy-efficient fridge with smart features and ample storage.", category: "Appliances", image: "https://via.placeholder.com/300x250?text=Fridge", rating: { rate: 4.0, count: 22 } },
                { title: "Executive Desk Chair", price: 150000, description: "Ergonomic chair designed for long hours of work.", category: "Home & Furniture", image: "https://via.placeholder.com/300x250?text=Chair", rating: { rate: 4.3, count: 35 } },
                { title: "High-End Laptop", price: 1200000, description: "Powerful laptop for professionals and gamers.", category: "Electronics", image: "https://via.placeholder.com/300x250?text=Laptop", rating: { rate: 4.7, count: 50 } },
                { title: "Premium Coffee Machine", price: 200000, description: "Brew perfect coffee with this advanced machine.", category: "Appliances", image: "https://via.placeholder.com/300x250?text=Coffee+Machine", rating: { rate: 4.1, count: 18 } },
                { title: "Wireless Bluetooth Headphones", price: 50000, description: "High-quality sound with wireless convenience.", category: "Electronics", image: "https://via.placeholder.com/300x250?text=Headphones", rating: { rate: 4.4, count: 120 } },
                { title: "Designer Watch", price: 300000, description: "Elegant watch for the discerning gentleman.", category: "Fashion", image: "https://via.placeholder.com/300x250?text=Watch", rating: { rate: 4.6, count: 40 } },
                { title: "Running Shoes", price: 80000, description: "Comfortable shoes for running and sports.", category: "Fashion", image: "https://via.placeholder.com/300x250?text=Shoes", rating: { rate: 4.2, count: 85 } },
                { title: "Smartphone Case", price: 10000, description: "Protective case for your smartphone.", category: "Accessories", image: "https://via.placeholder.com/300x250?text=Phone+Case", rating: { rate: 3.9, count: 200 } },
                { title: "LED TV 55 Inch", price: 800000, description: "Crystal clear display for entertainment.", category: "Electronics", image: "https://via.placeholder.com/300x250?text=TV", rating: { rate: 4.5, count: 30 } },
                { title: "Dining Table Set", price: 350000, description: "Beautiful dining set for family meals.", category: "Home & Furniture", image: "https://via.placeholder.com/300x250?text=Dining+Set", rating: { rate: 4.3, count: 25 } },
                { title: "Washing Machine", price: 450000, description: "Efficient washing machine with multiple settings.", category: "Appliances", image: "https://via.placeholder.com/300x250?text=Washing+Machine", rating: { rate: 4.0, count: 20 } },
                { title: "Gaming Console", price: 600000, description: "Next-gen console for immersive gaming.", category: "Electronics", image: "https://via.placeholder.com/300x250?text=Console", rating: { rate: 4.8, count: 60 } },
                { title: "Leather Handbag", price: 120000, description: "Stylish handbag made from genuine leather.", category: "Fashion", image: "https://via.placeholder.com/300x250?text=Handbag", rating: { rate: 4.4, count: 45 } },
                { title: "Fitness Tracker", price: 70000, description: "Track your fitness goals with this smart device.", category: "Electronics", image: "https://via.placeholder.com/300x250?text=Fitness+Tracker", rating: { rate: 4.1, count: 75 } },
                { title: "Bookshelf", price: 180000, description: "Organize your books with this sturdy shelf.", category: "Home & Furniture", image: "https://via.placeholder.com/300x250?text=Bookshelf", rating: { rate: 4.2, count: 30 } },
                { title: "Blender", price: 40000, description: "Powerful blender for smoothies and more.", category: "Appliances", image: "https://via.placeholder.com/300x250?text=Blender", rating: { rate: 3.8, count: 55 } },
                { title: "Wireless Mouse", price: 15000, description: "Ergonomic wireless mouse for comfortable use.", category: "Electronics", image: "https://via.placeholder.com/300x250?text=Mouse", rating: { rate: 4.0, count: 90 } }
            ];

            await Product.insertMany(initialProducts);
            console.log('✅ Initial products seeded to database');
        }
    } catch (error) {
        console.error('❌ Error seeding products:', error);
    }
}

// Initialize database seeding
seedProducts();

// PRODUCTS API
app.get('/api/products', async (req, res) => {
    try {
        const { search, category } = req.query;
        let query = {};

        if (search) {
            query.title = { $regex: search, $options: 'i' };
        }
        if (category && category !== 'All') {
            query.category = category;
        }

        const products = await Product.find(query);
        res.json(products);
    } catch (error) {
        console.error('Products fetch error:', error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// ADD PRODUCT API
app.post('/api/products', async (req, res) => {
    try {
        const { title, price, description, category, image } = req.body;
        let imagePath = 'https://via.placeholder.com/300x250?text=New+Product';

        if (image) {
            // Decode base64 and save as file
            const base64Data = image.replace(/^data:image\/[a-z]+;base64,/, '');
            const filename = Date.now() + '.png';
            const filepath = path.join(__dirname, 'public', 'uploads', filename);
            fs.writeFileSync(filepath, base64Data, 'base64');
            imagePath = `/uploads/${filename}`;
        }

        const newProduct = new Product({
            title,
            price: parseFloat(price),
            description,
            category,
            image: imagePath,
            rating: { rate: 0, count: 0 }
        });

        await newProduct.save();
        res.json({ success: true, product: newProduct });
    } catch (error) {
        console.error('Add product error:', error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});
// WALLET CASHOUT API
app.post('/api/wallet/cashout', async (req, res) => {
    try {
        // In a real app, verify JWT token here
        const { amount, email } = req.body;

        if (!email || !amount) {
            return res.status(400).json({ success: false, message: "Email and amount required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        if (user.wallet < amount) {
            return res.status(400).json({ success: false, message: "Insufficient wallet balance" });
        }

        // Deduct from wallet
        user.wallet -= amount;
        await user.save();

        console.log(`Processing cashout request for ₦${amount} from ${email}`);
        res.json({ success: true, message: "Cashout initiated to linked bank account", newBalance: user.wallet });
    } catch (error) {
        console.error('Cashout error:', error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// ORDERS API
app.get('/api/orders', async (req, res) => {
    console.log('Orders API called');
    try {
        // In a real app, you'd get user ID from JWT token
        // For now, return mock data
        const mockOrders = [
            {
                id: 'ORD001',
                status: 'Delivered',
                total: 150000,
                date: new Date().toISOString(),
                items: [
                    { name: 'iPhone 15 Pro', price: 1200000 },
                    { name: 'Wireless Charger', price: 30000 }
                ]
            },
            {
                id: 'ORD002',
                status: 'Processing',
                total: 85000,
                date: new Date(Date.now() - 86400000).toISOString(),
                items: [
                    { name: 'Bluetooth Headphones', price: 85000 }
                ]
            }
        ];
        res.json(mockOrders);
    } catch (error) {
        console.error('Orders error:', error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// FAVORITES API
app.get('/api/favorites', async (req, res) => {
    try {
        // In a real app, you'd get user ID from JWT token
        // For now, return mock data
        const mockFavorites = [
            {
                id: 1,
                name: 'MacBook Pro M3',
                price: 2500000,
                description: 'Latest MacBook Pro with M3 chip'
            },
            {
                id: 2,
                name: 'iPad Air',
                price: 580000,
                description: '10.9-inch Liquid Retina display'
            }
        ];
        res.json(mockFavorites);
    } catch (error) {
        console.error('Favorites error:', error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// ADD TO FAVORITES API
app.post('/api/favorites', async (req, res) => {
    try {
        const { productId, name, price, description } = req.body;
        
        // In a real app, you'd save to database with user ID from JWT
        // For now, just return success
        console.log(`Added to favorites: ${name}`);
        res.json({ success: true, message: "Added to favorites" });
    } catch (error) {
        console.error('Add to favorites error:', error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log(`Cozy's Enterprise running on port ${PORT}`));