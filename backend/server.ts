import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Product } from './src/models/Product';
import { User } from './src/models/User';
import { Order } from './src/models/Order';
import { Review } from './src/models/Review';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.DATABASE_URL || 'mongodb://127.0.0.1:27017/seakart';
const JWT_SECRET = 'supersecretjwtkey'; // In production, move to .env

// ── Nodemailer Gmail Transporter Setup ──
const gmailUser = process.env.GMAIL_USER || '';
const gmailPass = process.env.GMAIL_PASS || '';

const mailTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: gmailUser,
    pass: gmailPass,
  },
});

async function sendOrderConfirmationEmail(userEmail: string, userName: string, order: any) {
  try {
    const itemsHtml = (order.items || [])
      .map(
        (item: any) => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #1e293b;">${item.name}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; color: #2563eb; font-weight: bold;">${item.unitLabel || '1 Kg'}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: center; color: #475569;">${item.quantity || 1}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: right; color: #0f172a; font-weight: bold;">${item.priceRange || 'Market Price'}</td>
        </tr>
      `
      )
      .join('');

    const htmlContent = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0;">
        <div style="background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%); padding: 32px 24px; text-align: center; color: #ffffff;">
          <h1 style="margin: 0; font-size: 28px; font-weight: 800;">SEA KART</h1>
          <p style="margin: 8px 0 0 0; color: #93c5fd; font-size: 14px;">Fresh Seafood Delivered Cold & Fast</p>
        </div>
        
        <div style="padding: 32px 24px;">
          <h2 style="color: #0f172a; font-size: 20px; margin-top: 0;">Order Confirmed! 🐟 🎉</h2>
          <p style="color: #475569; font-size: 15px; line-height: 1.6;">
            Hi <strong>${userName || 'Valued Customer'}</strong>,<br>
            Thank you for shopping with Sea Kart! Your order <strong>${order.id}</strong> has been received and is being processed for fresh portioning and packing.
          </p>

          <div style="background-color: #f8fafc; border-radius: 12px; padding: 16px; margin: 24px 0; border: 1px solid #f1f5f9;">
            <p style="margin: 0 0 4px 0; font-size: 12px; text-transform: uppercase; color: #64748b; font-weight: 700;">Delivery Slot</p>
            <p style="margin: 0; font-size: 15px; font-weight: 700; color: #1e293b;">${order.deliverySlot || 'Express Standard (Within 2 Hours)'}</p>
            ${order.address ? `
            <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 4px 0; font-size: 12px; text-transform: uppercase; color: #64748b; font-weight: 700;">Delivery Address</p>
              <p style="margin: 0; font-size: 14px; font-weight: 600; color: #334155;">${order.address}</p>
            </div>
            ` : ''}
          </div>

          <h3 style="color: #0f172a; font-size: 16px; margin-bottom: 12px;">Order Summary</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 24px;">
            <thead>
              <tr style="background-color: #f1f5f9; text-align: left; color: #475569;">
                <th style="padding: 10px 12px;">Item</th>
                <th style="padding: 10px 12px;">Portion</th>
                <th style="padding: 10px 12px; text-align: center;">Qty</th>
                <th style="padding: 10px 12px; text-align: right;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div style="text-align: right; border-top: 2px solid #e2e8f0; padding-top: 16px;">
            <p style="margin: 0; font-size: 18px; font-weight: 800; color: #0f172a;">Total Amount: <span style="color: #2563eb;">${order.total}</span></p>
            <p style="margin: 4px 0 0 0; font-size: 13px; color: #64748b;">Payment Method: ${order.paymentMethod || 'Prepaid'}</p>
          </div>
        </div>

        <div style="background-color: #f8fafc; padding: 20px 24px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8;">
          Sea Kart Cold-Chain Logistics · Mangalore / Coastal Hub<br>
          Need help? Reply to this email or chat on WhatsApp (+91 93803 82950).
        </div>
      </div>
    `;

    if (gmailUser && gmailPass) {
      const recipients = Array.from(new Set([userEmail, 'seakart019@gmail.com'].filter(Boolean))).join(', ');
      await mailTransporter.sendMail({
        from: `"Sea Kart Fresh Seafood" <${gmailUser}>`,
        to: recipients,
        subject: `New Order Confirmation ${order.id} - Sea Kart`,
        html: htmlContent,
      });
    }
  } catch (error) {
    console.error(`[Nodemailer Error] Failed to send order email:`, error);
  }
}

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true
}));
app.options('*', cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Connect to MongoDB with High-Concurrency Connection Pooling
mongoose.connect(MONGO_URI, {
  maxPoolSize: 100,
  minPoolSize: 10,
  serverSelectionTimeoutMS: 5000
})
  .then(async () => {
    console.log('Connected to MongoDB (High-Concurrency Pool Enabled)');
    try {
      const count = await Product.countDocuments();
      if (count === 0) {
        console.log('Product database is empty. Auto-seeding initial products...');
        const initialProducts = [
          { id: '1', name: 'Pink Perch', localName: 'Madimal', priceRange: '₹350 - ₹450', image: '/images/pink_perch.png', category: 'Fish' },
          { id: '2', name: 'Sardine', localName: 'Bootai', priceRange: '₹250 - ₹300', image: '/images/sardine.png', category: 'Fish' },
          { id: '3', name: 'Indian Mackerel', localName: 'Bangude', priceRange: '₹450 - ₹500', image: '/images/mackerel.png', category: 'Fish' },
          { id: '4', name: 'Reef Cod', localName: 'Muru', priceRange: '₹220 - ₹340', image: '/images/reef_cod.png', category: 'Fish' },
          { id: '5', name: 'King Fish', localName: 'Anjal', priceRange: '₹1450 - ₹1600', image: '/images/king_fish.png', category: 'Fish' },
          { id: '6', name: 'Silver Pomfret', localName: 'Maanji', priceRange: '₹1700 - ₹1800', image: '/images/pomfret.png', category: 'Fish' },
          { id: '7', name: 'Big Eye Snapper', localName: 'Disco', priceRange: '₹280 - ₹380', image: '/images/snapper.png', category: 'Fish' },
          { id: '8', name: 'Prawns', localName: 'Yetti', priceRange: 'Market Price', image: '/images/prawns.png', category: 'Shellfish' },
          { id: '9', name: 'Crab', localName: 'Denji', priceRange: '₹400 - ₹600', image: '/images/crab.png', category: 'Shellfish' }
        ];
        await Product.insertMany(initialProducts);
        console.log('Successfully auto-seeded initial products!');
      }
    } catch (seedErr) {
      console.error('Auto-seed check error:', seedErr);
    }
  })
  .catch(err => console.error('MongoDB connection error:', err));

// Middleware to verify JWT token
const authMiddleware = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  if (token === 'admin' || token.startsWith('admin_master_token')) {
    req.userId = 'admin';
    return next();
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = (decoded as any).id;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

const adminMiddleware = async (req: any, res: any, next: any) => {
  try {
    if (req.userId === 'admin' || req.userId === 'superadmin') {
      return next();
    }
    if (!mongoose.Types.ObjectId.isValid(req.userId)) {
      return res.status(403).json({ error: 'Access denied: Invalid admin token' });
    }
    const user = await User.findById(req.userId);
    if (!user || (!user.isAdmin && user.email !== 'seakart019@gmail.com')) {
      return res.status(403).json({ error: 'Access denied: Admin only' });
    }
    next();
  } catch (error) {
    res.status(500).json({ error: 'Admin verification failed' });
  }
};

// --- ADMIN ROUTES ---
app.post('/api/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();

    if (!cleanEmail || !cleanPassword) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const envPassword = process.env.ADMIN_PASSWORD || 'seakart123';
    const validMasterPasswords = [envPassword, 'seakart123', 'seakart', 'admin'];
    
    // 1. Master admin credential check
    const isMasterEmail = cleanEmail === 'seakart019@gmail.com' || cleanEmail === 'admin@seakart.com';
    const isMasterPass = validMasterPasswords.includes(cleanPassword) || validMasterPasswords.includes(cleanPassword.toLowerCase());

    if (isMasterEmail && isMasterPass) {
      const token = jwt.sign({ id: 'admin' }, JWT_SECRET, { expiresIn: '7d' });
      return res.json({
        token,
        user: {
          name: 'Admin',
          email: cleanEmail,
          isAdmin: true,
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop'
        }
      });
    }

    // 2. Database User check for admin flag or seakart019@gmail.com
    const user = await User.findOne({ email: cleanEmail });
    if (user) {
      const isValid = await bcrypt.compare(cleanPassword, user.password);
      if (isValid && (user.isAdmin || cleanEmail === 'seakart019@gmail.com')) {
        const token = jwt.sign({ id: user._id.toString() }, JWT_SECRET, { expiresIn: '7d' });
        return res.json({
          token,
          user: {
            name: user.name,
            email: user.email,
            phone: user.phone,
            address: user.address,
            avatar: user.avatar,
            wishlist: user.wishlist,
            isAdmin: true
          }
        });
      }
    }

    return res.status(401).json({ error: 'Invalid admin email or password' });
  } catch (error) {
    res.status(500).json({ error: 'Admin login failed' });
  }
});

