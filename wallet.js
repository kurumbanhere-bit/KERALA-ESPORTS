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
const db = firebase.database();
let currentWinnings = 0; // Global variable to store winnings amount

// ⚡ Instant UI Load
(function instantLoad() {
    const cachedWallet = localStorage.getItem('wallet_cache');
    const cachedTx = localStorage.getItem('tx_cache');

    if (cachedWallet) {
        const w = JSON.parse(cachedWallet);
        document.getElementById("depDisplay").innerText = "₹" + w.dep;
        document.getElementById("winDisplay").innerText = "₹" + w.win;
        document.getElementById("totalDisplay").innerText = "₹" + (w.dep + w.win);
        currentWinnings = w.win; // Set from cache initially
    }
    if (cachedTx) {
        document.getElementById("txList").innerHTML = cachedTx;
    }
})();

firebase.auth().onAuthStateChanged(user => {
    if (user) {
        // Real-time Wallet Fetch
        db.ref("users/" + user.uid + "/wallet").on('value', snapshot => {
            const data = snapshot.val();
            let dep = (data && data.deposit) ? Number(data.deposit) : (Number(data) || 0);
            let win = (data && data.winnings) ? Number(data.winnings) : 0;
            
            // 🔥 Update currentWinnings variable
            currentWinnings = win; 
            
            document.getElementById("depDisplay").innerText = "₹" + dep;
            document.getElementById("winDisplay").innerText = "₹" + win;
            document.getElementById("totalDisplay").innerText = "₹" + (dep + win);
            
            localStorage.setItem('wallet_cache', JSON.stringify({ dep, win }));
        });

        // Transaction History Fetch
        const txRef = db.ref("transactions").orderByChild("uid").equalTo(user.uid).limitToLast(10);
        txRef.on('value', snapshot => {
            if (!snapshot.exists()) {
                document.getElementById("txList").innerHTML = "<p style='text-align:center; font-size:12px; color:#999;'>No history found.</p>";
                return;
            }
            let html = "";
            let rows = [];
            snapshot.forEach(c => rows.push(c.val()));
            rows.reverse();
            for(let tx of rows) {
                const dt = new Date(tx.timestamp);
                const dStr = dt.toLocaleDateString('en-IN', {day:'2-digit', month:'short'});
                const tStr = dt.toLocaleTimeString('en-IN', {hour:'2-digit', minute:'2-digit', hour12:true});
                const sCls = (tx.status || 'pending').toLowerCase();
                html += `<div class="tx-item">
                            <div class="tx-info">
                                <span class="tx-type">${tx.type}</span>
                                <span class="tx-date">${dStr} | ${tStr}</span>
                            </div>
                            <div class="tx-status-box">
                                <div class="tx-amt">₹${tx.amount}</div>
                                <span class="status-badge ${sCls}">${tx.status || 'PENDING'}</span>
                            </div>
                        </div>`;
            }
            document.getElementById("txList").innerHTML = html;
            localStorage.setItem('tx_cache', html);
        });
    } else {
        window.location.href = "login.html";
    }
});

/** * 🟢 Main logic for Withdraw Button 
 */
function goToWithdraw() {
    // If winnings is less than 50, show error
    if (currentWinnings < 50) {
        alert("Winnings minimum ₹50 undenghil mathrame withdraw cheyyan pattukayulloo.");
    } else {
        // If 50 or more, go to the withdraw page
        window.location.href = "withdraw.html";
    }
}
