const authForm = document.getElementById("authForm");
const formTitle = document.getElementById("form-title");
const authButton = document.getElementById("authButton");
const toggleLink = document.getElementById("toggleLink");
const authMessage = document.getElementById("auth-message");

let isLogin = true;

toggleLink.addEventListener("click", () => {
  isLogin = !isLogin;

  if (isLogin) {
    formTitle.textContent = "Login to Rajaji DryFruits";
    authButton.textContent = "Login";
    toggleLink.textContent = "Sign up here";
    authMessage.textContent = "";
  } else {
    formTitle.textContent = "Sign up for Rajaji DryFruits";
    authButton.textContent = "Sign Up";
    toggleLink.textContent = "Login here";
    authMessage.textContent = "";
  }
});

authForm.addEventListener("submit", function (e) {
  e.preventDefault();
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;

  const storedUser = localStorage.getItem(username);

  if (isLogin) {
    // Login flow
    if (storedUser && JSON.parse(storedUser).password === password) {
      authMessage.style.color = "green";
      authMessage.textContent = "Login successful!";
      setTimeout(() => {
        window.location.href = "index.html";
      }, 1000);
    } else {
      authMessage.style.color = "red";
      authMessage.textContent = "Invalid username or password.";
    }
  } else {
    // Signup flow
    if (storedUser) {
      authMessage.style.color = "red";
      authMessage.textContent = "User already exists. Try logging in.";
    } else {
      localStorage.setItem(username, JSON.stringify({ password }));
      authMessage.style.color = "green";
      authMessage.textContent = "Signup successful! Please login now.";
      setTimeout(() => {
        // Switch to login form
        toggleLink.click();
      }, 1000);
    }
  }
});
