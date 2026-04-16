// REAL Firebase Config (Studio-4988...)
const firebaseConfig = {
    apiKey: "AIzaSyAo9KNsWnq2AgoCGzPuCsg7YCbuw8-Apuo",
    authDomain: "studio-4988500581-b9772.firebaseapp.com",
    databaseURL: "https://studio-4988500581-b9772-default-rtdb.firebaseio.com",
    projectId: "studio-4988500581-b9772",
    storageBucket: "studio-4988500581-b9772.firebasestorage.app",
    messagingSenderId: "773461302160",
    appId: "1:773461302160:web:13deb67b24b267ac0b7115"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();

// Quick Loader Hide
window.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => { document.getElementById("loader").style.display = "none"; }, 400);
});

function showQR() {
    const amt = document.getElementById('amtInput').value;
    if(amt < 10 || amt === "") return alert("Minimum amount is ₹10");

    document.getElementById('amountSection').style.display = 'none';
    document.getElementById('qrDisplay').style.display = 'block';
    document.getElementById('utrSection').style.display = 'block';
    
    const btn = document.getElementById('mainBtn');
    btn.innerText = "VERIFY & ADD CASH";
    btn.onclick = submitUTR;
}

function submitUTR() {
    const utr = document.getElementById('utrInput').value.trim();
    const amt = parseInt(document.getElementById('amtInput').value);
    const user = auth.currentUser;

    if(!user) return alert("Login session expired!");
    if(utr.length < 12) return alert("Enter valid 12-digit UTR!");

    const btn = document.getElementById('mainBtn');
    btn.innerText = "Processing...";
    btn.disabled = true;

    // Transaction Data
    const txData = {
        uid: user.uid,
        email: user.email,
        amount: Number(amt),
        utr: utr,
        type: "deposit",
        status: "PENDING",
        timestamp: firebase.database.ServerValue.TIMESTAMP
    };

    // Save to database
    db.ref("transactions").push(txData).then(() => {
        // Instant success alert
        alert("Payment submitted! It will be verified soon.");
        window.location.href = "wallet.html";
    }).catch(err => {
        alert("Error: " + err.message);
        btn.disabled = false;
        btn.innerText = "VERIFY & ADD CASH";
    });
}
