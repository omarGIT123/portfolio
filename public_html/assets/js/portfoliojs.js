/**
 * Initializes the Google Map with custom styles and settings.
 * This function creates a new Google Map instance centered at specific coordinates
 * and applies custom map styling and various controls settings (disabled).
 */
function initMap() {
  new google.maps.Map(document.getElementById("map"), {
    center: { lat: 40.674, lng: -73.945 }, // Coordinates for the map center
    zoom: 12, // Zoom level
    scrollwheel: !1, // Disable scrollwheel zooming
    navigationControl: !1, // Disable navigation controls (zoom buttons)
    mapTypeControl: !1, // Disable map type selection
    scaleControl: !1, // Disable scale control
    styles: [
      // Custom map styles
      { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
      { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
      { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
      {
        featureType: "administrative.locality",
        elementType: "labels.text.fill",
        stylers: [{ color: "#d59563" }],
      },
      {
        featureType: "poi",
        elementType: "labels.text.fill",
        stylers: [{ color: "#d59563" }],
      },
      {
        featureType: "poi.park",
        elementType: "geometry",
        stylers: [{ color: "#263c3f" }],
      },
      {
        featureType: "poi.park",
        elementType: "labels.text.fill",
        stylers: [{ color: "#6b9a76" }],
      },
      {
        featureType: "road",
        elementType: "geometry",
        stylers: [{ color: "#38414e" }],
      },
      {
        featureType: "road",
        elementType: "geometry.stroke",
        stylers: [{ color: "#212a37" }],
      },
      {
        featureType: "road",
        elementType: "labels.text.fill",
        stylers: [{ color: "#9ca5b3" }],
      },
      {
        featureType: "road.highway",
        elementType: "geometry",
        stylers: [{ color: "#746855" }],
      },
      {
        featureType: "road.highway",
        elementType: "geometry.stroke",
        stylers: [{ color: "#1f2835" }],
      },
      {
        featureType: "road.highway",
        elementType: "labels.text.fill",
        stylers: [{ color: "#f3d19c" }],
      },
      {
        featureType: "transit",
        elementType: "geometry",
        stylers: [{ color: "#2f3948" }],
      },
      {
        featureType: "transit.station",
        elementType: "labels.text.fill",
        stylers: [{ color: "#d59563" }],
      },
      {
        featureType: "water",
        elementType: "geometry",
        stylers: [{ color: "#17263c" }],
      },
      {
        featureType: "water",
        elementType: "labels.text.fill",
        stylers: [{ color: "#515c6d" }],
      },
      {
        featureType: "water",
        elementType: "labels.text.stroke",
        stylers: [{ color: "#17263c" }],
      },
    ],
  });
}

/**
 * Creates a typing effect for the name displayed in the element with ID 'typing-name'.
 * The function simulates typing by appending one character at a time with a delay.
 */
function startTypingEffect() {
  var e = "Omar Bradai", // The text to display with typing effect
    t = document.getElementById("typing-name"), // Target element to display the text
    o = 0; // Counter for the current character index
  !(function l() {
    if (o < e.length) {
      t.innerHTML += e.charAt(o); // Add one character at a time
      o++;
      setTimeout(l, 150); // Delay the next character addition
    }
  })();
}

/**
 * Closes the chat box by hiding the messages and changing button visibility.
 */
function closeChatBox() {
  document.getElementById("chat-messages").style.display = "none"; // Hide chat messages
  document.getElementById("close-m").style.display = "none"; // Hide the close button
  document.getElementById("open-m").style.display = "block"; // Show the open button
}

/**
 * Opens the chat box by displaying the chat messages and changing button visibility.
 */
function openChatBox() {
  document.getElementById("chat-messages").style.display = "block"; // Show chat messages
  document.getElementById("open-m").style.display = "none"; // Hide the open button
  document.getElementById("close-m").style.display = "block"; // Show the close button
}

// Smooth scrolling functionality for navbar links
$(document).ready(function () {
  $(".navbar .nav-link").on("click", function (e) {
    if (this.hash !== "") {
      e.preventDefault();
      var t = this.hash;
      $("html, body").animate({ scrollTop: $(t).offset().top }, 700); // Animate scroll to target section
    }
  });
});

// Portfolio filtering and isotope animation
$(window).on("load", function () {
  var e = $(".portfolio-container");
  e.isotope({
    filter: ".new", // Default filter to show new projects
    animationOptions: { duration: 750, easing: "linear", queue: false },
  });

  $(".filters a").click(function () {
    $(".filters .active").removeClass("active"); // Remove active class from current filter
    $(this).addClass("active"); // Add active class to clicked filter
    var t = $(this).attr("data-filter");
    e.isotope({
      filter: t, // Filter portfolio items based on selected category
      animationOptions: { duration: 750, easing: "linear", queue: false },
    });
    return false; // Prevent default behavior
  });
});

// Modal view for project details
$(document).ready(function () {
  $(".view-details").on("click", function () {
    var e = $(this).data("title"),
      t = $(this).attr("data-description"),
      o = $(this).data("image"),
      l = `<div class="project-modal-content">${t}</div>`;
    $("#projectModalLabel").text(e),
      $("#modalDescription").html(l),
      $("#modalMainImage").attr("src", o),
      $("#projectModal").modal("show"); // Show project modal with details
  });

  $(".filter-btn").on("click", function () {
    var e = $(this).data("filter");
    $(".project-card").each(function () {
      "all" === e
        ? $(this).show() // Show all projects
        : $(this).toggle($(this).data("category") === e); // Show filtered projects
    });
    $(".filter-btn").removeClass("active"); // Remove active class from all filter buttons
    $(this).addClass("active"); // Add active class to clicked filter button
  });
});

/**
 * Initializes the typing effect when the window is loaded.
 */
window.onload = function () {
  startTypingEffect(); // Start the typing effect for the name
};

/**
 * Initializes emailjs for sending contact form emails.
 */
emailjs.init("QhoY9h2lpG987Ab_m");

/**
 * Sends the contact form data via email when the form is submitted.
 */
document
  .getElementById("contact-form")
  .addEventListener("submit", function (e) {
    e.preventDefault();
    emailjs.sendForm("service_rpvslne", "template_dqsibul", this).then(
      function (e) {
        alert("Message sent successfully");
      },
      function (e) {
        alert("Failed to send message");
      }
    );
  });

/**
 * Prevents closing the project modal when navigating back in history.
 */
document.addEventListener("DOMContentLoaded", function () {
  $("#projectModal").on("show.bs.modal", function () {
    history.pushState(null, null, location.href); // Push current state to history
  });

  window.addEventListener("popstate", function () {
    if ($("#projectModal").hasClass("show")) {
      $("#projectModal").modal("hide"); // Hide modal if it's open
    } else {
      history.back(); // Navigate back if modal is not open
    }
  });
});

/**
 * Toggles the visibility of the robot chat interface when the hover icon is clicked.
 */
const hoverIcon = document.getElementById("hover-icon");
hoverIcon &&
  hoverIcon.addEventListener("click", function () {
    const e = document.getElementById("robot-container"),
      t = document.getElementById("robot-chat-box");
    if (e.style.display === "none") {
      e.style.display = "block"; // Show the robot chat interface
      t.style.display = "block"; // Show chat box
      // Show message bubble if there are any messages
      if (document.querySelector(".message-bubble").childElementCount > 0) {
        document.querySelector(".message-bubble").style.display = "block";
      }
    } else {
      e.style.display = "none"; // Hide the robot chat interface
      t.style.display = "none"; // Hide the chat box
      document.querySelector(".message-bubble").style.display = "none"; // Hide message bubble
    }
  });

/**
 * Handles scrolling behavior for the button that opens the robot chat box.
 */
document
  .getElementById("robot-chat-box")
  .addEventListener("click", function () {
    this.scrollTop = 0; // Scroll to the top of the chat box
  });
