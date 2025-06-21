const params = new URLSearchParams(window.location.search);
const productName = params.get("product");
document.getElementById("orderForm").addEventListener("submit", function (e) {
  e.preventDefault();
  document.getElementById("orderMessage").textContent = "Order placed successfully!";
  
});