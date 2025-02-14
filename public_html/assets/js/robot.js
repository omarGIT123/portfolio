import * as THREE from "three";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js"; // Import DRACOLoader
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
let isStopped = false;
let firstVisit = false;
let callCount = 0;
let delayController;
let activeTimeout = null;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1e3
);
const directionalLight = new THREE.DirectionalLight(16777215, 1);
directionalLight.position.set(10, 0, 25).normalize();
scene.add(directionalLight);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1));
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById("container").appendChild(renderer.domElement);

// Set up DracoLoader
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("./assets/draco/"); // Set the path to Draco decoder files

// Initialize GLTFLoader and set DracoLoader
const loader = new GLTFLoader();
loader.setDRACOLoader(dracoLoader); // Attach Draco loader to GLTFLoader

let robot,
  mixer,
  count = 0;

function animate() {
  requestAnimationFrame(animate);
  if (robot) robot.lookAt(camera.position);
  if (mixer) mixer.update(0.01);
  renderer.render(scene, camera);
}

function delay(e) {
  // console.log("started delay");
  return new Promise((resolve, reject) => {
    const interval = setInterval(() => {
      if (isStopped) {
        clearInterval(interval);
        // console.log("blocked delay"); // Clear the interval to stop the delay
        reject("Stopped"); // Reject with an appropriate message
      } else {
        clearInterval(interval);
        // console.log("ended delay");
        resolve(); // Resolve the promise if not stopped
      }
    }, e);
  });
}
async function typeMessage_greet(e, t) {
  let n = 0;
  e.innerHTML = "";
  return new Promise((o) => {
    if (firstVisit) return;
    const a = setInterval(() => {
      if (firstVisit) return;
      e.innerHTML += t.charAt(n);
      n++;
      if (n === t.length) {
        clearInterval(a);
        o();
      }
    }, 60);
  });
}
let isTyping = false;
async function typeMessage(e, t) {
  isTyping = true;
  let n = 0;
  e.innerHTML = "";
  // console.log("started typing");
  return new Promise((resolve) => {
    // Check immediately if stopped before starting
    if (isStopped) {
      // console.log("stopped typing");
      e.innerHTML = "";
      isTyping = false; // Reset typing state
      resolve(); // Resolve the promise
      return;
    }

    const intervalId = setInterval(() => {
      if (isStopped) {
        // console.log("stopped typing");
        e.innerHTML = ""; // Clear the message
        clearInterval(intervalId); // Stop the interval
        isTyping = false; // Reset typing state
        resolve(); // Resolve the promise early
        return;
      }

      e.innerHTML += t.charAt(n);
      n++;

      if (n === t.length) {
        // console.log("ended typing");
        clearInterval(intervalId); // Stop the interval when done
        isTyping = false; // Reset typing state
        resolve(); // Resolve the promise normally
      }
    }, 60);
  });
}

async function getResponse(e) {
  const t = new AbortController();
  const signal = t.signal;
  const n = setTimeout(() => {
    t.abort();
  }, 2e4);
  try {
    const o = await fetch("https://api.omarbradai.tn", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input: e }),
      signal: signal,
    });
    clearTimeout(n);
    if (!o.ok) throw new Error(`HTTP error! status: ${o.status}`);
    return (await o.json()).response;
  } catch (e) {
    clearTimeout(n);
    console.log(e.message);
    return e.name === "AbortError"
      ? [
          {
            information:
              "Told ya! Sadly the server might be getting slow due to inactivity 😴. It might take a few tries to get it back up. \n 😢 I apologize for the inconvenience.",
            section: "",
          },
        ]
      : [
          {
            information: `😡 An exception has occurred. Please try again! You might be asking multiple questions in a short period—please slow down!`,
            section: "",
          },
        ];
  }
}
async function showGreetingBubble() {
  document.getElementById("suggestions-btn").disabled = true;
  document.getElementById("user-message").disabled = true;
  document.getElementById("send-message").disabled = true;
  document.getElementById("stop-message").disabled = false;
  document.getElementById("stop-message").style.display = "block";
  document.getElementById("send-message").style.display = "none";
  if (firstVisit) return;
  await delay(4000);
  if (firstVisit) return;
  const e = document.getElementById("message-bubble");
  const t = document.createElement("div");
  t.className = "bubble";
  t.innerHTML = "🎤 Ahum..ahum...";
  e.appendChild(t);
  e.style.display = "block";
  if (firstVisit) return;
  await delay(1000);
  if (firstVisit) return;
  let count_highlight = 0;
  const n =
    `👋 Hello and welcome to Omar Bradai's portfolio! My name is SynAI-P-V2, also known as Syn, and I am the manager of this portfolio.
If you look closely at the bottom, you'll find a chat field. Feel free to ask me anything, and I'll do my best to provide the information you're looking for 🤝.
Please note that I am currently running on a free server, so don't be surprised if I stop working unexpectedly 😅. 
PS: If you'd like to make me disappear 🤔, just click on the floating icon at the bottom right. Click on it again when you want to ask me anything.`.split(
      /(?<=[.!?])\s+/
    );
  const o = [];
  for (let e = 0; e < n.length; e += 1) {
    if (firstVisit) return;
    o.push(n.slice(e, e + 1).join(" "));
  }
  for (const e of o) {
    // console.log(count_highlight);
    if (firstVisit) return;
    if (count_highlight == 2) {
      // console.log("still here");
      highlightElements(1);
    } else if (count_highlight == 5) {
      highlightElements(2);
    }
    await typeMessage_greet(t, e);
    count_highlight++;
    if (count_highlight >= o.length) {
      removeFocus();
    }
    if (firstVisit) return;
    await delay(500);
    if (firstVisit) return;
  }
  if (!firstVisit) {
    setTimeout(() => {
      if (firstVisit) return;
      e.removeChild(t);
      e.style.display = "none";
      document.getElementById("user-message").disabled = false;
      document.getElementById("send-message").disabled = false;
      document.getElementById("stop-message").disabled = true;
      document.getElementById("suggestions-btn").disabled = false;
      document.getElementById("stop-message").style.display = "none";
      document.getElementById("send-message").style.display = "block";
      firstVisit = false;
    }, 800);
  }
}

