const http = require('http');
const { v4: uuidv4 } = require('uuid');

// Tạo thông tin tài khoản ngẫu nhiên
const testUser = {
  username: `testuser_${uuidv4().substring(0, 8)}`,
  email: `test_${uuidv4().substring(0, 8)}@example.com`,
  password: 'password123',
  name: 'Test User',
  phone: `1${Math.floor(3000000000 + Math.random() * 7000000000)}`
};

console.log('Tạo tài khoản test mới:');
console.log('- Email:', testUser.email);
console.log('- Mật khẩu:', testUser.password);
console.log('- Tên đăng nhập:', testUser.username);
console.log('- Số điện thoại:', testUser.phone);
console.log('\nĐang đăng ký tài khoản...');

// Hàm gửi request đăng ký
function registerUser(userData) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(userData);
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/register',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({ success: true, data: response });
          } else {
            resolve({ 
              success: false, 
              error: response.error || 'Unknown error',
              statusCode: res.statusCode
            });
          }
        } catch (e) {
          resolve({ success: false, error: 'Invalid JSON response', raw: data });
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    req.write(postData);
    req.end();
  });
}

// Hàm đăng nhập
function loginUser(email, password) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({ email, password });
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/callback/credentials',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = data ? JSON.parse(data) : {};
          if (res.statusCode === 200) {
            resolve({ success: true, data: response });
          } else {
            resolve({ 
              success: false, 
              error: response.error || 'Authentication failed',
              statusCode: res.statusCode
            });
          }
        } catch (e) {
          resolve({ success: false, error: 'Invalid JSON response', raw: data });
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    req.write(postData);
    req.end();
  });
}

// Chạy thử nghiệm
async function test() {
  try {
    // Bước 1: Đăng ký tài khoản mới
    console.log('\n=== ĐĂNG KÝ TÀI KHOẢN ===');
    const registerResult = await registerUser(testUser);
    
    if (!registerResult.success) {
      console.error('❌ Lỗi khi đăng ký:', registerResult.error);
      if (registerResult.raw) console.log('Phản hồi thô:', registerResult.raw);
      return;
    }
    
    console.log('✅ Đăng ký thành công!');
    
    // Bước 2: Đăng nhập bằng tài khoản vừa tạo
    console.log('\n=== ĐĂNG NHẬP ===');
    console.log('Đang đăng nhập với email:', testUser.email);
    
    const loginResult = await loginUser(testUser.email, testUser.password);
    
    if (loginResult.success) {
      console.log('✅ Đăng nhập thành công!');
      console.log('Thông tin người dùng:', JSON.stringify(loginResult.data, null, 2));
    } else {
      console.error('❌ Đăng nhập thất bại:', loginResult.error);
      console.log('Mã lỗi:', loginResult.statusCode);
      if (loginResult.raw) console.log('Phản hồi thô:', loginResult.raw);
      
      // Kiểm tra xem tài khoản có tồn tại không
      console.log('\nKiểm tra tài khoản trong database...');
      const users = require('./check-users');
      await users.checkUserByEmail(testUser.email);
    }
    
  } catch (error) {
    console.error('❌ Lỗi trong quá trình kiểm tra:', error);
  }
}

// Chạy thử nghiệm
test();
