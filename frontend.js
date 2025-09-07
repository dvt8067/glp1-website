// smooth scrolling when clicking navbar
var SmoothScroll = {

  $clickText: $('.main-nav a'),

  bindText: function() {
    this.$clickText.on("click", function(event) {

      // only scroll if on HP, otherwise open link regularly
      // var onHomePage = location.pathname=="/";
      // if (onHomePage) {
      //   event.preventDefault();
      // }
      event.preventDefault();

      // $(this) refers to nav-link element.
      // if icon is clicked, event automatically bubbles
      // up and triggers this nav-link element.
      var destElement = $(this).attr('href');

      SmoothScroll.scroll(destElement);
    });
  },

  scroll: function(destElement) {
    var headerHeight = $('.main-nav').outerHeight();
    $('html, body').animate({
        scrollTop: $(destElement).offset().top - headerHeight
    }, 800);
  },

  init: function() {
    this.bindText();
  },

};

SmoothScroll.init();
document.addEventListener("DOMContentLoaded", function () {
  const slides = document.querySelectorAll(".testimonial-slide");
  const prevBtn = document.querySelector(".testimonial-nav.prev");
  const nextBtn = document.querySelector(".testimonial-nav.next");
  let current = 0;

  function showSlide(idx) {
    slides.forEach((slide, i) => {
      slide.classList.toggle("active", i === idx);
    });
  }

  prevBtn.addEventListener("click", function () {
    current = (current - 1 + slides.length) % slides.length;
    showSlide(current);
  });

  nextBtn.addEventListener("click", function () {
    current = (current + 1) % slides.length;
    showSlide(current);
  });

  showSlide(current);
});

const isLocalhost =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";
let BACKEND_URL;
if (isLocalhost) {
  BACKEND_URL = "http://127.0.0.1:3000/contact";
} else {
  BACKEND_URL = "https://glp1-website.onrender.com/contact";
}
const RECAPTCHA_SITE_KEY = "6Lfzl6crAAAAAC3O3Eo0V2fRs9PAipGbax__dFOF"; //
document
  .querySelector(".contact-form")
  .addEventListener("submit", async function (e) {
    e.preventDefault();
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const formMessage = document.getElementById("form-message").value;
    const statusMessageDiv = document.getElementById("result-message");
    statusMessageDiv.textContent =
      "Submitting... This will only take a few moments.";
    statusMessageDiv.className = "result-message submitting";
    grecaptcha.ready(function () {
      grecaptcha
        .execute(RECAPTCHA_SITE_KEY, { action: "submit" })
        .then(async function (recaptchaResponse) {
          // Send the form data along with the reCAPTCHA response to the backend
          try {
            const response = await fetch(BACKEND_URL, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                name,
                email,
                formMessage,
                recaptcha: recaptchaResponse,
              }),
            });
            const result = await response.json();
            if (response.ok) {
              statusMessageDiv.textContent = "Thank you for your submission!";
              statusMessageDiv.className = "result-message success";
              document.querySelector(".contact-form").reset();
            } else {
              statusMessageDiv.textContent =
                result.message || "reCAPTCHA verification failed.";
              statusMessageDiv.className = "result-message error";
            }
          } catch (error) {
            console.error("Error submitting form:", error);
            statusMessageDiv.textContent =
              "There was an error submitting the form.";
            statusMessageDiv.className = "result-message error";
          }
        });
    });
  });