// Load the Draco-compressed model
loader.load(
  "assets/models/model.glb",
  (gltf) => {
    if (gltf.scene) {
      robot = gltf.scene;
      robot.scale.set(0.7, 0.7, 0.7);
      robot.position.set(0, 0, 0);
      scene.add(robot);

      if (gltf.animations.length > 0) {
        gltf.animations.forEach((animation, index) => {
          // Handle animations if any
        });
        mixer = new THREE.AnimationMixer(robot);
        const action1 = mixer.clipAction(gltf.animations[0]);
        const action2 = mixer.clipAction(gltf.animations[1]);

        action2.setLoop(THREE.LoopOnce, 0);
        action2.reset();
        action2.play();
        action2.crossFadeTo(action1, 8, true);

        action1.reset();
        action1.play();
        action1.setLoop(THREE.LoopRepeat, Infinity);
      }
    }
    animate();
  },
  undefined,
  (error) => {
    console.error("Error loading model:", error);
  }
);

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

camera.position.z = 6;
// Send message logic (for the chat)
document.getElementById("send-message").addEventListener("click", async () => {
  isStopped = false;
  callCount++;
  if (activeTimeout) {
    // console.log("Time out cleared !");
    clearTimeout(activeTimeout);
    activeTimeout = null; // Reset the variable
  }
  try {
    const bubble = document.getElementById("message-bubble");
    if (bubble) {
      bubble.style.display = "none"; // Hide the bubble
      bubble.innerHTML = ""; // Clear all child elements
    }
    const e = document.getElementById("user-message").value;
    if (e.trim() !== "" && !document.getElementById("user-message").disabled) {
      const t = document.getElementById("chat-messages");
      document.getElementById("user-message").disabled = true;
      document.getElementById("send-message").disabled = true;
      document.getElementById("suggestions-btn").disabled = true;
      document.getElementById("send-message").style.display = "none";
      document.getElementById("stop-message").style.display = "block";
      const n = document.createElement("div");
      n.className = "user-message";
      n.innerHTML = `• ${e}<br>`;
      t.appendChild(n);
      document.getElementById("user-message").value = "";
      const o = document.getElementById("message-bubble");
      const a = document.createElement("div");
      a.className = "bubble";
      a.innerHTML = "Alright! Let's see... 😊 🔍";
      o.appendChild(a);
      o.style.display = "block";

      const s = await getResponse(e);
      document.getElementById("stop-message").disabled = false;
      try {
        for (const message of s) {
          const targetSection = document.getElementById(
            message.section.toLowerCase()
          );
          if (targetSection) {
            targetSection.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
            if (!isStopped) await delay(1300);
          }
          const card = document.querySelector(`[data-title="${message.card}"]`);
          if (card && !isStopped) card.click();

          const messageParts = message.information.split(/(?<=[.!?])\s+/);
          const messageChunks = [];
          for (let i = 0; i < messageParts.length; i += 2) {
            messageChunks.push(messageParts.slice(i, i + 2).join(" "));
          }

          for (const part of messageChunks) {
            if (!isStopped) await typeMessage(a, part);
            if (!isStopped) await delay(500);
          }
          if (card) {
            const closeModal = document.querySelector(
              '#projectModal [data-dismiss="modal"]'
            );
            if (closeModal) closeModal.click();
          }
          if (!isStopped) await delay(1000);
        }
      } catch (e) {
        await typeMessage(
          a,
          "The API is spun down due to inactivity. It might take a few tries to get it back up. \n :( I apologize for the inconvenience."
        );
      }
      if (!isStopped && callCount == 1) {
        if (a && o.contains(a)) {
          o.removeChild(a);
        }
        o.style.display = "none";
        callCount = 0;
        document.getElementById("user-message").disabled = false;
        document.getElementById("send-message").disabled = false;
        document.getElementById("suggestions-btn").disabled = false;
        document.getElementById("stop-message").disabled = true;
        document.getElementById("send-message").style.display = "block";
        document.getElementById("stop-message").style.display = "none";
      }
    }
  } catch (e) {
    console.log(e);
  }
});

