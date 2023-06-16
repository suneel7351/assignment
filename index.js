const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
require('dotenv').config({ path: "./.env" })
const app = express();
const port = process.env.PORT || 5000;

// Create MySQL connection
const connection = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
});

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL database:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

// Middleware
app.use(bodyParser.json());

// Get all todo
app.get('/todo', async (req, res) => {
    try {
        const query = 'SELECT * FROM todo';
        const results = await executeQuery(query);
        res.json(results);
    } catch (err) {
        console.error('Error fetching todos:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Add a new todo
app.post('/todo', async (req, res) => {
    const { task } = req.body;
    try {
        if (!task) return;
        const query = 'INSERT INTO todo (task) VALUES (?)';
        const result = await executeQuery(query, [task]);
        res.json({ id: result.insertId, task });
    } catch (err) {
        console.error('Error adding new todo:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Update a todo
app.put('/todo/:id', async (req, res) => {
    const { id } = req.params;
    const { task } = req.body;
    if (!id || !task) return res.json({ message: "Id and task required." });
    try {
        const query = 'UPDATE todo SET task = ? WHERE id = ?';
        const result = await executeQuery(query, [task, id]);

        res.status(200).json({ result });
    } catch (err) {
        console.error('Error updating todo:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Delete a todo
app.delete('/todo/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const query = 'DELETE FROM todo WHERE id = ?';
        await executeQuery(query, [id]);
        res.sendStatus(200);
    } catch (err) {
        console.error('Error deleting todo:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Function to execute a MySQL query
function executeQuery(query, params) {
    return new Promise((resolve, reject) => {
        connection.query(query, params, (err, result) => {
            if (err) reject(err);
            resolve(result);
        });
    });
}



app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});


