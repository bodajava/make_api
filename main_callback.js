const mysql2 = require('mysql2')
const cors = require('cors')
const express = require('express')
const app = express()
const port = 3000

app.use(cors(), express.json())

const connection = mysql2.createConnection({
    host: 'localhost',
    port: '3307',
    database: 'real_first_task_SQL',
    user: 'root',
    password: '',
    multipleStatements: true 
})

connection.connect((err) => {
    if (err) return console.error('Error:', err.message);
    console.log('Database connected!');
})

app.post('/create-suppliers', (req, res) => {
    const query = `CREATE TABLE IF NOT EXISTS Suppliers (s_id INT AUTO_INCREMENT PRIMARY KEY, s_name VARCHAR(255), s_categories VARCHAR(15))`
    connection.query(query, (err) => {
        if (err) return res.status(500).json({ message: "Error", err })
        res.status(201).json({ message: "Suppliers table created" })
    })
})

app.post('/create-products', (req, res) => {
    const query = `CREATE TABLE IF NOT EXISTS product (p_id INT AUTO_INCREMENT PRIMARY KEY, p_name VARCHAR(255), p_price INT, p_stock INT, u_id INT)`
    connection.query(query, (err) => {
        if (err) return res.status(500).json({ message: "Error", err })
        res.status(201).json({ message: "Product table created" })
    })
})

app.post('/create-sales', (req, res) => {
    const query = `CREATE TABLE IF NOT EXISTS Sales (SaleID INT AUTO_INCREMENT PRIMARY KEY, ProductID INT, QuantitySold INT, SaleDate DATE)`
    connection.query(query, (err) => {
        if (err) return res.status(500).json({ message: "Error", err })
        res.status(201).json({ message: "Sales table created" })
    })
})

app.patch('/add-category', (req, res) => {
    const query = `ALTER TABLE product ADD COLUMN Category VARCHAR(50)`
    connection.query(query, (err) => {
        if (err) return res.status(500).json({ message: "Error", err })
        res.json({ message: "Column added" })
    })
})

app.patch('/drop-category', (req, res) => {
    const query = `ALTER TABLE product DROP COLUMN Category`
    connection.query(query, (err) => {
        if (err) return res.status(500).json({ message: "Error", err })
        res.json({ message: "Column dropped" })
    })
})

app.patch('/task4/modify-supplier-col', (req, res) => {
    const query = `ALTER TABLE Suppliers MODIFY s_categories VARCHAR(15)`
    connection.query(query, (err) => {
        if (err) return res.status(500).json({ message: "Error", err })
        res.json({ message: "Type modified" })
    })
})

app.patch('/set-not-null', (req, res) => {
    const query = `ALTER TABLE product MODIFY p_name VARCHAR(255) NOT NULL`
    connection.query(query, (err) => {
        if (err) return res.status(500).json({ message: "Error", err })
        res.json({ message: "Constraint updated" })
    })
})

app.post('/insert-supplier', (req, res) => {
    const { name, cat } = req.body
    connection.query(`INSERT INTO Suppliers (s_name, s_categories) VALUES (?, ?)`, [name, cat], (err) => {
        if (err) return res.status(500).json({ message: "Error", err })
        res.status(201).json({ message: "Supplier inserted" })
    })
})

app.post('/insert-product', (req, res) => {
    const { name, price, stock, userId } = req.body
    connection.query(`INSERT INTO product (p_name, p_price, p_stock, u_id) VALUES (?, ?, ?, ?)`, [name, price, stock, userId], (err) => {
        if (err) return res.status(500).json({ message: "Error", err })
        res.status(201).json({ message: "Product inserted" })
    })
})

app.post('/insert-sale', (req, res) => {
    const { p_id, qty, date } = req.body
    connection.query(`INSERT INTO Sales (ProductID, QuantitySold, SaleDate) VALUES (?, ?, ?)`, [p_id, qty, date], (err) => {
        if (err) return res.status(500).json({ message: "Error", err })
        res.status(201).json({ message: "Sale recorded" })
    })
})

app.put('/update-bread', (req, res) => {
    connection.query(`UPDATE product SET p_price = 25 WHERE p_name = 'Bread'`, (err) => {
        if (err) return res.status(500).json({ message: "Error", err })
        res.json({ message: "Bread price updated" })
    })
})

app.delete('/delete-eggs', (req, res) => {
    connection.query(`DELETE FROM product WHERE p_name = 'Eggs'`, (err) => {
        if (err) return res.status(500).json({ message: "Error", err })
        res.json({ message: "Eggs deleted" })
    })
})

app.get('/total-sold', (req, res) => {
    const sql = `SELECT p.p_name, SUM(s.QuantitySold) as Total FROM product p LEFT JOIN Sales s ON p.p_id = s.ProductID GROUP BY p.p_id`
    connection.query(sql, (err, data) => {
        if (err) return res.status(500).json({ message: "Error", err })
        res.json(data)
    })
})

app.get('/highest-stock', (req, res) => {
    connection.query(`SELECT * FROM product ORDER BY p_stock DESC LIMIT 1`, (err, data) => {
        if (err) return res.status(500).json({ message: "Error", err })
        res.json(data[0])
    })
})

app.get('/suppliers-f', (req, res) => {
    connection.query(`SELECT * FROM Suppliers WHERE s_name LIKE 'F%'`, (err, data) => {
        if (err) return res.status(500).json({ message: "Error", err })
        res.json(data)
    })
})

app.get('/never-sold', (req, res) => {
    connection.query(`SELECT * FROM product WHERE p_id NOT IN (SELECT ProductID FROM Sales)`, (err, data) => {
        if (err) return res.status(500).json({ message: "Error", err })
        res.json(data)
    })
})

app.get('/sales-report', (req, res) => {
    const sql = `SELECT s.SaleID, p.p_name, s.SaleDate FROM Sales s JOIN product p ON s.ProductID = p.p_id`
    connection.query(sql, (err, data) => {
        if (err) return res.status(500).json({ message: "Error", err })
        res.json(data)
    })
})

app.post('/create-user', (req, res) => {
    connection.query(`CREATE USER 'store_manager'@'localhost' IDENTIFIED BY 'pass123'`, (err) => {
        if (err) return res.status(500).json({ message: "Error", err })
        res.json({ message: "User created" })
    })
})

app.post('/permissions', (req, res) => {
    const sql = `GRANT SELECT, INSERT, UPDATE ON real_first_task_SQL.* TO 'store_manager'@'localhost';
                 REVOKE UPDATE ON real_first_task_SQL.* FROM 'store_manager'@'localhost';`
    connection.query(sql, (err) => {
        if (err) return res.status(500).json({ message: "Error", err })
        res.json({ message: "Permissions updated" })
    })
})

app.post('/grant-delete', (req, res) => {
    connection.query(`GRANT DELETE ON real_first_task_SQL.Sales TO 'store_manager'@'localhost'`, (err) => {
        if (err) return res.status(500).json({ message: "Error", err })
        res.json({ message: "Delete permission granted" })
    })
})

app.listen(port, () => console.log(`Server started on port ${port}`))