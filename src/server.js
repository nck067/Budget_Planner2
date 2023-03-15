const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const sqlite3 = require('sqlite3').verbose();

// pieslēdzamies mūsu DB
const database = new sqlite3.Database("./src/db/database.db");

// inicializējam express appu
const app = express()

// ļaujam piekļūt serverim no citiem domēniem
app.use(cors({
  origin: '*'
}))

// ļaujam no FE sūtīt jsonu
app.use(bodyParser.json());

// uz servera palaišanu
database.serialize(() => {
  // create the projects table if it doesn't exist

  database.run(`
    CREATE TABLE IF NOT EXISTS finances (
      id INTEGER PRIMARY KEY,
      income INT NOT NULL,
      expenses INT NOT NULL, 
      savings INT NOT NULL
    );
  `)


  database.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY,
      username VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL
    );
  `);


  // if there are no projects in the database yet, add the first one
  database.get('SELECT * FROM users', (err, user) => {
    if (!user) {
      database.run(`
        INSERT INTO users (username, password)
        VALUES('dzeks123', 'kakina8363');
      `);
    }
  });
});


// Atgriež visus projektus no DB
app.get('/finances', (req, res) => {
    // database.get atgriež tikai vienu pirmo atrasto rezutlātu
      // database.all atgriež visus atrastos rezultātus
  database.all('SELECT * FROM finances', (error, finance) => {
    res.json(finance)
  })
})


// POST http://localhost:3000/finances
// pievieno jaunu finance 
app.post('/finances', (req, res) => {
  database.run(`
    INSERT INTO finances (income, expenses, savings)
    VALUES("${req.body.income}", "${req.body.expenses}", "${req.body.savings}");
  `, () => {
    res.json('Jauns ieraksts pievienots veiksmīgi')
  })
})

// users
app.get('/users', (req, res) => {
  // database.get atgriež tikai vienu pirmo atrasto rezutlātu
    // database.all atgriež visus atrastos rezultātus
database.all('SELECT * FROM users', (error, user) => {
  res.json(user)
})
})

app.post('/users', (req, res) => {
  database.run(`
    INSERT INTO users (username, password)
    VALUES("${req.body.username}", "${req.body.password}");
  `, () => {
    res.json('Jauns lietotājs pievienots veiksmīgi')
  })
})

// palaižam serveri ar 3004 portu
app.listen(3004, () => {
  console.log(`Example app listening on port 3004`)
})


