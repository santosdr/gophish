let currentScenarioIndex = 0;
let scenarios = [];
let endings = {};

const initialResources = {
  privacy: 50,
  security: 50,
  reputation: 50,
  finance: 50
};

// Load scenarios and endings data
Promise.all([
  fetch('scenarios.json').then(res => res.json()),
  fetch('endings.json').then(res => res.json())
])
  .then(([scenariosData, endingsData]) => {
    scenarios = scenariosData;
    endings = endingsData;
    initializeGame();
  })
  .catch(error => {
    console.error("Error loading data:", error);
    gameOver("An error occurred while loading the game.");
  });

function initializeGame() {
  for (const resource in initialResources) {
    document.getElementById(resource).textContent = initialResources[resource];
  }

  // Event listeners are added only once here
  document.getElementById('swipe-left').addEventListener('click', () => handleSwipe('left'));
  document.getElementById('swipe-right').addEventListener('click', () => handleSwipe('right'));

  displayScenario();
}

function displayScenario() {
  if (currentScenarioIndex < scenarios.length) {
    const scenario = scenarios[currentScenarioIndex];
    document.getElementById('scenario-text').textContent = scenario.text;
    document.getElementById('swipe-left').textContent = scenario.left.choice;
    document.getElementById('swipe-right').textContent = scenario.right.choice;
    document.getElementById('count').textContent = currentScenarioIndex + 1;

    document.getElementById('swipe-left').style.display = 'inline-block';
    document.getElementById('swipe-right').style.display = 'inline-block';
  } 
}

function handleSwipe(direction) {
  if (currentScenarioIndex >= scenarios.length) {
    return; 
  }

  const scenario = scenarios[currentScenarioIndex];
  const choice = scenario[direction];

  for (const resource in choice) {
    if (initialResources.hasOwnProperty(resource)) {
      let currentVal = parseInt(document.getElementById(resource).textContent);
      currentVal += choice[resource];
      document.getElementById(resource).textContent = Math.max(0, Math.min(100, currentVal));
    }
  }

  displayConsequence(choice.consequence); 

  if (gameOver()) {
    // Game over message is displayed within gameOver()
  } else {
    currentScenarioIndex++;
    displayScenario();
  }
}

function gameOver(message = "") {
  if (message === "") {
    const endingKey = determineEnding();
    const ending = endings[endingKey];
    message = `${ending.title}\n${ending.message}`;
  }

  document.getElementById('scenario-text').textContent = message;

  // Hide swipe buttons in all game over scenarios
  document.getElementById('swipe-left').style.display = 'none';
  document.getElementById('swipe-right').style.display = 'none';
}

function determineEnding() {
  const resources = {
    privacy: parseInt(document.getElementById('privacy').textContent),
    security: parseInt(document.getElementById('security').textContent),
    reputation: parseInt(document.getElementById('reputation').textContent),
    finance: parseInt(document.getElementById('finance').textContent)
  };

  for (const resource in resources) {
    if (resources[resource] <= 0 || resources[resource] >= 100) {
      return (resources[resource] <= 0) ? `low${resource.charAt(0).toUpperCase() + resource.slice(1)}` : `high${resource.charAt(0).toUpperCase() + resource.slice(1)}`;
    }
  }

  return "balanced"; // Default to balanced ending if all scenarios are played
}

function displayConsequence(consequence) {
  document.getElementById("consequence-card").textContent = consequence;
  document.getElementById("consequence-card").style.display = "block";
}

document.getElementById("consequence-card").addEventListener("click", function() {
  document.getElementById("consequence-card").style.display = "none";
})
