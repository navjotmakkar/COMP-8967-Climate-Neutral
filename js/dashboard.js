import { firebaseConfig } from "./constants.js";

// Initialize Firebase
const firebaseApp = firebase.initializeApp(firebaseConfig);
const userEmail = document.getElementById("user-email");
const logoutBtn = document.getElementById("user-logout");
const modalBtn = document.querySelector(".js-modal-btn");
const modal = document.querySelector(".js-modal");
const closeBtn = document.querySelector(".js-close");
const categoryForm = document.querySelector(".js-category-creation-form");
const addScenario = document.querySelector(".js-modal-add-scenario-btn");
const addScenarioModel = document.querySelector(".js-add-scenario-modal");
const addScenarioModelClose = document.querySelector(".js-add-scenario-close");
const addScenarioForm = document.querySelector(".js-add-scenario-form");
const jsAddScenarioFormContainer = document.querySelector(
  ".js-add-scenario-form-container"
);
const jsAddScenarioSubmitBtn = document.querySelector(
  ".js-add-scenario-submit-btn"
);
const modmaBtn = document.querySelector(".js-modma-btn");
const resultsInsights = document.querySelector(".js-results-insights");
const bestCaseScenario = document.querySelector(".js-best-case-scenario > pre");
const worstCaseScenario = document.querySelector(
  ".js-worst-case-scenario > pre"
);

const scale = {
  low: 1,
  belowAverage: 2,
  average: 3,
  good: 4,
  excellent: 5,
};

// normalization

// benificial = divide all the values by maximum possible value (value / max)
// non_benificial = minimum value will be found and divide it by each value  (min / value)

// Assign weight
// -> considering the same weight for all the columns
// normalized value * weight (0.25 i.e 25% for 4 categories)

// Performance score
// sum of all columns for each row

// Allocate Rank based on score

firebaseApp.auth().onAuthStateChanged((user) => {
  if (user) {
    // User is signed in, see docs for a list of available properties
    // https://firebase.google.com/docs/reference/js/auth.user
    const uid = user.uid;
    userEmail.textContent = user.email;
    console.log(user);
  } else {
    window.location.href = window.location.origin + "/index.html";
  }
});

const handleLogout = () => {
  firebase
    .auth()
    .signOut()
    .then(() => {
      window.location.href = window.location.origin + "/index.html";
    })
    .catch((error) => {
      alert("Error while logging out!");
    });
};

logoutBtn.addEventListener("click", handleLogout);

function updateAllCategories() {
  let categories = JSON.parse(localStorage.getItem("categories")) || []; // Parse categories from localStorage

  const allCategoriesContainer = document.querySelector(".js-all-categories");
  const noCategories =
    allCategoriesContainer.querySelector(".js-no-categories");
  if (categories.length) {
    noCategories && noCategories.classList.add("hidden");
    // Construct HTML for category tabs using map and join
    const categoryTabsHTML = categories
      .map((category) => {
        return `<label class="category-tab">${category.categoryName}</label>`;
      })
      .join("");

    // Set the innerHTML of the container with the generated HTML
    allCategoriesContainer.innerHTML = categoryTabsHTML;
  } else {
    if (noCategories && noCategories.classList.contains("hidden")) {
      noCategories.classList.remove("hidden");
    }
  }
}

modalBtn.addEventListener("click", () => {
  modal.style.display = "block";
});

