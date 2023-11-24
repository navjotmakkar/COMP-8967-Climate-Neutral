import { firebaseConfig } from "./constants.js";

// Initialize Firebase
const firebaseApp = firebase.initializeApp(firebaseConfig);

const email = document.getElementById("email_id");
const password = document.getElementById("password");
const loginForm = document.getElementById("login_form");

// Function to create a user
const signInUser = (event) => {
  event.preventDefault();
  firebaseApp
    .auth()
    .signInWithEmailAndPassword(email.value, password.value)
    .then(() => {
        loginForm.reset()
        localStorage.clear()
    })
    .catch((error) => {
      // alert(error.message)
      document.getElementById('errorMsg').style.display = 'block';
      loginForm.reset()
      localStorage.clear()
    });
};

firebaseApp.auth().onAuthStateChanged((user) => {
  if (user) {
    // User is signed in, see docs for a list of available properties
    // https://firebase.google.com/docs/reference/js/auth.user
    const uid = user.uid;
    if (uid) {
      window.location.href = window.location.origin + "/pages/landingpage.html";
    }
  } else {
    console.log("User Logged out");
  }
});
loginForm.addEventListener("submit", signInUser);
