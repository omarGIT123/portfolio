import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
// Three.js setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1); // Directional light
directionalLight.position.set(10, 0, 25).normalize();
scene.add(directionalLight);

// Make the renderer's background transparent
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 0.7));
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById("container").appendChild(renderer.domElement);

// Lighting and robot loading setup (same as before)
const loader = new GLTFLoader();
let robot;
let mixer;
let count = 0;
loader.load(
  "assets/models/model.glb",
  (gltf) => {
    robot = gltf.scene;
    robot.scale.set(0.7, 0.7, 0.7);
    robot.position.set(0, 0, 0);
    scene.add(robot);

    // Log all animation clips
    if (gltf.animations.length > 0) {
      console.log("Available animations:");
      gltf.animations.forEach((clip, index) => {
        console.log(`Animation ${index + 1}: ${clip.name}`);
      });
      console.log(gltf.animations);
      mixer = new THREE.AnimationMixer(robot);

      const action = mixer.clipAction(gltf.animations[0]);
      const action2 = mixer.clipAction(gltf.animations[1]);
      action2.setLoop(THREE.LoopOnce, 0); // Play action2 once
      // action2.clampWhenFinished = true; //
      action2.reset();
      action2.play(); // Play action2
      action2.crossFadeTo(action, 8, true);
      // Play animation
      action.reset();
      action.play();
      action.setLoop(THREE.LoopRepeat, Infinity);
      // Add the onFinished callback to reverse the animation when it finishes
    } else {
      console.warn("No animations found in the model");
    }

    animate();
  },
  undefined,
  (error) => {
    console.error("Error loading model:", error);
  }
);

// Resize handling
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Move the camera back a little
camera.position.z = 6;

// Animate
function animate() {
  requestAnimationFrame(animate);

  // Make the robot look at the camera
  if (robot) {
    robot.lookAt(camera.position);
  }

  if (mixer) mixer.update(0.01); // Update animations if necessary
  renderer.render(scene, camera);
}
document.getElementById("send-message").addEventListener("click", async () => {
  const message = document.getElementById("user-message").value;

  if (
    message.trim() !== "" &&
    !document.getElementById("user-message").disabled
  ) {
    const messagesContainer = document.getElementById("chat-messages");
    document.getElementById("user-message").disabled = true;
    document.getElementById("send-message").disabled = true;
    // Create user message div
    const userMessage = document.createElement("div");
    userMessage.className = "user-message";
    userMessage.textContent = "User: " + message + "\n";
    messagesContainer.appendChild(userMessage);

    // Clear the input field after sending the message
    document.getElementById("user-message").value = "";

    // Create a placeholder message bubble for chatbot response
    const bubbleContainer = document.getElementById("message-bubble");
    const bubbleMessage = document.createElement("div");
    bubbleMessage.className = "bubble";
    bubbleMessage.textContent = "Alright! let's see humm..."; // Placeholder text
    bubbleContainer.appendChild(bubbleMessage);
    bubbleContainer.style.display = "block";

    // Simulate a response after a short delay (you can replace this with actual bot logic)
    const response = await getResponse(message);
    console.log(response);

    // Use a loop to handle each response item and await typing
    for (const item of response) {
      console.log(item);
      const section = document.getElementById(item.section.toLowerCase());

      if (section) {
        // Scroll to the section smoothly
        section.scrollIntoView({ behavior: "smooth", block: "start" });

        // Wait for the scroll to complete (you can adjust the duration based on your scroll speed)
        await delay(1300); // Delay based on scroll speed, adjust if needed
      }

      // Now find and click the card after scrolling is done
      const targetCard = document.querySelector(`[data-title="${item.card}"]`);
      if (targetCard) {
        console.log(targetCard); // Check if the card is found
        targetCard.click();
      } else {
        console.error("Card with the specified title not found");
      }

      // Split response into sentences and group them into chunks of 3
      const sentences = item.information.split(/(?<=[.!?])\s+/); // Split into sentences
      const chunks = [];
      for (let i = 0; i < sentences.length; i += 3) {
        chunks.push(sentences.slice(i, i + 3).join(" "));
      }

      // Display each chunk one at a time
      for (const chunk of chunks) {
        await typeMessage(bubbleMessage, chunk); // Update bubble with current chunk
        await delay(1000); // Wait for 3 seconds before showing the next chunk
      }

      // Handle the 'Go Back' button
      if (targetCard) {
        const goBackButton = document.querySelector(
          '#projectModal [data-dismiss="modal"]'
        );
        if (goBackButton) {
          goBackButton.click();
        } else {
          console.error("Go Back button not found");
        }
      }

      // Wait before processing the next item
      await delay(1000);
    }

    // Now execute the code after all typing is done
    setTimeout(() => {
      bubbleContainer.removeChild(bubbleMessage);
      bubbleContainer.style.display = "none";
      document.getElementById("user-message").disabled = false;
      document.getElementById("send-message").disabled = false;
    }, 1000);
  }
});

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
// Typing effect function (returns a promise)
async function typeMessage(bubbleElement, message) {
  let index = 0;
  const typingSpeed = 60; // Speed of typing (milliseconds)

  // Clear any previous content
  bubbleElement.textContent = "";

  return new Promise((resolve) => {
    const typingInterval = setInterval(() => {
      bubbleElement.textContent += message.charAt(index); // Append the character to the bubble
      index++;

      // Stop when the message is fully typed
      if (index === message.length) {
        clearInterval(typingInterval); // Clear the interval once typing is complete
        resolve(); // Resolve the promise after typing is done
      }
    }, typingSpeed); // Delay between each character
  });
}
async function getResponse(input) {
  console.log("Here");

  const TIMEOUT = 20000;

  // Create an AbortController to control the request timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort(); // Abort the request if it exceeds the timeout
  }, TIMEOUT);

  try {
    const response = await fetch("https://synai-p.onrender.com/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ input }), // Pass the input in the request body
      signal: controller.signal, // Attach the controller's signal to the fetch request
    });

    // Clear the timeout once the fetch request completes
    clearTimeout(timeoutId);

    // Check if the response is OK (status code 200-299)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Parse and return the JSON response
    const data = await response.json();
    console.log("Response:", data);
    return data.response; // Assuming `data.response` contains the desired value
  } catch (error) {
    clearTimeout(timeoutId); // Clear timeout if there's an error or the request completes
    if (error.name === "AbortError") {
      console.error("Request timed out");
      return [
        {
          information: "Error: The request took too long and was aborted.",
          section: "",
        },
      ]; // Custom message for timeout
    }
    console.error("Failed to fetch data:", error);
    return [{ information: `Error: ${error.message}`, section: "" }]; // Return the error message if any other error occurs
  }
}

