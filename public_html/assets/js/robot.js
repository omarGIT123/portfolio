import * as THREE from "three";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js"; // Import DRACOLoader
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

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
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 0.7));
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
  return new Promise((t) => setTimeout(t, e));
}

async function typeMessage(e, t) {
  let n = 0;
  e.textContent = "";
  return new Promise((o) => {
    const a = setInterval(() => {
      e.textContent += t.charAt(n);
      n++;
      if (n === t.length) {
        clearInterval(a);
        o();
      }
    }, 60);
  });
}

async function getResponse(e) {
  const t = new AbortController();
  const n = setTimeout(() => {
    t.abort();
  }, 2e4);
  try {
    const o = await fetch("https://synai-p.onrender.com/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input: e }),
      signal: t.signal,
    });
    clearTimeout(n);
    if (!o.ok) throw new Error(`HTTP error! status: ${o.status}`);
    return (await o.json()).response;
  } catch (e) {
    clearTimeout(n);
    return e.name === "AbortError"
      ? [
          {
            information: "Error: The request took too long and was aborted.",
            section: "",
          },
        ]
      : [{ information: `Error: ${e.message}`, section: "" }];
  }
}

async function showGreetingBubble() {
  await delay(2000);
  document.getElementById("user-message").disabled = true;
  document.getElementById("send-message").disabled = true;
  const e = document.getElementById("message-bubble");
  const t = document.createElement("div");
  t.className = "bubble";
  t.textContent = "Ahum..ahum...";
  e.appendChild(t);
  e.style.display = "block";
  await delay(1000);
  let count_highlight = 0;
  const n =
    `Hello and welcome to Omar Bradai's portfolio! My name is SynAI-P-V2, also known as Syn, and I am the manager of this portfolio.
If you look closely at the bottom, you'll find a chat field. Feel free to ask me anything, and I'll do my best to provide the information you're looking for.
Please note that I am currently running on a free server, so don't be surprised if I stop working unexpectedly. :)
PS: If you'd like to make me disappear, just click on the floating icon at the bottom right. Click on it again when you want to ask me anything.`.split(
      /(?<=[.!?])\s+/
    );
  const o = [];
  for (let e = 0; e < n.length; e += 1) o.push(n.slice(e, e + 1).join(" "));
  for (const e of o) {
    if (count_highlight == 2) {
      highlightElements(1);
    } else if (count_highlight == 5) {
      highlightElements(2);
    }
    await typeMessage(t, e);
    count_highlight++;
    if (count_highlight >= o.length) {
      removeFocus();
    }
    await delay(500);
  }
  setTimeout(() => {
    e.removeChild(t);
    e.style.display = "none";
    document.getElementById("user-message").disabled = false;
    document.getElementById("send-message").disabled = false;
  }, 800);
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
  const e = document.getElementById("user-message").value;
  if (e.trim() !== "" && !document.getElementById("user-message").disabled) {
    const t = document.getElementById("chat-messages");
    document.getElementById("user-message").disabled = true;
    document.getElementById("send-message").disabled = true;
    const n = document.createElement("div");
    n.className = "user-message";
    n.textContent = "User: " + e + "\n";
    t.appendChild(n);
    document.getElementById("user-message").value = "";
    const o = document.getElementById("message-bubble");
    const a = document.createElement("div");
    a.className = "bubble";
    a.textContent = "Alright! Let's see...";
    o.appendChild(a);
    o.style.display = "block";

    const s = await getResponse(e);
    for (const message of s) {
      const targetSection = document.getElementById(
        message.section.toLowerCase()
      );
      if (targetSection) {
        targetSection.scrollIntoView({ behavior: "smooth", block: "start" });
        await delay(1300);
      }
      const card = document.querySelector(`[data-title="${message.card}"]`);
      if (card) card.click();

      const messageParts = message.information.split(/(?<=[.!?])\s+/);
      const messageChunks = [];
      for (let i = 0; i < messageParts.length; i += 3) {
        messageChunks.push(messageParts.slice(i, i + 3).join(" "));
      }

      for (const part of messageChunks) {
        await typeMessage(a, part);
        await delay(1000);
      }
      if (card) {
        const closeModal = document.querySelector(
          '#projectModal [data-dismiss="modal"]'
        );
        if (closeModal) closeModal.click();
      }
      await delay(1000);
    }

    setTimeout(() => {
      o.removeChild(a);
      o.style.display = "none";
      document.getElementById("user-message").disabled = false;
      document.getElementById("send-message").disabled = false;
    }, 1000);
  }
});

window.addEventListener("load", showGreetingBubble);

function highlightElements(n) {
  // Show the dark overlay initially
  document.getElementById("overlay").style.display = "block";

  // Remove 'focused' class from all elements first
  document
    .querySelectorAll(".hover-icon, .robot-chat-box")
    .forEach((el) => el.classList.remove("focused"));

  // Based on the value of 'n', add the 'focused' class to the correct element
  if (n === 1) {
    // Highlight the chat box
    document.querySelector(".robot-chat-box").classList.add("focused");
  } else if (n === 2) {
    // Highlight the icon
    document.querySelector(".hover-icon").classList.add("focused");
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
