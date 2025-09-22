const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');


const app = express();
app.use(cors());
app.use(express.json());

// --------- ADMIN API (alias สำหรับ client ที่เรียก /api/admin/reports) ---------
// --------- ADVANCED STATISTICS API (admin) ---------
app.get('/api/admin/reports/advance-statistics', authenticateToken, requireAdmin, async (req, res) => {
    try {
        // 1. Monthly stats (count by month)
        const monthlyStats = await Report.aggregate([
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m", date: "$created_at" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);
        // 2. Top rooms (by report count)
        const topRooms = await Report.aggregate([
            {
                $group: {
                    _id: "$room_number",
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);
        // 3. Top facilities (by report count)
        const topFacilities = await Report.aggregate([
            {
                $group: {
                    _id: "$facility",
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);
        // 4. Average time from created_at to updated_at (in days, only for done reports)
        const avg = await Report.aggregate([
            { $match: { status: "done" } },
            {
                $project: {
                    diff: {
                        $divide: [
                            { $subtract: ["$updated_at", "$created_at"] },
                            1000 * 60 * 60 * 24
                        ]
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    avgTime: { $avg: "$diff" }
                }
            }
        ]);
        res.json({
            monthlyStats: monthlyStats.map(m => ({ month: m._id, count: m.count })),
            topRooms: topRooms.map(r => ({ room_number: r._id, count: r.count })),
            topFacilities: topFacilities.map(f => ({ facility: f._id, count: f.count })),
            avgTime: avg.length > 0 ? Number(avg[0].avgTime.toFixed(2)) : null
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});
// GET รายการรีพอร์ต (admin เท่านั้น)
app.get('/api/admin/reports', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { status, room_number } = req.query;
        let filter = {};
        if (room_number) filter.room_number = room_number;
        if (status) filter.status = status;
        const reports = await Report.find(filter)
            .populate({ path: 'user_id', select: 'name username room_number' })
            .sort({ created_at: -1 });
        res.json(reports);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PATCH อัปเดตสถานะรีพอร์ต (admin เท่านั้น)
app.patch('/api/admin/reports/:id/status', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { status } = req.body;
        const report = await Report.findByIdAndUpdate(
            req.params.id,
            { status, updated_at: new Date() },
            { new: true }
        );
        if (!report) return res.status(404).json({ message: 'Report not found' });
        res.json(report);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create uploads folder if not exist
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// Multer config
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, unique + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

mongoose.connect('mongodb://localhost:27017/hotel', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

mongoose.connection.on('connected', () => {
    console.log('MongoDB connected to /hotel');
});
mongoose.connection.on('error', err => {
    console.error('MongoDB connection error:', err);
});

// Room Schema
const roomSchema = new mongoose.Schema({
    room_number: { type: String, required: true, unique: true },
    floor: Number,
    facilities: [String],
    occupied: { type: Boolean, default: false }
});
const Room = mongoose.model('Room', roomSchema);

// User Schema
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    room_number: { type: String },
    name: String,
    phone: String
});
const User = mongoose.model('User', userSchema);

// Report Schema
const reportSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    room_number: { type: String, required: true },
    facility: String,
    description: String,
    image_url: String,
    status: { type: String, enum: ['new', 'in-progress', 'done'], default: 'new' },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});
const Report = mongoose.model('Report', reportSchema);

// --- RoomDeletionLog schema (เพิ่มไว้หลัง Report model) ---
const roomDeletionLogSchema = new mongoose.Schema({
  room_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
  room_number: String,
  deleted_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  deleted_by_username: String,
  reason: String,
  force: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now }
});
const RoomDeletionLog = mongoose.model('RoomDeletionLog', roomDeletionLogSchema);

const JWT_SECRET = process.env.JWT_SECRET || 'secretkey';

// --------- AUTH MIDDLEWARE ---------
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Invalid token' });
        req.user = user;
        next();
    });
}
function requireAdmin(req, res, next) {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin only' });
    }
    next();
}

// --------- AUTH API ---------

// REGISTER
app.post('/api/register', async (req, res) => {
    try {
        const { username, password, name, room_id } = req.body;
        if (!username || !password || !name || !room_id) {
            return res.status(400).json({ message: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
        }
        const exists = await User.findOne({ username });
        if (exists) return res.status(400).json({ message: 'Username ซ้ำ' });
        const hash = await bcrypt.hash(password, 10);
        const user = new User({
            username,
            password: hash,
            name,
            role: 'user',
            room_number: room_id,
        });
        await user.save();
        res.json({ message: 'สมัครสมาชิกสำเร็จ!', user: { username, name, role: 'user', room_number: room_id } });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// LOGIN
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) return res.status(400).json({ message: 'กรุณากรอกข้อมูลให้ครบ' });
        const user = await User.findOne({ username });
        if (!user) return res.status(400).json({ message: 'User not found' });
        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(400).json({ message: 'รหัสผ่านผิด' });

    // Include room_number in token so we can authorize user queries by room
    const token = jwt.sign({ id: user._id, role: user.role, username: user.username, room_number: user.room_number }, JWT_SECRET, { expiresIn: '2d' });
        res.json({ 
            message: 'Login success', 
            token,
            user: { username: user.username, name: user.name, role: user.role, room_number: user.room_number, phone: user.phone || '' }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update authenticated user's phone number
app.patch('/api/user/phone', authenticateToken, async (req, res) => {
    try {
        const { phone } = req.body;
        if (typeof phone !== 'string' || phone.trim().length === 0) {
            return res.status(400).json({ message: 'Phone is required' });
        }
        const updated = await User.findByIdAndUpdate(
            req.user.id,
            { phone: phone.trim() },
            { new: true }
        ).select('username name role room_number phone');
        if (!updated) return res.status(404).json({ message: 'User not found' });
        res.json({ message: 'Phone updated', user: updated });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --------- ROOM API ---------
app.get('/api/rooms', async (req, res) => {
    try {
        const { floor } = req.query;
        let filter = {};
        if (floor) filter.floor = Number(floor);
        const rooms = await Room.find(filter);
        res.json(rooms);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});
app.get('/api/rooms/:room_number', async (req, res) => {
    try {
        const room = await Room.findOne({ room_number: req.params.room_number });
        if (!room) return res.status(404).json({ message: 'Room not found' });
        res.json(room);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --------- REPORT API (user) ---------
app.post('/api/report', upload.single('image'), authenticateToken, async (req, res) => {
    try {
        const { room_number, facility, description } = req.body;
        let image_url = null;
        if (req.file) {
            image_url = '/uploads/' + req.file.filename;
        }
        // ตรวจสอบว่าห้องมีอยู่จริง
        const room = await Room.findOne({ room_number });
        if (!room) return res.status(400).json({ message: 'Room not found' });

        const report = new Report({
            user_id: req.user.id,
            room_number,
            facility,
            description,
            image_url
        });
        await report.save();
        res.status(201).json({ message: 'Report created', report });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// เสิร์ฟไฟล์อัปโหลด
app.use('/uploads', express.static(uploadDir));

// GET รายการรีพอร์ต
// ผู้ใช้: ดูเฉพาะห้องตัวเอง, แอดมิน: ดูทั้งหมด
app.get('/api/reports', authenticateToken, async (req, res) => {
    try {
        const { status, room_number } = req.query;
        let filter = {};
        // ถ้าเป็น user ให้แสดงรายการแจ้งซ่อมทั้งหมดของห้องตัวเอง (อิงตาม room_number)
        console.log('[API] /api/reports called by user:', req.user);
        console.log('[API] query params:', req.query);
        if (req.user.role === 'user') {
            // If token doesn't include room_number (older tokens), fetch it from DB
            if (!req.user.room_number) {
                try {
                    const dbUser = await User.findById(req.user.id).select('room_number');
                    if (dbUser) filter.room_number = dbUser.room_number;
                } catch (e) {
                    console.warn('[API] failed to fetch user for room_number fallback', e.message);
                }
            } else {
                filter.room_number = req.user.room_number;
            }
        } else if (room_number) {
            filter.room_number = room_number;
        }
        if (status) filter.status = status;

        console.log('[API] computed filter:', filter);
        const reports = await Report.find(filter)
            .populate({ path: 'user_id', select: 'name username room_number' })
            .sort({ created_at: -1 });
        console.log('[API] reports found:', reports.length);
        res.json(reports);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
})

// PATCH อัปเดตสถานะรีพอร์ต (admin รับงาน/สำเร็จ)
app.patch('/api/reports/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { status } = req.body;
        const report = await Report.findByIdAndUpdate(
            req.params.id,
            { status, updated_at: new Date() },
            { new: true }
        );
        if (!report) return res.status(404).json({ message: 'Report not found' });
        res.json({ message: 'Status updated', report });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --------- ADMIN API (ตัวอย่าง) ---------
app.get('/api/admin/reports/statistics', authenticateToken, requireAdmin, async (req, res) => {
    // รายงานสถิติ
    try {
        const counts = await Report.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);
        const summary = { new: 0, 'in-progress': 0, done: 0 };
        counts.forEach(c => { summary[c._id] = c.count; });
        res.json(summary);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ... เพิ่ม endpoint อื่น ๆ ได้ตามที่ต้องการ ...

// -------------------- START SERVER --------------------
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

// Create room (admin)
app.post('/api/rooms', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { room_number, floor, occupied } = req.body;
        if (!room_number) return res.status(400).json({ message: 'room_number is required' });
        const exists = await Room.findOne({ room_number });
        if (exists) return res.status(400).json({ message: 'Room already exists' });
        const room = new Room({ room_number, floor: Number(floor || 1), occupied: !!occupied });
        await room.save();
        res.status(201).json(room);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update room full (admin)
app.put('/api/rooms/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { room_number, floor, occupied } = req.body;
        const room = await Room.findByIdAndUpdate(req.params.id, { room_number, floor: Number(floor || 1), occupied: !!occupied }, { new: true });
        if (!room) return res.status(404).json({ message: 'Room not found' });
        res.json(room);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PATCH partial update (admin) - used for toggling occupancy
app.patch('/api/rooms/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const updates = {};
        if (req.body.hasOwnProperty('occupied')) updates.occupied = !!req.body.occupied;
        if (req.body.hasOwnProperty('floor')) updates.floor = Number(req.body.floor);
        if (req.body.hasOwnProperty('room_number')) updates.room_number = req.body.room_number;
        const room = await Room.findByIdAndUpdate(req.params.id, updates, { new: true });
        if (!room) return res.status(404).json({ message: 'Room not found' });
        res.json(room);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// DELETE room (admin) - check occupancy / assigned users before deleting, support force + reason, save deletion log
app.delete('/api/rooms/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found' });

    // read force/reason from body (axios.delete allows data) or query
    const force = !!(req.body?.force || req.query?.force === 'true');
    const reason = (req.body?.reason || req.query?.reason || '').trim();

    // ตรวจสอบผู้ใช้อ้างถึงห้อง
    const assignedCount = await User.countDocuments({
      $or: [
        { room_number: room.room_number },
        { room_id: room._id }
      ]
    });

    // หาก occupied หรือ assigned users และไม่ได้ใช้ force -> ห้ามลบ
    if ((room.occupied || assignedCount > 0) && !force) {
      return res.status(400).json({ message: 'ไม่สามารถลบห้องที่ยังมีผู้เช่าหรือมีผู้ถูกกำหนดให้ โปรดใช้ Force delete หากต้องการลบ' });
    }

    // ถ้าใช้ force ต้องมีเหตุผล
    if (force && !reason) {
      return res.status(400).json({ message: 'ต้องระบุเหตุผลเมื่อใช้ Force delete' });
    }

    const roomNumber = room.room_number;

    // ลบห้อง
    await Room.findByIdAndDelete(req.params.id);

    // ลบรายงานที่เกี่ยวข้อง
    if (roomNumber) {
      await Report.deleteMany({ room_number: roomNumber });
    }

    // unset room references ใน User (fallback)
    await User.updateMany(
      { $or: [{ room_number: roomNumber }, { room_id: room._id }] },
      { $unset: { room_number: "", room_id: "" } }
    );

    // บันทึก log การลบ
    try {
      const adminId = req.user?._id || req.user?.id || null;
      const adminUsername = req.user?.username || null;
      await RoomDeletionLog.create({
        room_id: room._id,
        room_number: roomNumber,
        deleted_by: adminId,
        deleted_by_username: adminUsername,
        reason,
        force
      });
    } catch (logErr) {
      console.warn('Room deletion logged failed:', logErr.message);
    }

    return res.json({ message: 'Room deleted', room_number: roomNumber });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});