async function showGreetingBubble() {
  document.getElementById("user-message").disabled = true;
  document.getElementById("send-message").disabled = true;
  // Create a placeholder message bubble for chatbot response
  const bubbleContainer = document.getElementById("message-bubble");
  const bubbleMessage = document.createElement("div");
  bubbleMessage.className = "bubble";
  bubbleMessage.textContent = "Hello! Hello!"; // Placeholder text
  bubbleContainer.appendChild(bubbleMessage);
  bubbleContainer.style.display = "block";
  delay(400);
  const greeting = `Hello and welcome to Omar Bradai's portfolio! My name is SynAI-P-V2, also known as Syn, and I am the manager of this portfolio.
If you look closely at the bottom, you'll find a chat field. Feel free to ask me anything, and I'll do my best to provide the information you're looking for.
Please note that I am currently running on a free server, so don't be surprised if I stop working unexpectedly. :)
PS: If you'd like to make me disappear, just click the floating icon at the bottom right. Click it again when you want to ask me anything.`;

  // Split response into sentences and group them into chunks of 3
  const sentences = greeting.split(/(?<=[.!?])\s+/); // Split into sentences
  const chunks = [];
  for (let i = 0; i < sentences.length; i += 3) {
    chunks.push(sentences.slice(i, i + 3).join(" "));
  }

  // Display each chunk one at a time
  for (const chunk of chunks) {
    await typeMessage(bubbleMessage, chunk); // Update bubble with current chunk
    await delay(1000); // Wait for 3 seconds before showing the next chunk
  }
  setTimeout(() => {
    bubbleContainer.removeChild(bubbleMessage);
    bubbleContainer.style.display = "none";
    document.getElementById("user-message").disabled = false;
    document.getElementById("send-message").disabled = false;
  }, 800);
}
// Run the function when the page loads
window.addEventListener("load", showGreetingBubble);
