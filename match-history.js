// match-history.js - FULL CODE
const firebaseConfig = {
    apiKey: "AIzaSyBrHcONT6y0he3fzrtRGqdQMZfIMpGxcNo",
    authDomain: "kl-esports.firebaseapp.com",
    databaseURL: "https://kl-esports-default-rtdb.firebaseio.com",
    projectId: "kl-esports",
    storageBucket: "kl-esports.appspot.com",
    messagingSenderId: "440301376580",
    appId: "1:440301376580:web:fb0b8ae0df3fe096bd1811"
};

// Firebase Initialize
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();
const db = firebase.database();

// Login Check
auth.onAuthStateChanged(user => {
    if (user) {
        loadMatchHistory(user.uid);
    } else {
        window.location.href = "index.html";
    }
});

function loadMatchHistory(uid) {
    const listContainer = document.getElementById("match-list");
    
    // User history path-il ninnu data edukunnu
    db.ref("user_history").child(uid).on('value', snapshot => {
        listContainer.innerHTML = "";
        
        if (!snapshot.exists()) {
            listContainer.innerHTML = "<div style='text-align:center;margin-top:50px;color:#888;'>No matches joined yet.</div>";
            return;
        }

        let historyArray = [];
        snapshot.forEach(child => {
            historyArray.push({ id: child.key, ...child.val() });
        });
        historyArray.reverse(); // Puthiya matches munnil varaan

        historyArray.forEach(data => {
            const matchId = data.matchId;

            // Matches path-il ninnu real status edukunnu
            db.ref("matches").child(matchId).once('value', matchSnap => {
                const matchInfo = matchSnap.val();
                
                // Default values
                let status = "Upcoming"; 
                let statusColor = "#0fa958"; // Green
                let winnersHTML = "";
                let canOpen = false;

                if (matchInfo) {
                    status = matchInfo.status || "Upcoming";
                    
                    if (status === "Ongoing") {
                        statusColor = "#ff9800"; // Orange
                    } else if (status === "Completed") {
                        statusColor = "#888"; // Grey
                        canOpen = true; // Completed aanengil mathram open aakum
                    }

                    // Winner list kaanikkaan
                    if (status === "Completed" && matchInfo.winners) {
                        winnersHTML = `<div style="margin-top:10px; border-top:1px solid #eee; padding-top:10px;">
                            <span style="font-size:10px; font-weight:900; color:#0fa958;"><i class="fa-solid fa-trophy"></i> WINNERS</span>`;
                        Object.values(matchInfo.winners).forEach(w => {
                            winnersHTML += `<div style="display:flex; justify-content:space-between; font-size:11px; font-weight:800; margin-top:4px;">
                                <span>${w.playerName} (Rank ${w.rank})</span>
                                <span style="color:#0fa958;">₹${w.winnings}</span>
                            </div>`;
                        });
                        winnersHTML += `</div>`;
                    }
                }

                // Click condition
                const clickAction = canOpen ? `onclick="window.location.href='card.html?id=${matchId}'"` : "";
                const cursorStyle = canOpen ? "pointer" : "default";

                const card = `
                <div ${clickAction} style="cursor:${cursorStyle}; background:white; border-radius:15px; padding:15px; margin: 10px 15px; border:1px solid #eee; box-shadow:0 2px 5px rgba(0,0,0,0.03);">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <div style="flex:1;">
                            <div style="display:flex; align-items:center; gap:8px;">
                                <span style="font-weight:900; font-size:14px; color:#222;">#${matchId} ${data.matchTitle}</span>
                                <span style="font-size:9px; font-weight:900; background:${statusColor}; color:white; padding:2px 6px; border-radius:4px; text-transform:uppercase;">${status}</span>
                            </div>
                            <span style="font-size:11px; color:#999; font-weight:700; display:block; margin-top:4px;">${data.date}</span>
                        </div>
                        <div style="display:flex; gap:12px; text-align:center;">
                            <div>
                                <span style="font-size:9px; color:#bbb; font-weight:800; display:block;">PAID</span>
                                <span style="font-weight:900; font-size:13px; color:#333;">⚡${data.entryFee}</span>
                            </div>
                            <div>
                                <span style="font-size:9px; color:#bbb; font-weight:800; display:block;">WON</span>
                                <span style="font-weight:900; font-size:13px; color:#0fa958;">⚡${data.wonAmount || 0}</span>
                            </div>
                        </div>
                    </div>
                    ${winnersHTML}
                </div>`;
                
                listContainer.innerHTML += card;
            });
        });
    });
}
