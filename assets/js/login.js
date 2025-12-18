// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  const authForm = document.getElementById("authForm");
  const formTitle = document.getElementById("form-title");
  const authButton = document.getElementById("authButton");
  const toggleLink = document.getElementById("toggleLink");
  const authMessage = document.getElementById("auth-message");

  let isLogin = true;

  // Initialize form state
  updateFormUI();

  toggleLink.addEventListener("click", (e) => {
    e.preventDefault();
    isLogin = !isLogin;
    updateFormUI();
  });

  function updateFormUI() {
    if (isLogin) {
      formTitle.textContent = "Login to DryFruits";
      authButton.textContent = "Login";
      toggleLink.textContent = "Sign up here";
      document.getElementById("username").placeholder = "Username";
      document.getElementById("password").placeholder = "Password";
    } else {
      formTitle.textContent = "Sign up for DryFruits";
      authButton.textContent = "Sign Up";
      toggleLink.textContent = "Login here";
      document.getElementById("username").placeholder = "Choose Username";
      document.getElementById("password").placeholder = "Choose Password";
    }
    // Clear any previous messages
    if (authMessage) {
      authMessage.textContent = "";
      authMessage.style.color = "";
    }
  }

  authForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;

    // Basic validation
    if (!username || !password) {
      showMessage("Please fill in all fields.", "red");
      return;
    }

    if (!isLogin && password.length < 6) {
      showMessage("Password must be at least 6 characters long.", "red");
      return;
    }

    const storedUser = localStorage.getItem(username);

    if (isLogin) {
      // Login flow
      if (storedUser && JSON.parse(storedUser).password === password) {
        showMessage("Login successful! Redirecting...", "green");
        // Store login session
        localStorage.setItem('currentUser', username);
        setTimeout(() => {
          window.location.href = "../index.html";
        }, 1000);
      } else {
        showMessage("Invalid username or password.", "red");
      }
    } else {
      // Signup flow
      if (storedUser) {
        showMessage("Username already exists. Try logging in instead.", "red");
      } else {
        // Store user data
        const userData = {
          password: password,
          signupDate: new Date().toISOString(),
          orders: []
        };
        localStorage.setItem(username, JSON.stringify(userData));
        showMessage("Account created successfully! Switching to login...", "green");
        setTimeout(() => {
          // Switch to login form automatically
          isLogin = true;
          updateFormUI();
          // Clear form
          authForm.reset();
        }, 1500);
      }
    }
  });

  function showMessage(message, color) {
    if (authMessage) {
      authMessage.textContent = message;
      authMessage.style.color = color;
      authMessage.style.fontWeight = "bold";
    }
  }

  // Check if user is already logged in
  const currentUser = localStorage.getItem('currentUser');
  if (currentUser) {
    showMessage(`Welcome back, ${currentUser}! Redirecting...`, "green");
    setTimeout(() => {
      window.location.href = "../index.html";
    }, 1500);
  }
});
