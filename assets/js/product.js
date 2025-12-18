<script>
  const modal = document.getElementById("orderModal");
  const closeBtn = document.querySelector(".close-btn");
  const orderForm = document.getElementById("orderForm");
  const orderMessage = document.getElementById("orderMessage");
  const productNameInput = document.getElementById("productName");

  // Add click event to all "Add to Cart" buttons
  document.querySelectorAll(".product-card button").forEach((button) => {
    button.addEventListener("click", function () {
      const productTitle = this.closest(".product-card").querySelector("h3").innerText;
      productNameInput.value = productTitle;
      modal.style.display = "block";
    });
  });

  closeBtn.onclick = function () {
    modal.style.display = "none";
    orderForm.reset();
    orderMessage.textContent = "";
  };

  window.onclick = function (event) {
    if (event.target === modal) {
      modal.style.display = "none";
      orderForm.reset();
      orderMessage.textContent = "";
    }
  };

  orderForm.addEventListener("submit", function (e) {
    e.preventDefault();
    orderMessage.textContent = "Order placed successfully!";
    setTimeout(() => {
      modal.style.display = "none";
      orderForm.reset();
      orderMessage.textContent = "";
    }, 2000);
  });
</script>
