// ============================================
// GStream - MAIN JAVASCRIPT (No Server Mode)
// ============================================

// ===== CONFIG =====
const USE_LOCAL_STORAGE = true; // No server needed!

// ===== LOCAL STORAGE DB =====
function getLocalDB() {
    const db = localStorage.getItem('gstream_db');
    if (db) return JSON.parse(db);

    // Default data
    const defaultDB = {
        users: [
            {
                id: 'user_001',
                name: 'مدیر سایت',
                email: 'admin@gstream.com',
                password: 'admin123',
                created_at: '2026-01-01 00:00:00'
            }
        ],
        videos: [
            {
                id: 'demo_001',
                title: 'ویدیو نمونه GStream',
                description: 'این ویدیو نمونه برای نمایش قابلیت‌های پلتفرم GStream است. برای استفاده واقعی، فایل sample.mp4 را در پوشه videos قرار دهید.',
                filename: 'sample.mp4',
                thumbnail: '',
                views: 0,
                date: '2026-01-01 00:00:00',
                user_id: 'user_001'
            }
        ]
    };
    saveLocalDB(defaultDB);
    return defaultDB;
}

function saveLocalDB(data) {
    localStorage.setItem('gstream_db', JSON.stringify(data));
}

function generateId() {
    return 'vid_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// ===== LOAD VIDEOS =====
function loadVideos() {
    const grid = document.getElementById('videoGrid');
    if (!grid) return;

    const db = getLocalDB();
    renderVideos(db.videos);
}

// ===== RENDER VIDEOS =====
function renderVideos(videos) {
    const grid = document.getElementById('videoGrid');
    if (!videos || videos.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">
                <div style="font-size: 64px; margin-bottom: 20px;">📁</div>
                <h2 style="color: #e94560; margin-bottom: 10px;">هیچ ویدیویی یافت نشد</h2>
                <p style="color: #888;">اولین ویدیو را آپلود کنید یا فایل sample.mp4 را در پوشه videos قرار دهید</p>
                <a href="upload.html" class="btn btn-primary" style="margin-top: 20px;">آپلود ویدیو</a>
            </div>
        `;
        return;
    }

    grid.innerHTML = videos.map(video => `
        <div class="video-card" onclick="window.location.href='watch.html?id=${video.id}'">
            <div style="width:100%; height:180px; background: linear-gradient(135deg, #1a1a2e, #2a2a4e); display:flex; align-items:center; justify-content:center; font-size:48px;">
                🎬
            </div>
            <div class="card-body">
                <h3>${escapeHtml(video.title)}</h3>
                <p>${escapeHtml(video.description || '')}</p>
                <small>👁️ ${video.views || 0} بازدید • ${video.date ? video.date.split(' ')[0] : ''}</small>
            </div>
        </div>
    `).join('');
}

// ===== LOAD SINGLE VIDEO =====
function loadVideo(id) {
    const db = getLocalDB();
    const video = db.videos.find(v => v.id === id);

    if (video) {
        // Increase views
        video.views = (video.views || 0) + 1;
        saveLocalDB(db);

        document.getElementById('videoTitle').textContent = video.title;
        document.getElementById('videoDescription').textContent = video.description || 'بدون توضیحات';
        document.getElementById('videoDate').textContent = `📅 ${video.date || 'تاریخ نامشخص'}`;
        document.getElementById('videoViews').textContent = `👁️ ${video.views || 0} بازدید`;

        const source = document.getElementById('videoSource');
        source.src = `videos/${video.filename}`;
        document.getElementById('videoPlayer').load();
    } else {
        document.querySelector('.watch-container').innerHTML = `
            <div style="text-align: center; padding: 60px 20px;">
                <div style="font-size: 64px; margin-bottom: 20px;">😕</div>
                <h2 style="color: #e94560;">ویدیو یافت نشد</h2>
                <p style="color: #888; margin-top: 10px;">شناسه ویدیو: ${escapeHtml(id)}</p>
                <a href="index.html" class="btn btn-primary" style="margin-top: 20px;">بازگشت به خانه</a>
            </div>
        `;
    }
}

// ===== UPLOAD FORM HANDLER =====
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('uploadForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();

            const progressDiv = document.getElementById('uploadProgress');
            const progressBar = document.getElementById('progressBar');
            const progressText = document.getElementById('progressText');

            progressDiv.style.display = 'block';

            const title = document.getElementById('title').value;
            const description = document.getElementById('description').value;
            const fileInput = document.getElementById('videoFile');
            const file = fileInput.files[0];

            if (!file) {
                alert('❌ لطفاً یک فایل ویدیو انتخاب کنید');
                progressDiv.style.display = 'none';
                return;
            }

            // Simulate progress
            let progress = 0;
            const interval = setInterval(() => {
                progress += Math.random() * 15;
                if (progress > 90) progress = 90;
                progressBar.style.width = progress + '%';
                progressText.textContent = Math.round(progress) + '%';
            }, 200);

            // Read file as base64 for local storage
            const reader = new FileReader();
            reader.onload = function(e) {
                clearInterval(interval);
                progressBar.style.width = '100%';
                progressText.textContent = '100%';

                const db = getLocalDB();
                const video = {
                    id: generateId(),
                    title: title,
                    description: description,
                    filename: file.name,
                    fileData: e.target.result, // base64 data
                    thumbnail: '',
                    views: 0,
                    date: new Date().toISOString().replace('T', ' ').split('.')[0],
                    user_id: '1'
                };

                db.videos.push(video);
                saveLocalDB(db);

                setTimeout(() => {
                    alert('✅ ویدیو با موفقیت آپلود شد!\n\nنکته: ویدیو در حافظه مرورگر (LocalStorage) ذخیره شد. برای ذخیره دائمی، نیاز به سرور PHP دارید.');
                    window.location.href = 'index.html';
                }, 500);
            };

            reader.onerror = function() {
                clearInterval(interval);
                progressDiv.style.display = 'none';
                alert('❌ خطا در خواندن فایل');
            };

            reader.readAsDataURL(file);
        });
    }
});

// ===== AUTH FUNCTIONS =====
function showRegister() {
    document.querySelector('.auth-box:first-child').style.display = 'none';
    document.getElementById('registerBox').style.display = 'block';
}

function showLogin() {
    document.querySelector('.auth-box:first-child').style.display = 'block';
    document.getElementById('registerBox').style.display = 'none';
}

function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    const db = getLocalDB();
    const user = db.users.find(u => u.email === email && u.password === password);

    if (user) {
        localStorage.setItem('gstream_user', JSON.stringify({
            id: user.id,
            name: user.name,
            email: user.email
        }));
        alert('✅ ورود موفق!');
        window.location.href = 'index.html';
    } else {
        alert('❌ ایمیل یا رمز عبور اشتباه است');
    }
}

function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;

    if (password.length < 6) {
        alert('رمز عبور باید حداقل ۶ کاراکتر باشد');
        return;
    }

    const db = getLocalDB();

    if (db.users.find(u => u.email === email)) {
        alert('❌ این ایمیل قبلاً ثبت شده است');
        return;
    }

    const newUser = {
        id: 'user_' + Date.now(),
        name: name,
        email: email,
        password: password,
        created_at: new Date().toISOString().replace('T', ' ').split('.')[0]
    };

    db.users.push(newUser);
    saveLocalDB(db);

    alert('✅ ثبت‌نام موفق! حالا وارد شوید.');
    showLogin();
    document.getElementById('loginEmail').value = email;
}

// ===== CHECK LOGIN STATUS =====
function checkAuth() {
    const user = JSON.parse(localStorage.getItem('gstream_user') || 'null');
    const authLink = document.getElementById('authLink');
    if (authLink) {
        if (user) {
            authLink.textContent = `👤 ${user.name || 'کاربر'}`;
            authLink.href = '#';
            authLink.onclick = function(e) {
                e.preventDefault();
                if (confirm('خروج از حساب کاربری؟')) {
                    localStorage.removeItem('gstream_user');
                    window.location.reload();
                }
            };
        } else {
            authLink.textContent = 'ورود';
            authLink.href = 'login.html';
        }
    }
}

// ===== UTILITY FUNCTIONS =====
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ===== RUN ON PAGE LOAD =====
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
});
