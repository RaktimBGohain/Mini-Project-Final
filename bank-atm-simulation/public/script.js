document.getElementById("login-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const accountNumber = document.getElementById("account-number").value;
    const pin = document.getElementById("pin").value;

    const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ account_number: accountNumber, pin: pin }),
    });

    const data = await response.json();
    if (data.success) {
        document.getElementById("balance").innerText = `Balance: $${data.balance}`;
        document.getElementById("login-form").style.display = "none";
        document.getElementById("balance-section").style.display = "block";
    } else {
        alert(data.message);
    }
});

document.getElementById("deposit-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const amount = document.getElementById("deposit-amount").value;
    const response = await fetch("/api/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ account_number: document.getElementById("account-number").value, amount: parseFloat(amount) }),
    });

    const data = await response.json();
    alert(data.message);
    if (data.success) {
        document.getElementById("balance").innerText = `Balance: $${data.new_balance}`;
    }
});

document.getElementById("withdrawal-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const amount = document.getElementById("withdrawal-amount").value;
    const response = await fetch("/api/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ account_number: document.getElementById("account-number").value, amount: parseFloat(amount) }),
    });

    const data = await response.json();
    alert(data.message);
    if (data.success) {
        document.getElementById("balance").innerText = `Balance: $${data.new_balance}`;
    }
});

document.getElementById("transfer-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const toAccount = document.getElementById("to-account").value;
    const amount = document.getElementById("transfer-amount").value;

    const response = await fetch("/api/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            from_account: document.getElementById("account-number").value,
            to_account: toAccount,
            amount: parseFloat(amount)
        }),
    });

    const data = await response.json();
    alert(data.message);
    if (data.success) {
        document.getElementById("balance").innerText = `Balance: $${data.new_sender_balance}`;
    }
});


function logout() {
    document.getElementById("login-form").style.display = "block";
    document.getElementById("balance-section").style.display = "none";
}
