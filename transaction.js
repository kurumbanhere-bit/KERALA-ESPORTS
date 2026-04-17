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

firebase.auth().onAuthStateChanged(user => {
    if (user) {
        db.ref("transactions").orderByChild("uid").equalTo(user.uid).on('value', snapshot => {
            const container = document.getElementById("txContainer");
            container.innerHTML = ""; 

            if (!snapshot.exists()) {
                container.innerHTML = `<div id="noData">No history found.</div>`;
                return;
            }

            let list = [];
            snapshot.forEach(c => { list.push(c.val()); });
            list.reverse(); 

            list.forEach(tx => {
                const d = new Date(tx.timestamp);
                const dS = d.toLocaleDateString('en-IN', {day:'2-digit', month:'short'});
                const tS = d.toLocaleTimeString('en-IN', {hour:'2-digit', minute:'2-digit'});
                
                let st = (tx.status || 'pending').toLowerCase();
                
                container.innerHTML += `
                    <div class="tx-card ${st}">
                        <div class="tx-details">
                            <span class="tx-type">${tx.type}</span>
                            <span class="tx-date">${dS} | ${tS}</span>
                        </div>
                        <div class="tx-right">
                            <div class="tx-amount">₹${tx.amount}</div>
                            <span class="status-badge badge-${st}">${st}</span>
                        </div>
                    </div>`;
            });
        });
    } else {
        window.location.href = "login.html";
    }
});
