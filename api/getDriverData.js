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

    // --- START OF FIX ---

    // 1. Check if the environment variable is set at all
    if (!API_KEY) {
      console.error('Error: GOOGLE_SHEETS_API_KEY environment variable is not set.');
      return res.status(500).json({
        error: 'Server configuration error',
        details: 'Google Sheets API key is not configured.'
      });
    }

    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE}?key=${API_KEY}`;
    
    const response = await fetch(url);

    // 2. Check if the response from Google Sheets API is successful
    if (!response.ok) {
      const errorDetails = await response.json();
      console.error('Google Sheets API Error:', errorDetails);
      throw new Error(`Google Sheets API failed with status ${response.status}. Message: ${errorDetails.error?.message || 'Unknown Sheets error'}`);
    }

    const data = await response.json();

    // 3. Check if 'values' exists AND is not empty
    if (!data.values || data.values.length === 0) {
      console.log('Successfully fetched from Google Sheets, but no data was found in the specified range.');
      return res.status(200).json({ rows: [] });
    }

    // --- END OF FIX ---

    return res.status(200).json({
      rows: data.values
    });

  } catch (error) {
    // This will now catch the Google Sheets API errors from the new check
    console.error('Error in getDriverData handler:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch data',
      details: error.message 
    });
  }
}
