import { firebaseConfig } from "./constants.js";

// Initialize Firebase
const firebaseApp = firebase.initializeApp(firebaseConfig);

const userEmail = document.getElementById("user-email");
const logoutBtn = document.getElementById("user-logout");

firebaseApp.auth().onAuthStateChanged((user) => {
  if (user) {
    // User is signed in, see docs for a list of available properties
    // https://firebase.google.com/docs/reference/js/auth.user
    const uid = user.uid;
    userEmail.textContent = user.email;
    console.log(user);
  } else {
    window.location.href = window.location.origin + "/index.html";
  }
});

const handleLogout = () => {
  firebase
    .auth()
    .signOut()
    .then(() => {
      window.location.href = window.location.origin + "/index.html";
    })
    .catch((error) => {
      alert("Error while logging out!");
    });
};

logoutBtn.addEventListener("click", handleLogout);

var modal = document.querySelector(".modal");
var trigger = document.querySelector(".trigger");
var closeButton = document.querySelector(".close-button");

function toggleModal() {
    modal.classList.toggle("show-modal");
}

function windowOnClick(event) {
    if (event.target === modal) {
        toggleModal();
    }
}

trigger.addEventListener("click", toggleModal);
closeButton.addEventListener("click", toggleModal);
window.addEventListener("click", windowOnClick);