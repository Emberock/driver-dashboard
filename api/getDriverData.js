export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const SHEET_ID = '1v4oh56ih0vQDxOECkzfJzPTux5fTOXZMd5o_PcbXXiY';
    const RANGE = 'Calculated risk score!A2:O';
    const API_KEY = process.env.GOOGLE_SHEETS_API_KEY;

    if (!API_KEY) {
      console.error('GOOGLE_SHEETS_API_KEY not configured');
      return res.status(500).json({ 
        error: 'Configuration error',
        message: 'Google Sheets API key not found. Please add GOOGLE_SHEETS_API_KEY to environment variables in Vercel.'
      });
    }

    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE}?key=${API_KEY}`;
    
    console.log('Fetching from Google Sheets API...');
    
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Sheets API error:', response.status, errorText);
      return res.status(500).json({ 
        error: 'Sheets API error',
        message: `Status ${response.status}: ${errorText}`
      });
    }
    
    const data = await response.json();
    
    console.log('Data received:', data.values ? data.values.length : 0, 'rows');

    if (!data.values || data.values.length === 0) {
      return res.status(200).json({ 
        rows: [],
        message: 'No data in sheet'
      });
    }

    return res.status(200).json({
      rows: data.values
    });

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ 
      error: 'Server error',
      message: error.message
    });
  }
}
