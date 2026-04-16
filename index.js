// 🔥 KERALA ESPORTS - FIREBASE CONFIG
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

// 🚀 Login Function
function login() {
    const email = document.getElementById('email').value.trim();
    const pass = document.getElementById('password').value; // ✅ Fixed ID
    const btn = document.getElementById('loginBtn');
    const errorDiv = document.getElementById('error');

    // 1. Basic Validation
    if(!email || !pass) {
        alert("Email-um Password-um enter cheyyuka!");
        return;
    }

    // UI Feedback
    btn.innerText = "SIGNING IN...";
    btn.disabled = true;

    // 2. Firebase Auth Sign In
    auth.signInWithEmailAndPassword(email, pass)
    .then((userCredential) => {
        const user = userCredential.user;
        
        // Success: Fetch data once and save to Cache for Fast Loading
        db.ref("users/" + user.uid).once('value').then(snapshot => {
            const userData = snapshot.val();
            if(userData) {
                // Dashboard-il 0.01 sec-il keraan vendi cache save cheyyunnu
                localStorage.setItem("userProfile", JSON.stringify(userData));
            }
            console.log("Login Success!");
            window.location.href = "dashboard.html";
        });
    })
    .catch((error) => {
        // Error handling
        btn.innerText = "LOGIN";
        btn.disabled = false;
        
        let errorMessage = "Login Failed!";
        if (error.code === 'auth/wrong-password') {
            errorMessage = "Wrong Password! Password check cheyyu.";
        } else if (error.code === 'auth/user-not-found') {
            errorMessage = "Ee email-il account illa. Signup cheyyu.";
        } else if (error.code === 'auth/invalid-email') {
            errorMessage = "Email format shariyalla.";
        }
        
        if(errorDiv) {
            errorDiv.innerText = errorMessage;
        } else {
            alert(errorMessage);
        }
    });
}
