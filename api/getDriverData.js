// api/getDriverData.js
const SPREADSHEET_ID = '1H_vF3FzQh2e___uxjo-rv8gtnuua6PlbNvIoFhFBIa0';
const SHEET_NAME = 'Sheet1';

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

  const { user } = req.body;

  if (!user) {
    return res.status(400).json({ error: 'User data required' });
  }

  try {
    const sheetUrl = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&sheet=${SHEET_NAME}`;
    
    console.log('Fetching data from:', sheetUrl);
    
    const response = await fetch(sheetUrl);
    const csvText = await response.text();
    
    // Parse CSV
    const lines = csvText.split('\n').filter(line => line.trim());
    
    if (lines.length === 0) {
      return res.status(200).json({
        headers: [],
        rows: [],
        error: 'No data found'
      });
    }

    // Parse headers
    const headerLine = lines[0];
    const headers = headerLine.split(',').map(h => h.replace(/^"|"$/g, '').trim());
    
    console.log('Headers:', headers);
    
    // Parse data rows
    const allRows = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) continue;
      
      const row = [];
      let cell = '';
      let insideQuotes = false;
      
      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        
        if (char === '"') {
          insideQuotes = !insideQuotes;
        } else if (char === ',' && !insideQuotes) {
          row.push(cell.replace(/^"|"$/g, ''));
          cell = '';
        } else {
          cell += char;
        }
      }
      row.push(cell.replace(/^"|"$/g, ''));
      
      allRows.push(row);
    }
    
    console.log('Total rows:', allRows.length);
    
    // Filter rows based on user permissions
    let filteredRows = allRows;
    
    if (user.role !== 'admin' && !user.terminals.includes('ALL')) {
      filteredRows = allRows.filter(row => {
        // Location is in column B (index 1)
        const location = row[1] ? row[1].toString().trim() : '';
        return user.terminals.some(t => t === location);
      });
    }
    
    console.log('Filtered rows:', filteredRows.length);

    return res.status(200).json({
      headers: headers,
      rows: filteredRows,
      totalProcessed: filteredRows.length,
      totalAvailable: allRows.length
    });

  } catch (error) {
    console.error('Error fetching data:', error);
    return res.status(500).json({
      headers: [],
      rows: [],
      error: error.message
    });
  }
}
