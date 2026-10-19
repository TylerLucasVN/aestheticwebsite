require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const app = express();

// Cho phép Frontend gọi API mà không bị chặn lỗi CORS
app.use(cors());
app.use(express.json());

// ==========================================
// THIẾT LẬP KHUÔN MẪU DỮ LIỆU (SCHEMAS)
// ==========================================

// Schema Sản phẩm (Giữ nguyên của bạn)
const productSchema = new mongoose.Schema({
    id: mongoose.Schema.Types.Mixed,
    name: String,
    image: String,
    category: String,
    price: mongoose.Schema.Types.Mixed,
    tag: String,
    description: String,
    sizes: [String]
});
const Product = mongoose.model('Product', productSchema, 'products');

// Schema Tài khoản người dùng 
const userSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    cart: { type: Array, default: [] },
    favorites: { type: Array, default: [] }
});
const User = mongoose.model('User', userSchema, 'users');


// ==========================================
// CÁC ĐƯỜNG DẪN API (ROUTES)
// ==========================================

// --- API SẢN PHẨM ---
app.get('/api/v1/products', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi Server" });
    }
});

app.get('/api/v1/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        let product = await Product.findOne({
            $or: [
                { id: id },
                { id: !isNaN(id) ? Number(id) : id }
            ]
        });

        if (!product && mongoose.Types.ObjectId.isValid(id)) {
            product = await Product.findById(id);
        }

        if (!product) {
            return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
        }
        res.json(product);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi Server" });
    }
});

// --- API TÀI KHOẢN ---
const isNonEmptyString = (v) => typeof v === 'string' && v.trim().length > 0;
const EMAIL_RE = /^\S+@\S+\.\S+$/;

app.post('/api/v1/users/register', async (req, res) => {
    try {
        const { name, email, password } = req.body || {};

        if (![name, email, password].every(isNonEmptyString))
            return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin" });

        const cleanEmail = email.trim().toLowerCase();
        if (!EMAIL_RE.test(cleanEmail))
            return res.status(400).json({ message: "Email không hợp lệ" });
        if (password.length < 6 || password.length > 72)
            return res.status(400).json({ message: "Mật khẩu phải từ 6 đến 72 ký tự" });

        if (await User.findOne({ email: cleanEmail }))
            return res.status(409).json({ message: "Email đã được đăng ký" });

        const hashedPassword = await bcrypt.hash(password, saltRounds);
        await new User({ name: name.trim(), email: cleanEmail, password: hashedPassword }).save();
        res.status(201).json({ message: "Đăng ký thành công!" });
    } catch (error) {
        if (error.code === 11000)   // 2 người đăng ký trùng email cùng lúc
            return res.status(409).json({ message: "Email đã được đăng ký" });
        console.error('REGISTER ERROR:', error);
        res.status(500).json({ message: "Lỗi server, vui lòng thử lại" });
    }
});

app.post('/api/v1/users/login', async (req, res) => {
    try {
        const { email, password } = req.body || {};

        if (!isNonEmptyString(email) || !isNonEmptyString(password))
            return res.status(400).json({ message: "Vui lòng nhập email và mật khẩu" });

        const user = await User.findOne({ email: email.trim().toLowerCase() });
        // Cùng 1 thông báo cho "không có email" và "sai mật khẩu"
        if (!user || !(await bcrypt.compare(password, user.password)))
            return res.status(401).json({ message: "Email hoặc mật khẩu không đúng" });

        res.status(200).json({
            message: "Đăng nhập thành công!",
            user: { id: user._id, name: user.name, email: user.email }
        });
    } catch (error) {
        console.error('LOGIN ERROR:', error);
        res.status(500).json({ message: "Lỗi server, vui lòng thử lại" });
    }
});

// ==========================================
// KHỞI ĐỘNG SERVER
// ==========================================
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('✅ Đã kết nối thành công với MongoDB Atlas!');
        app.listen(PORT, () => console.log(`🚀 Server đang chạy tại: http://localhost:${PORT}`));
    })
    .catch(err => {
        console.error('❌ Lỗi kết nối:', err.message);
        process.exit(1);
    });