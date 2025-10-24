export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username, password } = req.body;

  const users = {
    'admin': { password: 'toulin123@', role: 'admin' },
    'manager': { password: 'manager123', role: 'manager' },
    'viewer': { password: 'viewer123', role: 'viewer' }
  };

  if (users[username] && users[username].password === password) {
    return res.status(200).json({
      success: true,
      user: {
        username: username,
        role: users[username].role
      }
    });
  }

  return res.status(401).json({
    success: false,
    message: 'Invalid username or password'
  });
}
