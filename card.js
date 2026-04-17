/* ⚡ KL ESPORTS - FIXED USER PANEL ENGINE */

const firebaseConfig = {
    apiKey: "AIzaSyAo9KNsWnq2AgoCGzPuCsg7YCbuw8-Apuo",
    authDomain: "studio-4988500581-b9772.firebaseapp.com",
    databaseURL: "https://studio-4988500581-b9772-default-rtdb.firebaseio.com",
    projectId: "studio-4988500581-b9772",
    storageBucket: "studio-4988500581-b9772.firebasestorage.app",
    messagingSenderId: "773461302160",
    appId: "1:773461302160:web:13deb67b24b267ac0b7115"
};

if (!firebase.apps.length) { firebase.initializeApp(firebaseConfig); }
const db = firebase.database();
const auth = firebase.auth();

const matchId = new URLSearchParams(window.location.search).get('id');
let currentUid = localStorage.getItem("last_logged_uid") || "", 
    userGameName = "Player", 
    userGameID = "N/A", 
    userProfilePic = "https://www.w3schools.com/howto/img_avatar.png",
    currentBalance = 0, 
    entryFee = 0;

// 1. 🚀 INSTANT BOOT
(function boot() {
    if (!matchId) return;
    const userCache = localStorage.getItem("userProfile");
    if(userCache) {
        const d = JSON.parse(userCache);
        userGameName = d.gameName || d.username || "Gamer";
        userGameID = d.gameID || "N/A"; 
        userProfilePic = d.profilePic || "https://www.w3schools.com/howto/img_avatar.png";
        let w = d.wallet || {deposit:0, winnings:0};
        currentBalance = (parseInt(w.deposit) || 0) + (parseInt(w.winnings) || 0);
    }
    const matchCache = localStorage.getItem(`match_${matchId}`);
    if (matchCache) { renderMatchUI(JSON.parse(matchCache)); }
})();

// 2. 🔐 AUTH & REAL-TIME SYNC (FIXED LOGIC)
auth.onAuthStateChanged(user => {
    if(user) {
        currentUid = user.uid;
        db.ref("users/" + user.uid).on('value', snap => {
            if(snap.exists()) {
                const d = snap.val();
                localStorage.setItem("userProfile", JSON.stringify(d));
                userGameName = d.gameName || d.username || "Gamer";
                userGameID = d.gameID || "N/A";
                userProfilePic = d.profilePic || "https://www.w3schools.com/howto/img_avatar.png";
                let w = d.wallet || {deposit:0, winnings:0};
                currentBalance = (parseInt(w.deposit) || 0) + (parseInt(w.winnings) || 0);
            }
        });

        if(matchId) {
            // First check the main 'matches' node
            db.ref('matches/' + matchId).on('value', snap => {
                if(snap.exists()) { 
                    let matchData = snap.val();
                    
                    // IF COMPLETED: Fetch winners from the admin's 'ended' node
                    if(matchData.status === 'completed' || matchData.isEnded === true) {
                        db.ref('winnings-sender/ended/' + matchId).once('value', endedSnap => {
                            if(endedSnap.exists()) {
                                const resultData = endedSnap.val();
                                matchData.winners = resultData.winners; // Merge winners
                            }
                            localStorage.setItem(`match_${matchId}`, JSON.stringify(matchData));
                            renderMatchUI(matchData);
                        });
                    } else {
                        localStorage.setItem(`match_${matchId}`, JSON.stringify(matchData));
                        renderMatchUI(matchData);
                    }
                } else {
                    // Fallback: Check 'ended' node directly
                    db.ref('winnings-sender/ended/' + matchId).on('value', endedSnap => {
                        if(endedSnap.exists()) {
                            localStorage.setItem(`match_${matchId}`, JSON.stringify(endedSnap.val()));
                            renderMatchUI(endedSnap.val());
                        } else {
                            console.log("Match not found anywhere.");
                        }
                    });
                }
            });
        }
    } else { window.location.href = "login.html"; }
});

