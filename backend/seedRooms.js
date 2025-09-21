// สคริปต์สำหรับ seed ห้องพักและอุปกรณ์แต่ละชั้น
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/hotel', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const roomSchema = new mongoose.Schema({
  room_number: { type: String, required: true, unique: true },
  floor: Number,
  facilities: [String]
});
const Room = mongoose.model('Room', roomSchema);

async function seedRooms() {
  await Room.deleteMany({});
  const commonBathroom = [
    'อ่างล้างหน้า',
    'กระจก',
    'ฝักบัว',
    'โถ่ซักโครก',
    'ที่ฉีดก้น'
  ];
  const rooms = [];
  // ชั้น 1
  for (let i = 1; i <= 10; i++) {
    rooms.push({
      room_number: `1${i.toString().padStart(2, '0')}`,
      floor: 1,
      facilities: [
        'พัดลม',
        'ตู้เสื้อผ้า',
        'เตียง',
        'โต๊ะเครื่องแป้ง',
        ...commonBathroom
      ]
    });
  }
  // ชั้น 2
  for (let i = 1; i <= 10; i++) {
    rooms.push({
      room_number: `2${i.toString().padStart(2, '0')}`,
      floor: 2,
      facilities: [
        'พัดลม',
        'ตู้เสื้อผ้า',
        'เตียง',
        'โต๊ะเครื่องแป้ง',
        'ตู้เย็น',
        ...commonBathroom
      ]
    });
  }
  // ชั้น 3
  for (let i = 1; i <= 10; i++) {
    rooms.push({
      room_number: `3${i.toString().padStart(2, '0')}`,
      floor: 3,
      facilities: [
        'แอร์',
        'ตู้เสื้อผ้า',
        'เตียง',
        'โต๊ะเครื่องแป้ง',
        'ตู้เย็น',
        ...commonBathroom
      ]
    });
  }
  await Room.insertMany(rooms);
  console.log('Seed rooms success!');
  mongoose.disconnect();
}

seedRooms();
