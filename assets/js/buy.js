document.addEventListener('DOMContentLoaded', function() {
  const orderForm = document.getElementById("orderForm");
  const orderMessage = document.getElementById("orderMessage");
  const productNameInput = document.getElementById("productName");

  // Check if we have a selected product from localStorage
  const selectedProduct = JSON.parse(localStorage.getItem('selectedProduct') || 'null');

  if (selectedProduct && productNameInput) {
    productNameInput.value = selectedProduct.name;
  }

  if (orderForm) {
    orderForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const formData = new FormData(orderForm);
      const orderData = {
        productName: formData.get('productName'),
        quantity: formData.get('quantity'),
        address: formData.get('address'),
        phone: formData.get('phone')
      };

      // Basic validation
      if (!orderData.productName || !orderData.quantity || !orderData.address || !orderData.phone) {
        if (orderMessage) {
          orderMessage.textContent = "Please fill in all fields.";
          orderMessage.style.color = "red";
        }
        return;
      }

      // Simulate order processing
      if (orderMessage) {
        orderMessage.textContent = "Order placed successfully! You will receive a confirmation call.";
        orderMessage.style.color = "green";

        // Clear the form
        orderForm.reset();

        // Clear selected product from localStorage
        localStorage.removeItem('selectedProduct');

        // Redirect to home page after 3 seconds
        setTimeout(() => {
          window.location.href = '../index.html';
        }, 3000);
      }
    });
  }
});