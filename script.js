
window.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('matrixCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789กขคงจฉชซฌญฎฏฐฑฒณดตถทธนบปผฝพฟภมยรฤลวศษสหฬอฮ'.split('');
    const fontSize = 18;
    const columns = Math.floor(canvas.width / fontSize);
    const drops = Array(columns).fill(1);
    function drawMatrix() {
        ctx.fillStyle = 'rgba(15, 15, 15, 0.15)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.font = fontSize + 'px Courier New';
        ctx.fillStyle = '#00ff00';
        for (let i = 0; i < drops.length; i++) {
            const text = letters[Math.floor(Math.random() * letters.length)];
            ctx.fillText(text, i * fontSize, drops[i] * fontSize);
            if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i]++;
        }
    }
    setInterval(drawMatrix, 50);
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });

    const inputs = document.querySelectorAll('.code-input');
    inputs.forEach((input, idx) => {
        input.addEventListener('input', function(e) {
            let val = input.value;
            if (!/^[A-Za-z0-9]$/.test(val)) {
                input.value = '';
                return;
            }
            if (input.value.length === 1 && idx < inputs.length - 1) {
                inputs[idx + 1].focus();
            }
        });
        input.addEventListener('keydown', function(e) {
            if (e.key === 'Backspace' && input.value === '' && idx > 0) {
                inputs[idx - 1].focus();
            }
        });
    });
});
let hints = [];
let correctIG = "";
let currentCode = "";

document.getElementById('codeForm').addEventListener('submit', function(e) {
    e.preventDefault();
    let code = '';
    for (let i = 1; i <= 5; i++) {
        code += (document.getElementById('code' + i).value || '').trim();
    }
    if (code.length !== 5) {
        showTypewriter('กรุณากรอกรหัสน้องให้ครบ 5 ตัว');
        return;
    }
    fetch('check.php', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ action: 'getHints', code })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            hints = data.hints;
            correctIG = data.ig;
            currentCode = code;
            document.getElementById('page-code').style.display = 'none';
            document.getElementById('page-hint').style.display = 'block';
            let detailDiv = document.getElementById('student-detail');
            if (!detailDiv) {
                detailDiv = document.createElement('div');
                detailDiv.id = 'student-detail';
                detailDiv.style.marginBottom = '15px';
                detailDiv.style.fontSize = '1.1em';
                const hintList = document.getElementById('hintList');
                document.getElementById('page-hint').insertBefore(detailDiv, hintList);
            }
            detailDiv.innerHTML = `<b>เลขนักศึกษา:</b> ${data.studentId || '-'}<br><b>ชื่อเล่น:</b> ${data.nickname || '-'}`;

            const hintList = document.getElementById('hintList');
            hintList.innerHTML = '';
            hints.forEach((hintObj, idx) => {
                const li = document.createElement('li');
                if (hintObj.status === "open") {
                    li.textContent = hintObj.hint;
                } else {
                    li.textContent = `${hintObj.hint} (จะเปิดในอีก ${hintObj.daysLeft} วัน)`;
                }
                hintList.appendChild(li);
            });
            if (!correctIG && typeof data.igDaysLeft === 'number' && data.igDaysLeft > 0) {
                showTypewriterHint(`เฉลย IG จะเปิดในอีก ${data.igDaysLeft} วัน`);
            } else {
                showTypewriterHint('');
            }
        } else {
            showTypewriter(data.message);
            document.getElementById('result').textContent = '';
        }
    });

function showTypewriter(text) {
    const el = document.getElementById('typewriter');
    el.textContent = '';
    let i = 0;
    function type() {
        if (i < text.length) {
            el.textContent += text.charAt(i);
            i++;
            setTimeout(type, 30);
        }
    }
    type();
}
function showTypewriterHint(text) {
    const el = document.getElementById('typewriter-hint');
    el.textContent = '';
    let i = 0;
    function type() {
        if (i < text.length) {
            el.textContent += text.charAt(i);
            i++;
            setTimeout(type, 30);
        }
    }
    type();
}
});

document.getElementById('answerForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const answer = document.getElementById('answer').value.trim();
    fetch('check.php', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ action: 'checkIG', code: currentCode, answer })
    })
    .then(res => res.json())
    .then(data => {
        document.getElementById('result').textContent = data.message;
    });
});