addScenario.addEventListener("click", () => {
  jsAddScenarioFormContainer.innerHTML = "";
  addScenarioModel.style.display = "block";

  const categories = JSON.parse(localStorage.getItem("categories")) || [];
  categories.forEach((category) => {
    const categoryElement = document.createElement("div");
    categoryElement.className = "form-element";

    const label = document.createElement("label");
    label.className = "js-label";
    label.textContent = `${category.categoryName}`;
    categoryElement.appendChild(label);

    const inputField = document.createElement("input");
    if (category.evaluationType == "numerical") {
      inputField.type = "number";
      inputField.className = "js-input";
      inputField.id = `js-${category.categoryName.replace(/\s/g, "")}`; // Remove spaces from category name for ID
      inputField.required = true;
      categoryElement.appendChild(inputField);
    } else {
      const selectField = document.createElement("select");
      // selectField.type = "select";
      selectField.className = "js-input";
      selectField.id = `js-${category.categoryName.replace(/\s/g, "")}`; // Remove spaces from category name for ID
      selectField.required = true;
      // Options for descriptive input
      const highOption = document.createElement("option");
      highOption.value = "3";
      highOption.textContent = "High";
      selectField.appendChild(highOption);

      const mediumOption = document.createElement("option");
      mediumOption.value = "2";
      mediumOption.textContent = "Medium";
      selectField.appendChild(mediumOption);

      const lowOption = document.createElement("option");
      lowOption.value = "1";
      lowOption.textContent = "Low";
      selectField.appendChild(lowOption);
      categoryElement.appendChild(selectField);
    }

    jsAddScenarioFormContainer.appendChild(categoryElement);
  });
});

closeBtn.addEventListener("click", () => {
  modal.style.display = "none";
});
addScenarioModelClose.addEventListener("click", () => {
  addScenarioModel.style.display = "none";
});

window.addEventListener("click", (event) => {
  if (event.target === modal) {
    modal.style.display = "none";
  }
  if (event.target === addScenarioModel) {
    addScenarioModel.style.display = "none";
  }
});

categoryForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const categoryName = document.getElementById("categoryName").value;
  const categoryWeight = parseFloat(
    document.getElementById("categoryWeight").value
  );
  const categoryDirection = document.getElementById("categoryDirection").value;
  const evaluationType = document.getElementById("evaluationType").value;
  let categories = JSON.parse(localStorage.getItem("categories")) || [];
  categories = [
    ...categories,
    {
      categoryName: categoryName,
      categoryWeight: categoryWeight,
      categoryDirection: categoryDirection,
      evaluationType: evaluationType,
    },
  ];
  localStorage.setItem("categories", JSON.stringify(categories));
  // Close the modal after processing the input
  modal.style.display = "none";

  updateAllCategories();
});

function populateTable() {
  const tableBody = document.querySelector(".js-table-body");
  tableBody.innerHTML = "";
  // Retrieve categories and scenarios from localStorage
  const categories = [...JSON.parse(localStorage.getItem("categories"))] || [];
  const scenarios = JSON.parse(localStorage.getItem("scenarios")) || [];

  // Create the header row with scenario names as columns
  const headerRow = document.createElement("tr");
  headerRow.innerHTML = "<th>Category</th>";
  categories.forEach((category) => {
    headerRow.innerHTML += `<th>${category.categoryName}</th>`;
  });
  tableBody.appendChild(headerRow);

  // Iterate through categories and populate the table dynamically
  scenarios.forEach((scenario) => {
    const row = document.createElement("tr");
    row.innerHTML = `<td>${scenario.scenarioName}</td>`;

    // Populate category data for each scenario

    categories.forEach((category) => {
      row.innerHTML += `<td>${scenario[category.categoryName]}</td>`;
    });

    tableBody.appendChild(row);
  });
}

function plotGraph(categories, results) {
  const piChart = document.querySelector(".js-wight-distribution");
  const barChart = document.querySelector(".js-performance-score");

  const piData = [
    {
      values: categories.map((c) => c.categoryWeight),
      labels: categories.map((c) => c.categoryName),
      type: "pie",
    },
  ];

  const piLayout = {
    height: 500,
    width: 500,
  };

  const barData = [
    {
      x: results.map((r) => r.scenarioName),
      y: results.map((r) => r.performanceScore),
      type: "bar",
    },
  ];

  window.Plotly.newPlot(barChart, barData, piLayout);
  window.Plotly.newPlot(piChart, piData, piLayout);
}

