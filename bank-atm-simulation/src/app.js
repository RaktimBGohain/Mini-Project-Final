const express = require("express");
const app = express();
const db = require("./db");
const PORT = process.env.PORT || 3000;

app.use(express.static("public"));
app.use(express.json());

// API endpoint to login and check balance
app.post("/api/login", (req, res) => {
    const { account_number, pin } = req.body;
    const query = "SELECT * FROM accounts WHERE account_number = ? AND pin = ?";
    db.query(query, [account_number, pin], (err, results) => {
        if (err) throw err;
        if (results.length > 0) {
            res.json({ success: true, balance: results[0].balance });
        } else {
            res.json({ success: false, message: "Invalid credentials" });
        }
    });
});

// API endpoint for deposit
app.post("/api/deposit", (req, res) => {
    const { account_number, amount } = req.body;

    // Check if amount is valid
    if (amount <= 0) {
        return res.json({ success: false, message: "Deposit amount must be greater than zero." });
    }

    const query = "UPDATE accounts SET balance = balance + ? WHERE account_number = ?";
    
    db.query(query, [amount, account_number], (err, results) => {
        if (err) {
            console.error("Database update error:", err);
            return res.status(500).json({ success: false, message: "Database error" });
        }

        // Check if any rows were affected
        if (results.affectedRows === 0) {
            return res.json({ success: false, message: "Account not found." });
        }

        // Retrieve the new balance
        const balanceQuery = "SELECT balance FROM accounts WHERE account_number = ?";
        db.query(balanceQuery, [account_number], (err, balanceResults) => {
            if (err) {
                console.error("Database query error:", err);
                return res.status(500).json({ success: false, message: "Database error" });
            }
            const newBalance = balanceResults[0].balance;
            res.json({ success: true, message: "Deposit successful", new_balance: newBalance });
        });
    });
});


// API endpoint for withdrawal
app.post("/api/withdraw", (req, res) => {
    const { account_number, amount } = req.body;
    const query = "SELECT balance FROM accounts WHERE account_number = ?";

    db.query(query, [account_number], (err, results) => {
        if (err) throw err;

        // Check if the account exists
        if (results.length === 0) {
            return res.json({ success: false, message: "Account not found" });
        }

        const balance = results[0].balance;

        if (balance >= amount) {
            const updateQuery = "UPDATE accounts SET balance = balance - ? WHERE account_number = ?";
            db.query(updateQuery, [amount, account_number], (err) => {
                if (err) throw err;
                res.json({ success: true, message: "Withdrawal successful", new_balance: balance - amount });
            });
        } else {
            res.json({ success: false, message: "Insufficient funds" });
        }
    });
});

// API endpoint for transferring funds
app.post("/api/transfer", (req, res) => {
    const { from_account, to_account, amount } = req.body;

    // Validate amount
    if (amount <= 0) {
        return res.json({ success: false, message: "Transfer amount must be greater than zero." });
    }

    // Query to check the balance of the sender's account
    const balanceQuery = "SELECT balance FROM accounts WHERE account_number = ?";
    db.query(balanceQuery, [from_account], (err, results) => {
        if (err) {
            console.error("Database query error:", err);
            return res.status(500).json({ success: false, message: "Database error" });
        }

        // Check if the sender's account exists
        if (results.length === 0) {
            return res.json({ success: false, message: "Sender account not found." });
        }

        const senderBalance = results[0].balance;

        // Check if sender has sufficient funds
        if (senderBalance < amount) {
            return res.json({ success: false, message: "Insufficient funds." });
        }

        // Query to check if the recipient's account exists
        const recipientQuery = "SELECT balance FROM accounts WHERE account_number = ?";
        db.query(recipientQuery, [to_account], (err, recipientResults) => {
            if (err) {
                console.error("Database query error:", err);
                return res.status(500).json({ success: false, message: "Database error" });
            }

            // Check if the recipient's account exists
            if (recipientResults.length === 0) {
                return res.json({ success: false, message: "Recipient account not found." });
            }

            // Perform the transfer
            const updateSenderQuery = "UPDATE accounts SET balance = balance - ? WHERE account_number = ?";
            const updateRecipientQuery = "UPDATE accounts SET balance = balance + ? WHERE account_number = ?";

            db.query(updateSenderQuery, [amount, from_account], (err) => {
                if (err) {
                    console.error("Database update error:", err);
                    return res.status(500).json({ success: false, message: "Database error" });
                }

                db.query(updateRecipientQuery, [amount, to_account], (err) => {
                    if (err) {
                        console.error("Database update error:", err);
                        return res.status(500).json({ success: false, message: "Database error" });
                    }

                    res.json({ success: true, message: "Transfer successful", new_sender_balance: senderBalance - amount });
                });
            });
        });
    });
});


app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
