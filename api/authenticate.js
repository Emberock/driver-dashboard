const { google } = require('googleapis');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username, password } = req.body;

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS),
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.SPREADSHEET_ID;

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Users!A2:D',
    });

    const users = response.data.values || [];

    const user = users.find(row => row[0] === username && row[1] === password);

    if (user) {
      return res.json({
        success: true,
        user: {
          username: user[0],
          role: user[2],
          location: user[3] || null
        }
      });
    } else {
      return res.json({
        success: false,
        message: 'Invalid credentials'
      });
    }
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