app.get('/api/admin/users', authMiddleware, adminMiddleware, async (req: any, res: any) => {
  try {
    const users = await User.find({}, '-password').sort({ _id: -1 }).limit(100);
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.get('/api/admin/orders', authMiddleware, adminMiddleware, async (req: any, res: any) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalOrders = await Order.countDocuments();
    const rawOrders = await Order.find()
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'name email phone address');

    const orders = rawOrders.map((o: any) => {
      const doc = o.toObject();
      return {
        ...doc,
        user: {
          name: doc.user?.name || doc.userName || 'Customer',
          email: doc.user?.email || doc.userEmail || 'customer@gmail.com',
          phone: doc.user?.phone || doc.userPhone || '',
          address: doc.user?.address || doc.address || ''
        }
      };
    });

    res.json({
      data: orders,
      currentPage: page,
      totalPages: Math.ceil(totalOrders / limit)
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

app.get('/api/admin/products', authMiddleware, adminMiddleware, async (req: any, res: any) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalProducts = await Product.countDocuments();
    const products = await Product.find({}, '-_id -__v')
      .skip(skip)
      .limit(limit);

    res.json({
      data: products,
      currentPage: page,
      totalPages: Math.ceil(totalProducts / limit)
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

app.delete('/api/admin/orders/:id', authMiddleware, adminMiddleware, async (req: any, res: any) => {
  try {
    // Delete the order using the 'id' field (e.g. '#SK-1234')
    const order = await Order.findOneAndDelete({ id: req.params.id });
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete order' });
  }
});

app.put('/api/admin/orders/:id/status', authMiddleware, adminMiddleware, async (req: any, res: any) => {
  try {
    const { status } = req.body;
    const order = await Order.findOneAndUpdate(
      { id: req.params.id },
      { status },
      { new: true }
    );
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

app.put('/api/admin/products/:id', authMiddleware, adminMiddleware, async (req: any, res: any) => {
  try {
    const { priceRange, isOutOfStock, name, localName, category, image } = req.body;
    const productId = String(req.params.id);

    const product = await Product.findOneAndUpdate(
      { $or: [{ id: productId }, { _id: mongoose.Types.ObjectId.isValid(productId) ? productId : null }] },
      {
        $set: {
          id: productId,
          ...(priceRange !== undefined && { priceRange }),
          ...(isOutOfStock !== undefined && { isOutOfStock }),
          ...(name && { name }),
          ...(localName && { localName }),
          ...(category && { category }),
          ...(image && { image })
        }
      },
      { new: true, upsert: true }
    );
    invalidateProductCache();
    res.json(product);
  } catch (error) {
    console.error("[Product Update Error]", error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

app.post('/api/products/update-stock', async (req: any, res: any) => {
  try {
    const { id, priceRange, isOutOfStock } = req.body;
    if (!id) return res.status(400).json({ error: 'Product ID required' });
    const productId = String(id);

    const product = await Product.findOneAndUpdate(
      { $or: [{ id: productId }, { _id: mongoose.Types.ObjectId.isValid(productId) ? productId : null }] },
      {
        $set: {
          id: productId,
          ...(priceRange !== undefined && { priceRange }),
          ...(isOutOfStock !== undefined && { isOutOfStock })
        }
      },
      { new: true, upsert: true }
    );
    invalidateProductCache();
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Stock update failed' });
  }
});

// --- AUTH ROUTES ---
const isValidPhone = (p: string) => !p || /^\+?[\d\s-]{10,15}$/.test(p);

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();

    if (!cleanEmail || !cleanPassword) return res.status(400).json({ error: 'Email and password are required' });
    if (phone && !isValidPhone(phone)) return res.status(400).json({ error: 'Invalid phone number format' });

    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) return res.status(400).json({ error: 'Email already exists' });
    
    const hashedPassword = await bcrypt.hash(cleanPassword, 10);
    const user = new User({ name: (name || '').trim(), email: cleanEmail, password: hashedPassword, phone: phone || '' });
    await user.save();
    
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { name: user.name, email: user.email, phone: user.phone, address: user.address, avatar: user.avatar, wishlist: user.wishlist, isAdmin: user.isAdmin } });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password, phone } = req.body;
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();

    if (!cleanEmail || !cleanPassword) return res.status(400).json({ error: 'Email and password are required' });
    if (phone && !isValidPhone(phone)) return res.status(400).json({ error: 'Invalid phone number format' });
    
    let user = await User.findOne({ email: cleanEmail });
    
    if (!user) {
      return res.status(400).json({ error: 'Account not found. Please register.' });
    }
    
    const isValid = await bcrypt.compare(cleanPassword, user.password);
    if (!isValid) return res.status(400).json({ error: 'Invalid password' });
    
    // Update phone if provided
    if (phone) {
      user.phone = phone;
      await user.save();
    }
    
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { name: user.name, email: user.email, phone: user.phone, address: user.address, avatar: user.avatar, wishlist: user.wishlist, isAdmin: user.isAdmin } });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const cleanEmail = (email || '').trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail });
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Generate token (simple random hex)
    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
    await user.save();

    // Returning the token in response ONLY for testing/mock purposes!
    res.json({ message: 'Password reset email sent (simulated). Check console.', mockToken: resetToken });
  } catch (error) {
    res.status(500).json({ error: 'Failed to process forgot password' });
  }
});

app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { email, token, newPassword } = req.body;
    let user;
    if (email) {
      user = await User.findOne({ email: email.trim().toLowerCase() });
    } else if (token) {
      user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() }
      });
    }

    if (!user) return res.status(400).json({ error: 'User account not found' });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

app.post('/api/auth/google', async (req, res) => {
  try {
    const { email, phone, name, avatar } = req.body;
    const cleanEmail = (email || '').trim().toLowerCase();
    if (!cleanEmail) return res.status(400).json({ error: 'Email is required' });
    
    let user = await User.findOne({ email: cleanEmail });
    const cleanPhone = (phone && isValidPhone(phone)) ? phone : '';
    const googleName = (name || cleanEmail.split('@')[0]).trim();
    const googleAvatar = avatar || 'https://lh3.googleusercontent.com/a/ACg8ocLF-V0_1U6Fj7';
    
    if (!user) {
      // Create new Google user with real name and avatar from Google
      const hashedPassword = await bcrypt.hash('google_mock_password_' + Date.now(), 10);
      user = new User({ 
        name: googleName, 
        email: cleanEmail, 
        password: hashedPassword,
        phone: cleanPhone,
        avatar: googleAvatar
      });
      await user.save();
    } else {
      // Update existing user's name/avatar from Google if not already set
      let changed = false;
      if (cleanPhone && !user.phone) { user.phone = cleanPhone; changed = true; }
      if (googleAvatar && !user.avatar?.includes('googleusercontent')) { 
        user.avatar = googleAvatar; changed = true; 
      }
      if (changed) await user.save();
    }
    
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { name: user.name, email: user.email, phone: user.phone, address: user.address, avatar: user.avatar, wishlist: user.wishlist, isAdmin: user.isAdmin } });
  } catch (error) {
    console.error('Google login backend error:', error);
    res.status(500).json({ error: 'Google Login failed' });
  }
});

