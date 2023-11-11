import { firebaseConfig } from "./constants.js";

// Initialize Firebase
const firebaseApp = firebase.initializeApp(firebaseConfig);
const auth = firebaseApp.auth();

const email = document.getElementById("email_id");
const password = document.getElementById("password");
const signUpForm = document.getElementById("sign-up-form");

// Function to create a user
function createUser(email, password) {
  auth
    .createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      alert("User Created successfully!");
      signUpForm.reset()
    })
    .catch((error) => {
      alert(error.message)
      signUpForm.reset()
    });
}
const registerUser = (e) => {
  e.preventDefault();

  createUser(email.value, password.value);
};

signUpForm.addEventListener("submit", registerUser);
