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
let currentWinnings = 0;

// ⚡ 0.01s Instant Cache Load
(function fastLoad() {
    const cachedWallet = localStorage.getItem('wallet_cache');
    if(cachedWallet) {
        const data = JSON.parse(cachedWallet);
        currentWinnings = data.win;
        document.getElementById("walletBal").innerText = "₹" + currentWinnings;
    }
})();

auth.onAuthStateChanged(user => {
    if(user) {
        db.ref("users/" + user.uid + "/wallet").on('value', snapshot => {
            const data = snapshot.val();
            let dep = 0, win = 0;
            if(data && typeof data === 'object') {
                dep = Number(data.deposit || 0);
                win = Number(data.winnings || 0);
            } else {
                win = Number(data || 0);
            }
            currentWinnings = win;
            document.getElementById("walletBal").innerText = "₹" + currentWinnings;
            // Update cache
            localStorage.setItem('wallet_cache', JSON.stringify({ dep, win }));
        });
    } else { window.location.href = "index.html"; }
});

async function requestWithdraw() {
    const amt = parseInt(document.getElementById("withdrawAmt").value);
    const upi = document.getElementById("upiId").value.trim();
    const btn = document.getElementById("subBtn");
    const loader = document.getElementById("loader");

    if(!amt || amt < 3) return alert("Minimum withdrawal is ₹3");
    if(amt > currentWinnings) return alert("Insufficient Winnings!");
    if(!upi.includes("@")) return alert("Please enter a valid UPI ID");

    if(!confirm(`Withdraw ₹${amt} to ${upi}?`)) return;

    btn.style.display = "none";
    loader.style.display = "block";

    const user = auth.currentUser;
    const key = db.ref().child('transactions').push().key;

    const historyData = {
        uid: user.uid,
        amount: amt,
        type: "withdrawal",
        status: "PENDING",
        upiId: upi,
        timestamp: firebase.database.ServerValue.TIMESTAMP
    };

    try {
        // Balance update & Request creation
        await db.ref("users/" + user.uid + "/wallet/winnings").set(currentWinnings - amt);
        await db.ref("transactions/" + key).set(historyData);
        await db.ref("withdrawRequests/" + key).set({ ...historyData, email: user.email });

        alert("Request Sent! Wallet updated.");
        window.location.href = "wallet.html";
    } catch (e) {
        alert("Error: " + e.message);
        btn.style.display = "block";
        loader.style.display = "none";
    }
}
