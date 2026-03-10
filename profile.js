// ⚡ ULTRA SPEED LOADING LOGIC
const cache = localStorage.getItem("userProfile");
if(cache) {
    const data = JSON.parse(cache);
    document.getElementById("uName").innerText = data.username || "Gamer";
    document.getElementById("userImg").src = data.profilePic || "https://cdn-icons-png.flaticon.com/512/149/149071.png";
    document.getElementById("loader").style.display = "none";
}

const firebaseConfig = {
 apiKey: "AIzaSyBrHcONT6y0he3fzrtRGqdQMZfIMpGxcNo",
 authDomain: "kl-esports.firebaseapp.com",
 databaseURL: "https://kl-esports-default-rtdb.firebaseio.com",
 projectId: "kl-esports",
 storageBucket: "kl-esports.appspot.com",
 messagingSenderId: "440301376580",
 appId: "1:440301376580:web:fb0b8ae0df3fe096bd1811"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();

auth.onAuthStateChanged(user => {
    if(user) {
        db.ref("users").child(user.uid).on('value', snapshot => {
            const myData = snapshot.val();
            if(myData) {
                localStorage.setItem("userProfile", JSON.stringify(myData));
                document.getElementById("uName").innerText = myData.username || "Gamer";
                document.getElementById("userImg").src = myData.profilePic || "https://cdn-icons-png.flaticon.com/512/149/149071.png";
                document.getElementById("loader").style.display = "none";
            }
        });
    } else { 
        localStorage.removeItem("userProfile");
        window.location.href = "index.html"; 
    }
});

const infoData = {
    faq: `<b>How do I join a match?</b><br>Go to home, select a match, and click JOIN.<br><br><b>How to withdraw?</b><br>Go to Wallet, enter UPI ID.<br><br><b>Hack Policy:</b><br>Permanent ban for hackers.`,
    about: `<b>Kerala Esports</b> is the #1 platform for FF enthusiasts in Kerala, founded in 2026.`,
    terms: `1. Must be 18+ to play.<br>2. Fair play only.<br>3. No refunds.<br>4. Only one account per person.`
};

function openModal(type) {
    const titles = { faq: 'FAQs', about: 'About Us', terms: 'Terms & Conditions' };
    document.getElementById("modalTitle").innerText = titles[type];
    document.getElementById("modalBody").innerHTML = infoData[type];
    document.getElementById("infoModal").style.display = "flex";
}

function closeModal() { document.getElementById("infoModal").style.display = "none"; }

function logoutUser() {
    if(confirm("Are you sure you want to logout?")) {
        auth.signOut().then(() => { 
            localStorage.removeItem("userProfile");
            window.location.href = "index.html"; 
        }).catch(err => { alert("Logout Error: " + err.message); });
    }
}
