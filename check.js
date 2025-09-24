const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
app.use(express.json());

const dataFile = path.join(__dirname, 'data!@#$%^&*()!@#$%^&*(@#$%^&*(@#$%^&*$R%^&%^&*%^&*%^&^&*.json');

app.post('/check', (req, res) => {
    const { action, code, answer } = req.body;
    if (!fs.existsSync(dataFile)) {
        return res.json({ success: false, message: "ไม่พบไฟล์ข้อมูล" });
    }
    const data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
    if (action === 'getHints') {
        if (data[code]) {
            const now = new Date();
            const hints = [];
            for (const hintObj of data[code].hints) {
                const hintDate = new Date(hintObj.openDate);
                if (now >= hintDate) {
                    hints.push({
                        hint: hintObj.hint,
                        status: "open",
                        daysLeft: 0
                    });
                } else {
                    const daysLeft = Math.ceil((hintDate - now) / (1000 * 60 * 60 * 24));
                    hints.push({
                        hint: "(ยังไม่ถึงเวลาคำใบ้)",
                        status: "locked",
                        daysLeft
                    });
                }
            }
            let ig = null;
            let igDaysLeft = null;
            if (data[code].ig && data[code].ig.openDate && data[code].ig.value) {
                const igDate = new Date(data[code].ig.openDate);
                if (now >= igDate) {
                    ig = data[code].ig.value;
                    igDaysLeft = 0;
                } else {
                    ig = null;
                    igDaysLeft = Math.ceil((igDate - now) / (1000 * 60 * 60 * 24));
                }
            }
            return res.json({
                success: true,
                hints,
                ig,
                igDaysLeft,
                studentId: data[code].studentId || '',
                nickname: data[code].nickname || ''
            });
        } else {
            return res.json({ success: false, message: "รหัสไม่ถูกต้อง" });
        }
    }
    if (action === 'checkIG') {
        if (data[code] && data[code].ig && data[code].ig.value) {
            if (answer === data[code].ig.value) {
                return res.json({ message: "ถูกต้อง!" });
            } else {
                return res.json({ message: "ไม่ถูกต้อง" });
            }
        } else {
            return res.json({ message: "ไม่มีข้อมูล IG" });
        }
    }
    res.json({ success: false, message: "action ไม่ถูกต้อง" });
});

app.listen(3000, () => console.log('Server running on port 3000'));
