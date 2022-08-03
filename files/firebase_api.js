// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.8.4/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithCustomToken } from "https://www.gstatic.com/firebasejs/9.8.4/firebase-auth.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCr2wl1TNqcY1814-Ejp8jFrzOlYWx-5ns",
  authDomain: "hibiscus-player.firebaseapp.com",
  projectId: "hibiscus-player",
  storageBucket: "hibiscus-player.appspot.com",
  messagingSenderId: "950440860853",
  appId: "1:950440860853:web:26c519c211771c1d09f2fc"
};

// Initialize Firebase
window.firebaseData = {
    firebaseApp: initializeApp(firebaseConfig),
    firebaseAuth: getAuth(),
    getUser() {
        return this.firebaseAuth.currentUser;
    },
    isLoggedIn() {
        return this.firebaseAuth.currentUser != null;
    },
    getAccessTokenFromRefreshToken: function(refreshToken) {
        var xhr = new XMLHttpRequest();
        xhr.open("POST", "https://securetoken.googleapis.com/v1/token?key=" + firebaseConfig.apiKey);

        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xhr.onload = () => {
            console.log(JSON.parse(xhr.response));
        };
        xhr.send("grant_type=refresh_token&refresh_token=" + refreshToken);
    },
    loginGoogle: function() {
        let provider = new GoogleAuthProvider();
        provider.addScope("https://www.googleapis.com/auth/userinfo.profile");
        this.firebaseAuth.useDeviceLanguage();
        signInWithPopup(this.firebaseAuth, provider).then((result) => {
            // This gives you a Google Access Token. You can use it to access the Google API.
            const credential = GoogleAuthProvider.credentialFromResult(result);
            const token = credential.accessToken;
            // The signed-in user info.
            const user = result.user;

            console.log("Credential:");
            console.log(credential);

            console.log("Token:");
            console.log(token);

            console.log("User info:");
            console.log(user);

            console.log("Result itself:");
            console.log(result);
        }).catch((error) => {
            // Handle Errors here.
            const errorCode = error.code;
            const errorMessage = error.message;
            // The email of the user's account used.
            const email = error.customData.email;
            // The AuthCredential type that was used.
            const credential = GoogleAuthProvider.credentialFromError(error);

            console.log("Error code:");
            console.log(errorCode);

            console.log("Error message:");
            console.log(errorMessage);

            console.log("Email:");
            console.log(email);

            console.log("Credential:");
            console.log(credential);

            console.log("Result itself:");
            console.log(error);
        });
    }
}