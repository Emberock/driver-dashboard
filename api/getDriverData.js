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
    const { user } = req.body;

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const SHEET_ID = '1v4oh56ih0vQDxOECkzfJzPTux5fTOXZMd5o_PcbXXiY';
    const RANGE = 'Calculated risk score!A2:O';
    const API_KEY = process.env.GOOGLE_SHEETS_API_KEY;

    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE}?key=${API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (!data.values) {
      return res.status(200).json({ rows: [] });
    }

    return res.status(200).json({
      rows: data.values
    });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch data',
      details: error.message 
    });
  }
}
