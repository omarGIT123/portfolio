import * as THREE from "three";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js"; // Import DRACOLoader for model compression handling
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js"; // Import GLTFLoader to load 3D models in GLTF format

// Create a new scene for the 3D environment
const scene = new THREE.Scene();

// Create and configure a perspective camera
const camera = new THREE.PerspectiveCamera(
  75, // Field of view
  window.innerWidth / window.innerHeight, // Aspect ratio based on the window size
  0.1, // Near clipping plane
  1e3 // Far clipping plane
);

// Add a directional light to the scene
const directionalLight = new THREE.DirectionalLight(16777215, 1); // Light color (white) and intensity
directionalLight.position.set(10, 0, 25).normalize(); // Position and normalize the light
scene.add(directionalLight);

// Set up the WebGL renderer with anti-aliasing and transparency enabled
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 0.7)); // Set pixel ratio for better performance on high-DPI displays
renderer.setSize(window.innerWidth, window.innerHeight); // Set renderer size to window dimensions
document.getElementById("container").appendChild(renderer.domElement); // Append renderer's canvas to the DOM container

// Initialize DRACOLoader for Draco compression support
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("./assets/draco/"); // Specify the path to the Draco decoder files

// Initialize GLTFLoader and set the DracoLoader for compressed models
const loader = new GLTFLoader();
loader.setDRACOLoader(dracoLoader); // Attach Draco loader to GLTFLoader

let robot,
  mixer,
  count = 0; // Variables to store the 3D model, animation mixer, and a count for animation cycles

// Animation loop function
function animate() {
  requestAnimationFrame(animate); // Request the next frame for continuous rendering
  if (robot) robot.lookAt(camera.position); // Make the robot look at the camera position
  if (mixer) mixer.update(0.01); // Update the animation mixer
  renderer.render(scene, camera); // Render the scene from the camera's perspective
}

// Delay function that returns a promise for a set timeout
function delay(e) {
  return new Promise((t) => setTimeout(t, e)); // Resolve after specified delay
}

// Function to type out a message one character at a time
async function typeMessage(e, t) {
  let n = 0;
  e.textContent = ""; // Clear existing text
  return new Promise((o) => {
    const a = setInterval(() => {
      e.textContent += t.charAt(n); // Add one character at a time
      n++;
      if (n === t.length) {
        clearInterval(a); // Stop once the full message is typed
        o(); // Resolve the promise
      }
    }, 60); // Typing speed (milliseconds per character)
  });
}