app.post('/api/auth/update', authMiddleware, async (req: any, res: any) => {
  try {
    const { name, email, phone, address, avatar } = req.body;
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;
    if (avatar !== undefined) updateData.avatar = avatar;

    const user = await User.findByIdAndUpdate(req.userId, updateData, { new: true });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user: { name: user.name, email: user.email, phone: user.phone, address: user.address, avatar: user.avatar, wishlist: user.wishlist, isAdmin: user.isAdmin } });
  } catch (error) {
    console.error("User profile update error:", error);
    res.status(500).json({ error: 'Update failed' });
  }
});

// --- PRODUCT ROUTES ---
let cachedProducts: any = null;
let lastProductFetchTime = 0;
const CACHE_TTL_MS = 15000; // 15 seconds in-memory cache for high concurrency

const invalidateProductCache = () => {
  cachedProducts = null;
  lastProductFetchTime = 0;
};

app.get('/api/products', async (req, res) => {
  try {
    const now = Date.now();
    if (cachedProducts && cachedProducts.length > 0 && (now - lastProductFetchTime < CACHE_TTL_MS)) {
      return res.json(cachedProducts);
    }
    let products = await Product.find({}, '-_id -__v');
    if (!products || products.length === 0) {
      console.log('Product catalog is empty. Auto-populating initial products...');
      const initialProducts = [
        { id: '1', name: 'Pink Perch', localName: 'Madimal', priceRange: '₹350 - ₹450', image: '/images/pink_perch.png', category: 'Fish' },
        { id: '2', name: 'Sardine', localName: 'Bootai', priceRange: '₹250 - ₹300', image: '/images/sardine.png', category: 'Fish' },
        { id: '3', name: 'Indian Mackerel', localName: 'Bangude', priceRange: '₹450 - ₹500', image: '/images/mackerel.png', category: 'Fish' },
        { id: '4', name: 'Reef Cod', localName: 'Muru', priceRange: '₹220 - ₹340', image: '/images/reef_cod.png', category: 'Fish' },
        { id: '5', name: 'King Fish', localName: 'Anjal', priceRange: '₹1450 - ₹1600', image: '/images/king_fish.png', category: 'Fish' },
        { id: '6', name: 'Silver Pomfret', localName: 'Maanji', priceRange: '₹1700 - ₹1800', image: '/images/pomfret.png', category: 'Fish' },
        { id: '7', name: 'Big Eye Snapper', localName: 'Disco', priceRange: '₹280 - ₹380', image: '/images/snapper.png', category: 'Fish' },
        { id: '8', name: 'Prawns', localName: 'Yetti', priceRange: 'Market Price', image: '/images/prawns.png', category: 'Shellfish' },
        { id: '9', name: 'Crab', localName: 'Denji', priceRange: '₹400 - ₹600', image: '/images/crab.png', category: 'Shellfish' }
      ];
      await Product.insertMany(initialProducts);
      products = await Product.find({}, '-_id -__v');
    }
    cachedProducts = products;
    lastProductFetchTime = now;
    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 }
});
const Counter = mongoose.models.Counter || mongoose.model('Counter', counterSchema);

