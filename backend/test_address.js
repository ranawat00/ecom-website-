const jwt = require('jsonwebtoken');
const token = jwt.sign({ id: 1 }, 'jaggry_super_secret_key_123');

console.log("Token:", token);

fetch('http://localhost:5000/api/auth/signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: "test", 
    mobileNo: "123", 
    email: "test@t.com", 
    password: "123", 
    address: "test"
  })
}).then(r => r.json()).then(async data => {
  console.log("Signup:", data);
  if (data.success && data.data && data.data.id) {
    const freshToken = jwt.sign({ id: data.data.id }, 'jaggry_super_secret_key_123');
    const res = await fetch('http://localhost:5000/api/auth/address', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + freshToken },
      body: JSON.stringify({ action: 'add', addressData: { street: 'Main' } })
    });
    console.log("Address Add:", await res.json());
  } else if (!data.success && data.message.includes('exists')) {
     const freshToken = jwt.sign({ id: 1 }, 'jaggry_super_secret_key_123'); // Hack for testing
     const res = await fetch('http://localhost:5000/api/auth/address', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + freshToken },
      body: JSON.stringify({ action: 'add', addressData: { street: 'Main' } })
    });
    console.log("Address Add (existing):", await res.json());
  }
});
