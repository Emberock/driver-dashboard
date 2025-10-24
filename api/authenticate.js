// api/authenticate.js
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'toulin123@';
const SPREADSHEET_ID = '1H_vF3FzQh2e___uxjo-rv8gtnuua6PlbNvIoFhFBIa0';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username, password } = req.body;

  console.log('Auth attempt:', username);

  // Admin authentication
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    return res.status(200).json({
      success: true,
      user: {
        username: username,
        role: 'admin',
        terminals: ['ALL']
      }
    });
  }

  // For other users, check credentials sheet
  try {
    const credentialsUrl = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&sheet=Credentials`;
    
    const response = await fetch(credentialsUrl);
    const csvText = await response.text();
    
    // Parse CSV
    const lines = csvText.split('\n');
    const rows = lines.slice(1); // Skip header
    
    for (const row of rows) {
      const cols = row.split(',').map(col => col.replace(/^"|"$/g, '').trim());
      
      if (cols[0] === username && cols[1] === password) {
        return res.status(200).json({
          success: true,
          user: {
            username: username,
            role: 'user',
            terminals: cols[2] ? cols[2].split(';').map(t => t.trim()) : []
          }
        });
      }
    }
  } catch (error) {
    console.error('Credentials check error:', error);
  }

  return res.status(401).json({ 
    success: false, 
    message: 'Invalid credentials' 
  });
}