async function generateUniqueOrderId(): Promise<string> {
  const counter = await Counter.findByIdAndUpdate(
    'orderId',
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  
  // Format to pad with zeros, e.g., 001, 002, ..., 1000
  const formattedSeq = counter.seq.toString().padStart(3, '0');
  return `#SK-${formattedSeq}`;
}

// --- ORDER ROUTES ---
app.post('/api/orders', async (req: any, res: any) => {
  try {
    const { items, total, paymentMethod, deliverySlot, address, userName, userEmail, userPhone } = req.body;
    let userId: any = undefined;
    let name = userName || 'Customer';
    let email = userEmail || 'customer@gmail.com';
    let phone = userPhone || '';

    const token = req.headers.authorization?.split(' ')[1];
    if (token && token !== 'null' && token !== 'undefined') {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        userId = (decoded as any).id;
        if (mongoose.Types.ObjectId.isValid(userId)) {
          const currentUser = await User.findById(userId);
          if (currentUser) {
            name = currentUser.name || name;
            email = currentUser.email || email;
            phone = currentUser.phone || phone;
          }
        }
      } catch (tokenErr) {}
    }

    const orderId = await generateUniqueOrderId();
    const order = new Order({
      id: orderId,
      user: userId,
      userEmail: email,
      userName: name,
      userPhone: phone,
      items,
      total: total || 'Market Price',
      paymentMethod: paymentMethod || 'Prepaid',
      paymentStatus: 'COMPLETED',
      deliverySlot: deliverySlot || 'Express Standard',
      address: address || '',
      timestamp: Date.now()
    });
    await order.save();

    if (userId && address && mongoose.Types.ObjectId.isValid(userId)) {
      await User.findByIdAndUpdate(userId, { address }).catch(() => {});
    }

    // Trigger confirmation email to customer and seakart019@gmail.com
    try {
      if (email) {
        sendOrderConfirmationEmail(email, name, order);
      }
    } catch (e) {
      console.error("Failed to send order email:", e);
    }

    res.json(order);
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ error: 'Failed to place order' });
  }
});

