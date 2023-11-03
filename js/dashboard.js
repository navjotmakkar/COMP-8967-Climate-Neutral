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

const modalBtn = document.querySelector('.js-modal-btn');
const modal = document.querySelector('.js-modal');
const closeBtn = document.querySelector('.js-close');
const submitBtn = document.querySelector('.js-submit-btn');

modalBtn.addEventListener('click', () => {
    modal.style.display = 'block';
});

closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
});

window.addEventListener('click', (event) => {
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});

submitBtn.addEventListener('click', (e) => {
  e.preventDefault()
    const categoryName = document.getElementById('categoryName').value;
    const categoryWeight = parseFloat(document.getElementById('categoryWeight').value);
    const categoryDirection = document.getElementById('categoryDirection').value;
    const evaluationType = document.getElementById('evaluationType').value;

    // Perform validation if necessary
    // For example, check if categoryWeight is a valid float

    // Do something with the input data, for example, display it in the console
    console.log('Category Name:', categoryName);
    console.log('Category Weight:', categoryWeight);
    console.log('Category Direction:', categoryDirection);
    console.log('Evaluation Type:', evaluationType);

    // Close the modal after processing the input
    modal.style.display = 'none';
});