// Function to fetch a response from a remote server
async function getResponse(e) {
  const t = new AbortController(); // Controller for aborting the fetch request
  const n = setTimeout(() => {
    t.abort(); // Abort after 20 seconds if the request is not completed
  }, 2e4);

  try {
    const o = await fetch("https://synai-p.onrender.com/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input: e }), // Send the user input as JSON
      signal: t.signal, // Attach the abort signal to the fetch request
    });
    clearTimeout(n); // Clear the timeout if the request is successful
    if (!o.ok) throw new Error(`HTTP error! status: ${o.status}`);
    return (await o.json()).response; // Return the response from the server
  } catch (e) {
    clearTimeout(n); // Clear the timeout on error
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

// Function to show a greeting bubble in the chat interface
async function showGreetingBubble() {
  document.getElementById("user-message").disabled = true;
  document.getElementById("send-message").disabled = true;
  const e = document.getElementById("message-bubble");
  const t = document.createElement("div");
  t.className = "bubble";
  t.textContent = "Hello! Hello!"; // Display a greeting
  e.appendChild(t);
  e.style.display = "block"; // Make the bubble visible
  await delay(400);

  // Split the greeting message into chunks for gradual display
  const n =
    `Hello and welcome to Omar Bradai's portfolio! My name is SynAI-P-V2, also known as Syn, and I am the manager of this portfolio.
If you look closely at the bottom, you'll find a chat field. Feel free to ask me anything, and I'll do my best to provide the information you're looking for.
Please note that I am currently running on a free server, so don't be surprised if I stop working unexpectedly. :)
PS: If you'd like to make me disappear, just click the floating icon at the bottom right. Click it again when you want to ask me anything.`.split(
      /(?<=[.!?])\s+/ // Split by sentence-ending punctuation followed by a space
    );
  const o = [];
  for (let e = 0; e < n.length; e += 3) o.push(n.slice(e, e + 3).join(" ")); // Group the sentences into smaller chunks
  for (const e of o) {
    await typeMessage(t, e); // Gradually type out each chunk
    await delay(1000); // Wait before displaying the next chunk
  }
  setTimeout(() => {
    e.removeChild(t); // Remove the greeting bubble after the message is shown
    e.style.display = "none";
    document.getElementById("user-message").disabled = false; // Re-enable the user input field
    document.getElementById("send-message").disabled = false; // Re-enable the send button
  }, 800);
}

// Load the Draco-compressed 3D model
loader.load(
  "assets/models/model.glb",
  (gltf) => {
    if (gltf.scene) {
      robot = gltf.scene; // Store the loaded 3D model
      robot.scale.set(0.7, 0.7, 0.7); // Scale the model
      robot.position.set(0, 0, 0); // Set model's position in the scene
      scene.add(robot); // Add the model to the scene

      if (gltf.animations.length > 0) {
        gltf.animations.forEach((animation, index) => {
          // Process animations if any are available
        });
        mixer = new THREE.AnimationMixer(robot); // Create an animation mixer for the model
        const action1 = mixer.clipAction(gltf.animations[0]); // First animation action
        const action2 = mixer.clipAction(gltf.animations[1]); // Second animation action

        action2.setLoop(THREE.LoopOnce, 0); // Set loop type for second animation
        action2.reset(); // Reset second animation to initial state
        action2.play(); // Play second animation
        action2.crossFadeTo(action1, 8, true); // Crossfade between animations

        action1.reset(); // Reset first animation to initial state
        action1.play(); // Play first animation continuously
        action1.setLoop(THREE.LoopRepeat, Infinity); // Loop first animation indefinitely
      }
    }
    animate(); // Start the animation loop
  },
  undefined,
  (error) => {
    console.error("Error loading model:", error); // Log an error if the model fails to load
  }
);

// Handle window resizing by adjusting the camera and renderer
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight; // Adjust the aspect ratio
  camera.updateProjectionMatrix(); // Update the camera's projection matrix
  renderer.setSize(window.innerWidth, window.innerHeight); // Adjust the renderer size
});

// Set initial camera position
camera.position.z = 6;

// Event listener for sending a message in the chat
document.getElementById("send-message").addEventListener("click", async () => {
  const e = document.getElementById("user-message").value; // Get user input
  if (e.trim() !== "" && !document.getElementById("user-message").disabled) {
    const t = document.getElementById("chat-messages");
    document.getElementById("user-message").disabled = true;
    document.getElementById("send-message").disabled = true;
    const n = document.createElement("div");
    n.className = "user-message";
    n.textContent = "User: " + e + "\n"; // Display the user's message
    t.appendChild(n);
    document.getElementById("user-message").value = ""; // Clear the input field
    t.scrollTop = t.scrollHeight; // Scroll to the bottom of the chat

    // Fetch response from the server
    const o = await getResponse(e);
    const a = document.createElement("div");
    a.className = "bubble";
    a.textContent = o[0].information;
    t.appendChild(a); // Display the response in the chat
    t.scrollTop = t.scrollHeight; // Scroll to the bottom of the chat
    document.getElementById("user-message").disabled = false; // Re-enable the input field
    document.getElementById("send-message").disabled = false; // Re-enable the send button
  }
});

// Display the greeting bubble when the page loads
showGreetingBubble();
