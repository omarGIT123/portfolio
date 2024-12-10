function initMap() {
  new google.maps.Map(document.getElementById("map"), {
    center: { lat: 40.674, lng: -73.945 },
    zoom: 12,
    scrollwheel: !1,
    navigationControl: !1,
    mapTypeControl: !1,
    scaleControl: !1,
    styles: [
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
function startTypingEffect() {
  var e = "Omar Bradai",
    t = document.getElementById("typing-name"),
    o = (document.querySelector(".cursor"), 0);
  !(function l() {
    o < e.length && ((t.innerHTML += e.charAt(o)), o++, setTimeout(l, 150));
  })();
}
function closeChatBox() {
  (document.getElementById("chat-messages").style.display = "none"),
    (document.getElementById("close-m").style.display = "none"),
    (document.getElementById("open-m").style.display = "block");
}
function openChatBox() {
  (document.getElementById("chat-messages").style.display = "block"),
    (document.getElementById("open-m").style.display = "none"),
    (document.getElementById("close-m").style.display = "block");
}
$(document).ready(function () {
  $(".navbar .nav-link").on("click", function (e) {
    if ("" !== this.hash) {
      e.preventDefault();
      var t = this.hash;
      $("html, body").animate({ scrollTop: $(t).offset().top }, 700);
    }
  });
}),
  $(window).on("load", function () {
    var e = $(".portfolio-container");
    e.isotope({
      filter: ".new",
      animationOptions: { duration: 750, easing: "linear", queue: !1 },
    }),
      $(".filters a").click(function () {
        $(".filters .active").removeClass("active"), $(this).addClass("active");
        var t = $(this).attr("data-filter");
        return (
          e.isotope({
            filter: t,
            animationOptions: { duration: 750, easing: "linear", queue: !1 },
          }),
          !1
        );
      });
  }),
  $(document).ready(function () {
    $(".view-details").on("click", function () {
      var e = $(this).data("title"),
        t = $(this).attr("data-description"),
        o = $(this).data("image"),
        l = `<div class="project-modal-content">${t}</div>`;
      $("#projectModalLabel").text(e),
        $("#modalDescription").html(l),
        $("#modalMainImage").attr("src", o),
        $("#projectModal").modal("show");
    }),
      $(".filter-btn").on("click", function () {
        var e = $(this).data("filter");
        $(".project-card").each(function () {
          "all" === e
            ? $(this).show()
            : $(this).toggle($(this).data("category") === e);
        }),
          $(".filter-btn").removeClass("active"),
          $(this).addClass("active");
      });
  }),
  (window.onload = function () {
    startTypingEffect();
  }),
  document
    .getElementById("contact-form")
    .addEventListener("submit", function (e) {
      e.preventDefault(),
        emailjs.sendForm("service_rpvslne", "template_dqsibul", this).then(
          function (e) {
            alert("Message sent successfully");
          },
          function (e) {
            alert("Failed to send message");
          }
        );
    }),
  document.addEventListener("DOMContentLoaded", function () {
    $("#projectModal").on("show.bs.modal", function () {
      history.pushState(null, null, location.href);
    }),
      window.addEventListener("popstate", function () {
        $("#projectModal").hasClass("show")
          ? $("#projectModal").modal("hide")
          : history.back();
      });
  });
const hoverIcon = document.getElementById("hover-icon");
hoverIcon &&
  hoverIcon.addEventListener("click", function () {
    const e = document.getElementById("robot-container"),
      t = document.getElementById("robot-chat-box");
    "none" === e.style.display
      ? ((e.style.display = "block"),
        (t.style.display = "block"),
        document.querySelector(".message-bubble").childElementCount > 0 &&
          (document.querySelector(".message-bubble").style.display = "block"))
      : ((e.style.display = "none"),
        (t.style.display = "none"),
        (document.querySelector(".message-bubble").style.display = "none"));
  });
window.addEventListener("load", () => {
  setTimeout(() => {
    document.getElementById("loading-screen").style.display = "none"; // Hide spinner after 5 seconds
  }, 3000); // 5000 milliseconds = 5 seconds
});
emailjs.init("QhoY9h2lpG987Ab_m");
async function trackAndNotify() {
  try {
    const response = await fetch("https://api.ipify.org?format=json");
    const data = await response.json();
    const ipAddress = data.ip;
    const serviceID = "service_rpvslne"; // Replace with your service ID
    const templateID = "template_7zyznsg"; // Replace with your template ID

    const templateParams = {
      user_ip: ipAddress,
    };

    emailjs
      .send(serviceID, templateID, templateParams)
      .then((result) => {})
      .catch((error) => {});
  } catch (error) {}
}

// Call the function when the page loads
document.addEventListener("DOMContentLoaded", trackAndNotify);
