import express from 'express';
import mysql from 'mysql';
import cors from 'cors';
// Create a MySQL connection
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root', 
  password: 'root', 
  database: 'example_db'
});

// Connect to MySQL
connection.connect(err => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL');
});

// Create Express app
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());
app.use(cors());
// Start the Express server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

// Define endpoint to fetch ticker data by ticker symbol
app.get('/api/ticker/:symbol', (req, res) => {
    const symbol = req.params.symbol;
    const query = `SELECT * FROM example_table WHERE ticker = ?`;
    
    connection.query(query, [symbol], (err, results) => {
      if (err) {
        console.error('Error querying MySQL: ' + err.stack);
        res.status(500).send('Internal Server Error');
        return;
      }
      res.json(results);
    });
  });

// Define endpoint to fetch ticker data by ticker symbol and specific columns
  app.get('/api/ticker/:symbol', (req, res) => {
    const symbol = req.params.symbol;
    let columns = req.query.columns.split(',');
    
    // Ensure ticker column is always included
    if (!columns.includes('ticker')) {
      columns.push('ticker');
    }
  
    // Remove any columns that don't exist in the table
    columns = columns.filter(column => ['ticker','newdate','revenue','gp','fcf','capex'].includes(column));
  
    const placeholders = columns.map(() => '?').join(',');
  
    const query = `SELECT ${columns.join(',')} FROM example_table WHERE ticker = ?`;
  
    connection.query(query, [symbol], (err, results) => {
      if (err) {
        console.error('Error querying MySQL: ' + err.stack);
        res.status(500).send('Internal Server Error');
        return;
      }
      res.json(results);
    });
  });


// Define endpoint to fetch ticker data by ticker symbol, specific columns, and period
app.get('/api/ticker/:symbol', (req, res) => {
    const symbol = req.params.symbol;
    const columns = req.query.column ? req.query.column.split(',') : [];
    const period = req.query.period;
  
   
    console.log('Columns:', columns);
  
    
    if (!period) {
      res.status(400).send('Missing period parameter');
      return;
    }
  
    if (columns.length === 0) {
      res.status(400).send('Missing column parameter');
      return;
    }
  
    const query = `
    SELECT ${columns.join(',')} 
    FROM example_table
    WHERE ticker = ? 
    AND STR_TO_DATE(newdate, '%m/%d/%Y') >= DATE_SUB(NOW(), INTERVAL ${parseInt(period)} YEAR)
  `;
 console.log('Generated Query:', query); 

connection.query(query, [symbol], (err, results) => {
    if (err) {
      console.error('Error querying MySQL:', err.message);
      console.error('Query:', query);
      res.status(500).send('Internal Server Error: ' + err.message);
      return;
    }
    res.json(results);
});
})

app.post('/create', (req, res) => {

    connection.query(`CREATE TABLE example_table(
        ticker VARCHAR(255),
        date DATE,
        revenue DECIMAL(18,2),
        gp DECIMAL(18,2),
        fcf DECIMAL(18,2),
        capex DECIMAL(18,2))`, (err, result) => {
      if (err) {
        console.error('Error creating table:', err);
        res.status(500);
        res.send('Error creating table');
        return;
      }
      res.status(201);
      res.send('Table created successfully');
    });
  });
  

app.post('/example', (req, res) => {
    const { ticker,date,revenue,gp,fcf,capex} = req.body;
    connection.query(`INSERT INTO example_table (ticker,date,revenue,gp,fcf,capex) VALUES ('${ticker}','${date}' ,'${revenue}', '${gp}','${fcf}','${capex}') , `, (err, result) => {
      if (err) {
        console.error('Error sending data:', err);
        res.status(500);
        res.send('Error sending data');
        return;
      }
      res.status(201);
      res.send('Data sent successfully');
    });
  });
  