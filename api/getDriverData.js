const { google } = require('googleapis');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { user } = req.body;

  if (!user) {
    return res.status(400).json({ error: 'User data required' });
  }

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS),
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.SPREADSHEET_ID;

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Driver Data!A2:O',
    });

    let rows = response.data.values || [];

    // If user has a location, filter by location (column B, index 1)
    if (user.location) {
      rows = rows.filter(row => row[1] === user.location);
    }

    return res.json({ rows });
  } catch (error) {
    console.error('Data fetch error:', error);
    return res.status(500).json({ error: 'Failed to fetch data' });
  }
};
