document.addEventListener("DOMContentLoaded", function() {
  const analyseBtn = document.getElementById("analyse-ai-btn");
  const popup = document.getElementById("ai-popup");
  const closeBtn = document.getElementById("close-popup");

  analyseBtn.addEventListener("click", () => {
    popup.style.display = "flex";
  });

  closeBtn.addEventListener("click", () => {
    popup.style.display = "none";
  });

  // Close when clicking outside the popup box
  popup.addEventListener("click", (event) => {
    if (event.target === popup) {
      popup.style.display = "none";
    }
  });
});