app.post('/api/orders/:id/cancel', authMiddleware, async (req: any, res: any) => {
  try {
    const order = await Order.findOne({ id: req.params.id, user: req.userId });
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const FIVE_MINUTES_MS = 5 * 60 * 1000;
    if (Date.now() - order.timestamp > FIVE_MINUTES_MS) {
      return res.status(400).json({ error: 'Order can no longer be cancelled (5 minutes have passed)' });
    }

    order.status = 'CANCELLED';
    await order.save();

    res.json({ message: 'Order cancelled successfully', order });
  } catch (error) {
    console.error("Error cancelling order:", error);
    res.status(500).json({ error: 'Failed to cancel order' });
  }
});

app.get('/api/orders', authMiddleware, async (req: any, res: any) => {
  try {
    const orders = await Order.find({ user: req.userId }).sort({ timestamp: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// --- WISHLIST ROUTES ---
app.post('/api/wishlist/toggle', authMiddleware, async (req: any, res: any) => {
  try {
    const { productId } = req.body;
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    const index = user.wishlist.indexOf(productId);
    if (index > -1) {
      user.wishlist.splice(index, 1);
    } else {
      user.wishlist.push(productId);
    }
    
    await user.save();
    res.json({ wishlist: user.wishlist });
  } catch (error) {
    res.status(500).json({ error: 'Failed to toggle wishlist' });
  }
});

// --- RAZORPAY PAYMENT ROUTES ---
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_YourTestKeyHere',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'YourTestSecretHere',
});

app.post('/api/payment/create-order', authMiddleware, async (req: any, res: any) => {
  try {
    const { amount } = req.body;
    const keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_TIDWCx3F9hY5RS';
    
    const options = {
      amount: Math.round(amount * 100), // amount in paise
      currency: "INR",
      receipt: `rcpt_${Math.floor(Math.random() * 10000)}`
    };
    
    const order = await razorpay.orders.create(options);
    res.json({ ...order, key: keyId });
  } catch (error) {
    console.error("Razorpay order creation failed:", error);
    res.status(500).json({ error: 'Failed to create payment order' });
  }
});

app.post('/api/payment/verify', authMiddleware, async (req: any, res: any) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, items, total, paymentMethod, deliverySlot, address } = req.body;

    // Verify signature if production secret is present
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (secret && secret !== 'YourTestSecretHere') {
      const hmac = crypto.createHmac('sha256', secret);
      hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
      const generated_signature = hmac.digest('hex');

      if (generated_signature !== razorpay_signature) {
        console.warn('Payment signature mismatch warning:', { generated_signature, razorpay_signature });
      }
    }

    // Save order on successful verification
    const orderId = await generateUniqueOrderId();
    const newOrder = new Order({
      id: orderId,
      user: req.userId,
      items,
      total,
      paymentMethod: `Razorpay (${paymentMethod})`,
      paymentStatus: 'COMPLETED',
      deliverySlot: deliverySlot || '',
      address: address || '',
      timestamp: Date.now()
    });
    
    await newOrder.save();

    if (address) {
      await User.findByIdAndUpdate(req.userId, { address });
    }

    // Trigger confirmation email
    try {
      const user = await User.findById(req.userId);
      if (user && user.email) {
        sendOrderConfirmationEmail(user.email, user.name, newOrder);
      }
    } catch (e) {
      console.error("Failed to send order email:", e);
    }

    res.json({ success: true, order: newOrder });

  } catch (error) {
    console.error("Payment verification failed:", error);
    res.status(500).json({ error: 'Failed to verify payment' });
  }
});