function populateResults() {
  const rankingTable = document.querySelector(".js-ranking-table");
  const tableBody = rankingTable.querySelector(".js-table-body");
  tableBody.innerHTML = "";

  // Retrieve categories and scenarios from localStorage
  const categories = [...JSON.parse(localStorage.getItem("categories"))] || [];
  let results = JSON.parse(localStorage.getItem("rankingTable"));
  const scenarios = JSON.parse(localStorage.getItem("scenarios")) || [];

  results = results.map((result) => {
    const scenario = scenarios.find(
      (s) => s.scenarioName == result.scenarioName
    );
    return { ...result, ...scenario };
  });

  // Sort in descending order
  results.sort((a, b) => b.performanceScore - a.performanceScore);
  localStorage.setItem("rankingTable", JSON.stringify(results));

  // Create the header row with scenario names as columns
  const headerRow = document.createElement("tr");
  headerRow.innerHTML = "<th>Category</th>";
  categories.forEach((category) => {
    headerRow.innerHTML += `<th>${category.categoryName}</th>`;
  });
  tableBody.appendChild(headerRow);

  // Iterate through categories and populate the table dynamically
  results.forEach((scenario) => {
    const row = document.createElement("tr");
    row.innerHTML = `<td>${scenario.scenarioName}</td>`;

    // Populate category data for each scenario

    categories.forEach((category) => {
      row.innerHTML += `<td>${scenario[category.categoryName]}</td>`;
    });

    tableBody.appendChild(row);
  });
  if (results.length >= 2) {
    resultsInsights.classList.remove("hidden");
    bestCaseScenario.textContent = JSON.stringify(results[0], undefined, 2);
    worstCaseScenario.textContent = JSON.stringify(
      results[results.length - 1],
      undefined,
      2
    );
  }

  plotGraph(categories, results);
}

addScenarioForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const scenarios = JSON.parse(localStorage.getItem("scenarios")) || [];
  const temp = {};
  const scenarioName = addScenarioForm.querySelector("#scenarioName");
  const formElement =
    jsAddScenarioFormContainer.querySelectorAll(".form-element");
  temp["scenarioName"] = scenarioName.value;
  formElement.forEach((element) => {
    const label = element.querySelector("label");
    const input = element.querySelector("input, select");
    temp[label.textContent] = input.value;
  });

  localStorage.setItem("scenarios", JSON.stringify([...scenarios, temp]));
  populateTable();
});

function calculateMODMA() {
  const categories = JSON.parse(localStorage.getItem("categories")) || [];
  const scenarios = JSON.parse(localStorage.getItem("scenarios")) || [];

  // Find maximum and minimum values for normalization
  const maxValues = {};
  const minValues = {};
  categories.forEach((category) => {
    maxValues[category.categoryName] = Math.max(
      ...scenarios.map((scenario) =>
        parseFloat(scenario[category.categoryName])
      )
    );
    minValues[category.categoryName] = Math.min(
      ...scenarios.map((scenario) =>
        parseFloat(scenario[category.categoryName])
      )
    );
  });
  // Normalize and calculate performance scores
  const normalizedScenarios = scenarios.map((scenario) => {
    const normalizedScenario = {
      scenarioName: scenario.scenarioName,
      performanceScore: 0,
    };
    categories.forEach((category) => {
      const value = parseFloat(scenario[category.categoryName]);
      if (category.categoryDirection === "positive") {
        normalizedScenario[category.categoryName] =
          value / maxValues[category.categoryName];
      } else if (category.categoryDirection === "negative") {
        normalizedScenario[category.categoryName] =
          minValues[category.categoryName] / value;
      }

      // Assign weight and calculate performance score
      normalizedScenario.performanceScore +=
        normalizedScenario[category.categoryName] * category.categoryWeight;
    });
    return normalizedScenario;
  });

  localStorage.setItem("rankingTable", JSON.stringify(normalizedScenarios));
}
modmaBtn.addEventListener("click", () => {
  calculateMODMA();
  populateResults();
});

updateAllCategories();
populateTable();