// 3. 🛠️ UI RENDERER (FIXED WINNERS DISPLAY)
function renderMatchUI(match) {
    const urlParams = new URLSearchParams(window.location.search);
    // Force completed mode if database says so OR URL says so
    const isCompleted = urlParams.get('status') === 'completed' || match.status === 'completed' || match.resultPublished === true;

    entryFee = parseInt(match.entry || 0);
    const maxSlots = parseInt(match.max || 48);
    const participants = match.participants || {};
    const isJoined = currentUid && participants[currentUid];
    const joinedCount = Object.keys(participants).length;

    const roomBox = document.getElementById('roomInfoBox');
    const joinFooter = document.getElementById('joinFooter');
    const tabContainer = document.querySelector('.tabs');
    const headerTitle = document.getElementById('headerTitle');
    const playerSection = document.getElementById('playerSection');
    // --- Rules Display Logic ---
const rulesSection = document.getElementById('dynamicRules');
if (rulesSection && match.rules) {
    let rhtml = "";
    match.rules.forEach((rule, index) => {
        rhtml += `
            <div class="rule-item">
                <div class="rule-num">${index + 1}</div>
                <div style="font-size: 13px; color: #555; font-weight: 600; line-height: 1.6;">${rule}</div>
            </div>`;
    });
    rulesSection.innerHTML = rhtml || `<div style="text-align:center; color:#888;">No rules set for this match.</div>`;
}

    const prizeSection = document.getElementById('prizeSection');

    if (isCompleted) {
        if (roomBox) roomBox.style.display = 'none';
        if (joinFooter) joinFooter.style.display = 'none';
        if (tabContainer) tabContainer.style.display = 'none';
        if (playerSection) playerSection.style.display = 'none';
        if (rulesSection) rulesSection.style.display = 'none';
        if (headerTitle) headerTitle.innerText = "MATCH RESULTS";

        let resultHTML = `
            <div style="padding:15px;">
                <h3 style="text-align:center; color:#ff5722; margin-bottom:15px; font-weight:900;">🏆 FINAL STANDINGS</h3>
                <table style="width:100%; border-collapse: collapse; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 5px 15px rgba(0,0,0,0.08);">
                    <thead>
                        <tr style="background: #ff5722; color: white; text-align: left; font-size: 12px; text-transform: uppercase;">
                            <th style="padding: 12px;">Rank</th>
                            <th style="padding: 12px;">Player</th>
                            <th style="padding: 12px;">Kills</th>
                            <th style="padding: 12px;">Prize</th>
                        </tr>
                    </thead>
                    <tbody>`;

        if (match.winners) {
            const sorted = Object.values(match.winners).sort((a, b) => (parseInt(a.rank) || 999) - (parseInt(b.rank) || 999));
            sorted.forEach(w => {
                resultHTML += `
                    <tr style="border-bottom: 1px solid #f0f0f0; font-size: 13px; font-weight: 700; color: #333;">
                        <td style="padding: 12px; color: #ff5722;">#${w.rank || '-'}</td>
                        <td style="padding: 12px;">${w.playerName}</td>
                        <td style="padding: 12px;"><i class="fa-solid fa-crosshairs" style="font-size:10px; color:#999; margin-right:4px;"></i>${w.kills || 0}</td>
                        <td style="padding: 12px; color: #28a745;">₹${w.prize || 0}</td>
                    </tr>`;
            });
        } else {
            resultHTML += `<tr><td colspan="4" style="padding:40px; text-align:center; color:#888;">Result is being processed...</td></tr>`;
        }

        resultHTML += `</tbody></table></div>`;
        if (prizeSection) {
            prizeSection.innerHTML = resultHTML;
            prizeSection.style.display = 'block';
        }
    } else {
        // --- 🎮 NORMAL UI: Ongoing/Upcoming ---
        if (roomBox) roomBox.style.display = 'block';
        if (joinFooter) joinFooter.style.display = 'flex';
        if (tabContainer) tabContainer.style.display = 'flex';
        
        const headerContainer = document.getElementById('matchHeaderContainer');
        if(headerContainer) {
            headerContainer.innerHTML = `
            <div class="match-card" style="background:white; border-radius:12px; padding:15px; margin:15px; box-shadow:0 4px 15px rgba(0,0,0,0.08); border-top:4px solid #ff5722;">
                <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                    <div style="flex:1;">
                        <div style="display:flex; gap:6px; margin-bottom:10px;">
                            <span style="border:1px solid #ddd; padding:2px 8px; border-radius:6px; font-size:10px; font-weight:700;">${match.teamType || 'SOLO'}</span>
                            <span style="border:1px solid #ddd; padding:2px 8px; border-radius:6px; font-size:10px; font-weight:700;">${match.map || 'BERMUDA'}</span>
                        </div>
                        <div style="font-size:14px; font-weight:800; text-transform:uppercase;">FREE FIRE - ${match.category}</div>
                        <div style="font-size:20px; font-weight:900; color:#28a745; margin-top:35px;">Prize Pool - ₹${match.totalPrize}</div>
                    </div>
                    <div style="text-align:right;">
                        <img src="${match.image || 'img/default.png'}" style="width:110px; height:110px; border-radius:12px; object-fit:cover;">
                    </div>
                </div>
                <div style="width:100%; height:8px; background:#f0f0f0; border-radius:10px; margin-top:15px; overflow:hidden;">
                    <div style="width:${(joinedCount/maxSlots)*100}%; height:100%; background:linear-gradient(90deg, #28a745, #a3cfbb);"></div>
                </div>
                <div style="display:flex; justify-content:space-between; font-size:11px; font-weight:800; margin-top:8px;">
                    <span style="color:#ff5722;">${maxSlots - joinedCount} spots left</span>
                    <span style="color:#666;">${joinedCount}/${maxSlots} Joined</span>
                </div>
            </div>`;
        }

        if(prizeSection) {
            let phtml = `<div style="padding:10px;">`;
            const prizes = match.prizes || []; 
            prizes.forEach((p) => {
                phtml += `<div style="display:flex; align-items:center; justify-content:space-between; background:#fff; padding:12px; margin-bottom:8px; border-radius:10px; border:1px solid #f0f0f0; border-left: 4px solid #28a745;">
                    <div style="display:flex; align-items:center; gap:12px;">
                        <i class="fa-solid fa-trophy" style="color:#ffc107;"></i>
                        <span style="font-weight:800; color:#333; font-size:13px;">RANK ${p.rank}</span>
                    </div>
                    <b style="color:#28a745; font-size:14px;">₹${p.prize}</b>
                </div>`;
            });
            prizeSection.innerHTML = phtml + `</div>`;
        }

        const roomContent = document.getElementById('roomDetailsContent');
        if(isJoined) {
            roomContent.innerHTML = `
                <div style="display:flex; gap:10px; width:100%;">
                    <div style="flex:1; background:#f9f9f9; padding:12px; border-radius:8px; text-align:center; border:1px solid #eee;">
                        <small style="color:#888;">ROOM ID</small><br><b>${match.roomId || "VISIBLE HERE"}</b>
                    </div>
                    <div style="flex:1; background:#f9f9f9; padding:12px; border-radius:8px; text-align:center; border:1px solid #eee;">
                        <small style="color:#888;">PASSWORD</small><br><b>${match.roomPass || "VISIBLE HERE"}</b>
                    </div>
                </div>`;
        } else {
            roomContent.innerHTML = `<div style="color:#ff5722; text-align:center; width:100%; font-weight:bold;">JOIN TO SEE ROOM DETAILS</div>`;
        }

        const playerList = document.getElementById('playerList');
        let plhtml = `<div style="padding:10px;">`;
        Object.values(participants).forEach((p, index) => {
            plhtml += `
                <div style="display:flex; align-items:center; justify-content:space-between; background:#fff; padding:12px; margin-bottom:8px; border-radius:10px; border:1px solid #f0f0f0;">
                    <div style="display:flex; align-items:center; gap:12px;">
                        <b style="color:#ff5722; width:20px; font-size:12px;">${index + 1}</b>
                        <img src="${p.profilePic || 'https://www.w3schools.com/howto/img_avatar.png'}" style="width:40px; height:40px; border-radius:50%; object-fit:cover;">
                        <div>
                            <span style="font-weight:800; color:#333; font-size:13px; display:block;">${p.playerName}</span>
                            <small style="color:#888; font-size:10px;">ID: ${p.gameID || 'N/A'}</small>
                        </div>
                    </div>
                </div>`;
        });
        if(playerList) playerList.innerHTML = plhtml + `</div>`;

        const jBtn = document.getElementById('joinBtn');
        if(isJoined) { 
            jBtn.innerText = `JOINED - ₹${entryFee}`;
            jBtn.disabled = true; jBtn.style.background = "#ccc"; 
        } else { 
            jBtn.innerText = `JOIN NOW - ₹${entryFee}`; 
            jBtn.onclick = handleJoin; 
            jBtn.style.background = "#ff5722";
        }
    }
}
async function handleJoin() {
    const jBtn = document.getElementById('joinBtn');
    const fee = Number(entryFee) || 0;
    if (currentBalance < fee) return alert("Insufficient Balance!");
    if (!userGameID || userGameID === "N/A" || userGameID === "") return alert("Update Game ID in profile first!");

    if (confirm(`Join match for ₹${fee}?`)) {
        if (jBtn) { jBtn.innerText = "JOINING..."; jBtn.disabled = true; }
        const walletRef = db.ref('users/' + currentUid + '/wallet');
        
        walletRef.transaction((wallet) => {
            if (!wallet) return wallet;
            let dep = Number(wallet.deposit) || 0;
            let win = Number(wallet.winnings) || 0;
            if ((dep + win) < fee) return; 
            if (dep >= fee) { dep -= fee; } else { let rem = fee - dep; dep = 0; win -= rem; }
            wallet.deposit = dep;
            wallet.winnings = win;
            return wallet;
        }, (err, committed) => {
            if (err || !committed) {
                alert("Transaction Failed!");
                if (jBtn) { jBtn.innerText = `JOIN NOW - ₹${fee}`; jBtn.disabled = false; }
            } else {
                // 1. Matches node-ilekk participants-ne add cheyyunnu
                db.ref(`matches/${matchId}/participants/${currentUid}`).set({ 
                    uid: currentUid, 
                    playerName: userGameName, 
                    gameID: userGameID, 
                    profilePic: userProfilePic, 
                    joinedAt: Date.now() 
                }).then(() => { 
                    
                    // 2. --- HISTORY SAVING LOGIC (PUTHIYATHU) ---
                    db.ref(`user_history/${currentUid}/${matchId}`).set({
                        matchId: matchId,
                        matchTitle: "Free Fire Match", 
                        entryFee: fee,
                        wonAmount: 0,
                        date: new Date().toLocaleDateString()
                    });
                    // -------------------------------------------

                    alert("Joined Successfully! 🔥"); 
                    if (jBtn) {
                        jBtn.innerText = `JOINED - ₹${fee}`;
                        jBtn.disabled = true;
                        jBtn.style.background = "#ccc";
                    }
                });
            }
        });
    }
}

window.showTab = function(t, el) {
    document.querySelectorAll('.tab').forEach(x => x.classList.remove('active'));
    if(el) el.classList.add('active');
    ['prizeSection', 'playerSection', 'rulesSection'].forEach(s => {
        const sec = document.getElementById(s);
        if(sec) sec.style.display = 'none';
    });
    const target = document.getElementById(t + 'Section');
    if(target) target.style.display = 'block';
}