if (!firstVisit) showGreetingBubble();

function highlightElements(n) {
  // Show the dark overlay initially
  document.getElementById("overlay").style.display = "block";
  // Remove 'focused' class from all elements first
  document
    .querySelectorAll(".hover-icon, .robot-chat-box")
    .forEach((el) => el.classList.remove("focused"));
  if (firstVisit) return;
  // Based on the value of 'n', add the 'focused' class to the correct element
  if (n === 1) {
    // Highlight the chat box
    document.querySelector(".robot-chat-box").classList.add("focused");
    if (firstVisit) {
      removeFocus();
    }
  } else if (n === 2) {
    // Highlight the icon
    document.querySelector(".hover-icon").classList.add("focused");
    if (firstVisit) {
      removeFocus();
    }
  }
}

// Function to remove focus
function removeFocus() {
  // Remove 'focused' class from all elements
  document
    .querySelectorAll(".hover-icon, .robot-chat-box")
    .forEach((el) => el.classList.remove("focused"));

  // Optionally hide the overlay as well
  document.getElementById("overlay").style.display = "none";
}
// Show/hide suggestions list
document.getElementById("suggestions-btn").addEventListener("click", () => {
  const suggestionsList = document.getElementById("suggestions-list");
  // Toggle visibility of the suggestions list
  suggestionsList.style.display =
    suggestionsList.style.display === "none" ||
    suggestionsList.style.display === ""
      ? "block"
      : "none";
});

// Handle clicking a suggestion item
document.querySelectorAll(".suggestion-item").forEach((item) => {
  item.addEventListener("click", () => {
    const userMessageInput = document.getElementById("user-message");
    const selectedMessage = item.getAttribute("data-suggestion");

    // Populate the input with the clicked suggestion
    userMessageInput.value = selectedMessage;

    // Hide the suggestions list
    document.getElementById("suggestions-list").style.display = "none";
  });
});

// Optional: Close suggestions if user clicks outside
document.addEventListener("click", (e) => {
  if (
    !e.target.closest("#suggestions-btn") &&
    !e.target.closest("#suggestions-list")
  ) {
    document.getElementById("suggestions-list").style.display = "none";
  }
});

document.getElementById("stop-message").addEventListener("click", stopTalking);
function stopTalking() {
  if ($("#projectModal").hasClass("show")) {
    const closeModal = document.querySelector(
      '#projectModal [data-dismiss="modal"]'
    );
    if (closeModal) closeModal.click();
  }
  isStopped = true;
  firstVisit = true;
  const bubble = document.getElementById("message-bubble");
  if (bubble) {
    bubble.style.display = "none"; // Hide the bubble
    bubble.innerHTML = ""; // Clear all child elements
  }
  document.getElementById("user-message").disabled = false;
  document.getElementById("stop-message").disabled = true;
  document.getElementById("loading-button").style.display = "block";
  waitFetch();
  document.getElementById("suggestions-btn").disabled = false;
  document.getElementById("stop-message").style.display = "none";

  if (document.getElementById("overlay")) {
    removeFocus();
  }

  callCount = 0;
}
async function waitFetch() {
  return new Promise((resolve, reject) => {
    const interval = setInterval(() => {
      clearInterval(interval);
      resolve();
      document.getElementById("send-message").disabled = false;
      document.getElementById("send-message").style.display = "block";
      document.getElementById("loading-button").style.display = "none"; // Resolve the promise if not stopped
    }, 2000);
  });
}
