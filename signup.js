window.addEventListener("load", () => {
    setTimeout(() => { document.getElementById("loader").style.display = "none"; }, 600);
});

/* 🔥 STUDIO PROJECT FIREBASE CONFIG */
const firebaseConfig = {
  apiKey: "AIzaSyAo9KNsWnq2AgoCGzPuCsg7YCbuw8-Apuo",
  authDomain: "studio-4988500581-b9772.firebaseapp.com",
  projectId: "studio-4988500581-b9772",
  storageBucket: "studio-4988500581-b9772.firebasestorage.app",
  messagingSenderId: "773461302160",
  appId: "1:773461302160:web:13deb67b24b267ac0b7115"
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();
const db = firebase.database();

let realOTP = "";

// 📱 Device ID Generator
function getDeviceId() {
    let id = localStorage.getItem("kl_device_id");
    if (!id) {
        id = 'dev-' + Math.random().toString(36).substr(2, 9) + Date.now();
        localStorage.setItem("kl_device_id", id);
    }
    return id;
}

function signup() {
    let fname = v("fname"), email = v("email"), pass = v("pass");
    let msg = document.getElementById("msg");
    let btn = document.getElementById("signupBtn");

    // 1️⃣ Field Validation
    if (!fname || !email || !pass) {
        msg.style.color = "red"; msg.innerHTML = "Fill all fields!"; return;
    }

    // 2️⃣ Password Length Security (Min 8)
    if (pass.length < 8) {
        msg.style.color = "red"; 
        msg.innerHTML = "Password must be at least 8 characters!"; 
        return;
    }

    btn.disabled = true;
    msg.style.color = "var(--primary)";
    msg.innerHTML = "Checking account... 🔍";

    // 3️⃣ Email Already Exists Check
    auth.fetchSignInMethodsForEmail(email).then((methods) => {
        if (methods.length > 0) {
            msg.style.color = "red";
            msg.innerHTML = "Already Signed Up! Please login.";
            btn.disabled = false;
        } else {
            // 4️⃣ OTP Sending Process
            msg.innerHTML = "OTP Sending... 📩";
            
            fetch("https://script.google.com/macros/s/AKfycbzRs8hNcAUdVX06buCumxVKi2Qx76PX_Bjon1FkCkgQg8bb6bM2PwoJgUafQF9rrAgr3A/exec?email=" + encodeURIComponent(email))
            .then(res => res.json())
            .then(data => {
                if (data.status == "success") {
                    realOTP = data.otp;
                    msg.style.color = "green";
                    msg.innerHTML = "OTP Sended! ✅";

                    setTimeout(() => {
                        document.getElementById("otpPopup").style.display = "flex";
                        msg.innerHTML = "";
                        btn.disabled = false;
                    }, 1000);
                } else {
                    msg.style.color = "red"; msg.innerHTML = "Failed to send OTP.";
                    btn.disabled = false;
                }
            }).catch(() => {
                msg.style.color = "red"; msg.innerHTML = "Network Error!";
                btn.disabled = false;
            });
        }
    }).catch(err => {
        msg.style.color = "red"; msg.innerHTML = "Security error!";
        btn.disabled = false;
    });
}

function verifyOTP() {
    let entered = document.getElementById("otpInput").value;
    let otpMsg = document.getElementById("otpMsg");
    let vBtn = document.getElementById("verifyBtn");
    let deviceId = getDeviceId();

    if (entered == realOTP) {
        vBtn.disabled = true;
        vBtn.innerText = "Verifying...";

        // A: Create Auth User
        auth.createUserWithEmailAndPassword(v("email"), v("pass"))
        .then((cred) => {
            // B: Save Data to Realtime Database (WALLET REMOVED AS REQUESTED)
            return db.ref("users/" + cred.user.uid).set({
                firstname: v("fname"),
                lastname: v("lname") || "",
                username: v("username") || v("fname"),
                email: v("email"),
                joinedMatches: 0,
                deviceId: deviceId,
                timestamp: Date.now()
            });
        })
        .then(() => {
            // C: Save Device Log
            return db.ref("device_logs/" + deviceId).set({ registered: true, uid: auth.currentUser.uid });
        })
        .then(() => {
            otpMsg.style.color = "green";
            otpMsg.innerHTML = "Account Created! ✔";
            setTimeout(() => { window.location.href = "index.html"; }, 1500);
        })
        .catch(err => {
            vBtn.disabled = false;
            vBtn.innerText = "VERIFY & REGISTER";
            otpMsg.style.color = "red";
            otpMsg.innerHTML = err.message;
        });
    } else {
        otpMsg.style.color = "red";
        otpMsg.innerHTML = "Invalid OTP!";
    }
}

// Global Helper Functions
function v(id) { 
    let el = document.getElementById(id);
    return el ? el.value.trim() : ""; 
}

function togglePass() {
    let p = document.getElementById("pass");
    p.type = p.type === "password" ? "text" : "password";
}

function closeOTP() { document.getElementById("otpPopup").style.display = "none"; }