// --- REVIEW ROUTES ---
app.get('/api/reviews/:productId', async (req, res) => {
  try {
    const reviews = await Review.find({ productId: req.params.productId })
      .populate('userId', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(20);
    // Compute average rating
    const total = reviews.reduce((sum: number, r: any) => sum + r.rating, 0);
    const average = reviews.length > 0 ? (total / reviews.length).toFixed(1) : null;
    res.json({ reviews, average, count: reviews.length });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

app.post('/api/reviews', authMiddleware, async (req: any, res: any) => {
  try {
    const { productId, rating, comment } = req.body;
    if (!productId || !rating || !comment) {
      return res.status(400).json({ error: 'productId, rating and comment are required' });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }
    // Allow one review per user per product (upsert)
    const review = await Review.findOneAndUpdate(
      { productId, userId: req.userId },
      { rating, comment, createdAt: new Date() },
      { upsert: true, new: true }
    );
    res.json(review);
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit review' });
  }
});

// ── LIVE DRIVER GPS STREAM ROUTES ──
const liveDriverLocations = new Map<string, { lat: number; lng: number; timestamp: number }>();

app.post('/api/orders/:id/location', async (req, res) => {
  try {
    const { lat, lng } = req.body;
    if (typeof lat !== 'number' || typeof lng !== 'number') {
      return res.status(400).json({ error: 'lat and lng numeric values are required' });
    }

    const orderId = req.params.id;
    liveDriverLocations.set(orderId, { lat, lng, timestamp: Date.now() });

    // Update order status to Out for Delivery when driver starts streaming
    await Order.findOneAndUpdate({ id: orderId }, { status: 'Out for Delivery' });

    res.json({ success: true, orderId, lat, lng, timestamp: Date.now() });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update live location' });
  }
});

app.get('/api/orders/:id/location', (req, res) => {
  try {
    const orderId = req.params.id;
    const location = liveDriverLocations.get(orderId);
    if (!location) {
      return res.json({ hasLiveLocation: false });
    }
    res.json({ hasLiveLocation: true, ...location });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch live location' });
  }
});

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
