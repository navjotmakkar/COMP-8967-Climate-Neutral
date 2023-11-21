import { firebaseConfig } from "./constants.js";
import { categories, scenarios } from "./data.js";
import uploadCSV from "./fileupload.js";
// Initialize Firebase
const firebaseApp = firebase.initializeApp(firebaseConfig);
const userEmail = document.getElementById("user-email");
const logoutBtn = document.getElementById("user-logout");
const modalBtn = document.querySelector(".js-modal-btn");
const modal = document.querySelector(".js-modal-add-category");
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
const bestCaseScenario = document.querySelector(".js-best-case-scenario > p");
const worstCaseScenario = document.querySelector(".js-worst-case-scenario > p");
const categoryUpdateBtn = document.querySelector(".js-update-btn");
const categorySubmitBtn = document.querySelector(".js-submit-btn");
const hardReset = document.querySelector(".js-hard-reset");

const fileInput = document.getElementById("csvFile");

// Call uploadCSV function when the "Upload" button is clicked
const uploadButton = document.getElementById("convertButton");

// call clearData functiomn to clear scenarios, categories, ranking table and charts
const clearDataButton = document.querySelector(".js-clear-data-btn");

//call MODM analyse function which will calculate table, scores, and plot charts
const analyzeDataBtn = document.querySelector(".js-analyze-data-btn");

// Call uploadCSV function when the file input value changes
// uploadButton.addEventListener("click", function (e) {
//   uploadCSV(e, cb)
//   fileInput.value = "";
//   updateAllScenarios();
//   populateTable();
// });
let allCategories, allScenarios;

const colors = [
  "#ff6384",
  "#36a2eb",
  "#ffcd56",
  "#4bc0c0",
  "#9966ff",
  "#ff9f40",
  "#ff9ff3",
  "#f368e0",
  "#48dbfb",
  "#1dd1a1",
  // Add more colors if you expect more than 10 categories
];
const scale = [
  { value: 1, label: "Low" },
  { value: 2, label: "Below Average" },
  { value: 3, label: "Average" },
  { value: 4, label: "Good" },
  { value: 5, label: "Excellent" },
];

function cb(categories, scenarios) {
  localStorage.setItem("categories", JSON.stringify(categories));
  localStorage.setItem("scenarios", JSON.stringify(scenarios));
  updateAllScenarios();
  populateTable();
}

// fileInput.addEventListener("change", (e) => uploadCSV(e, cb));

function populateCategoryForm(index) {
  allCategories = JSON.parse(localStorage.getItem("categories")) || [];
  // const form = categoryForm.querySelector(".js-category-creation-form");
  const categoryName = categoryForm.querySelector("#categoryName");
  categoryName.value = allCategories[index].categoryName;
  const categoryWeight = categoryForm.querySelector("#categoryWeight");
  categoryWeight.value = allCategories[index].categoryWeight;
  const categoryDirection = categoryForm.querySelector("#categoryDirection");
  categoryDirection.value = allCategories[index].categoryDirection;
}

function deleteCategory(index) {
  allCategories = JSON.parse(localStorage.getItem("categories")) || [];
  allCategories.splice(index, 1);
  localStorage.setItem("categories", JSON.stringify(allCategories));
  updateAllScenarios();
}

function deleteScenario(index) {
  allScenarios = JSON.parse(localStorage.getItem("scenarios")) || [];
  allScenarios.splice(index, 1);
  localStorage.setItem("scenarios", JSON.stringify(allScenarios));
  updateAllScenarios();
}

document.addEventListener("DOMContentLoaded", () => {
  allCategories = JSON.parse(localStorage.getItem("categories")) || [];
  allScenarios = JSON.parse(localStorage.getItem("scenarios")) || [];
  const editCategoryWrapper = document.querySelector(".js-all-categories");
  const editScenario = document.querySelector(".js-table-body");

  editCategoryWrapper.addEventListener("click", (e) => {
    if (e.target.classList.contains("js-edit-icon")) {
      modal.style.display = "block";
      categoryForm
        .querySelector("#categoryName")
        .setAttribute("disabled", true);
      categoryForm
        .querySelector("#evaluationType")
        .setAttribute("disabled", true);
      categorySubmitBtn.classList.add("hidden");
      categorySubmitBtn.removeAttribute('type')
      categoryUpdateBtn.classList.remove("hidden");
      categoryUpdateBtn.focus()
      populateCategoryForm(parseInt(e.target.attributes["data-category-index"].value));
    } else if (e.target.classList.contains("js-trash-icon")) {
      deleteCategory(
        parseInt(e.target.attributes["data-category-index"].value)
      );
    }
  });

  editScenario.addEventListener("click", (e) => {
    if (e.target.classList.contains("js-edit-scenario-icon")) {
      const index = parseInt(e.target.attributes["data-index"].value);
      openAddScenarioModel(allScenarios[index], index);
    }

    if (e.target.classList.contains("js-trash-scenario-icon")) {
      const index = parseInt(e.target.attributes["data-index"].value);
      deleteScenario(index);
    }
  });

  initializeCategoriesVisualization();
});

function initializeCategoriesVisualization() {
  function applyCategoryTabColors(categories, isInvalid) {
    categories.forEach((category, index) => {
      let color = isInvalid ? "red" : colors[index % colors.length]; // Red if invalid, else cycle through colors
      let categoryTabs = document.querySelectorAll(
        `.category-tab[data-category-index="${index}"]`
      );
      categoryTabs.forEach((tab) => {
        tab.style.backgroundColor = color;
      });
    });
  }

  function displayError(message) {
    const errorElement = document.getElementById("categoryError");
    errorElement.textContent = message;
    if (message) {
      errorElement.classList.remove("hidden");
    } else {
      errorElement.classList.add("hidden");
    }
  }

  function generatePieChart(categories, totalWeight) {
    let isInvalid = totalWeight > 1;
    let remainingWeight = totalWeight < 1 ? 1 - totalWeight : 0;

    let data = [
      {
        values: isInvalid
          ? [100]
          : categories
              .map((c) => c.weight * 100)
              .concat(remainingWeight > 0 ? [remainingWeight * 100] : []),
        labels: isInvalid
          ? ["Invalid Weight"]
          : categories
              .map((c) => c.name)
              .concat(remainingWeight > 0 ? ["Remaining"] : []),
        type: "pie",
        marker: {
          colors: isInvalid
            ? ["red"]
            : categories
                .map((_, index) => colors[index % colors.length])
                .concat(remainingWeight > 0 ? ["red"] : []),
        },
      },
    ];

    var layout = {
      title: "Category Distribution",
      showlegend: true,
    };

    Plotly.newPlot("categoryPieChart", data, layout);
  }

  function getCategoriesFromLocalStorage() {
    let storedData = JSON.parse(localStorage.getItem("categories")) || [];
    return storedData.map((c) => ({
      name: c.categoryName,
      weight: parseFloat(c.categoryWeight),
    }));
  }
  function adjustGridLayout(categories) {
    const categoriesCreationWrapper = document.querySelector(
      ".cscontainer > .categories-creation-wrapper"
    );
    const categoriesTabWrapper = document.querySelector(
      ".categories-tabs-wrapper"
    );
    if (categoriesCreationWrapper) {
      categoriesCreationWrapper.style.gridTemplateColumns =
        categories.length === 0 ? "100% 0 0" : "58% 1% 38%";
      categoriesTabWrapper.style.minHeight =
        categories.length === 0 ? "100px" : "300px";
    }
  }
  function hideElementsIfNoCategories(categories) {
    const pieChartElement = document.getElementById("categoryPieChart");
    const arrowIcon = document.querySelector(".fa-arrow-right");

    if (categories.length === 0) {
      if (pieChartElement) pieChartElement.style.display = "none";
      if (arrowIcon) arrowIcon.style.display = "none";
    } else {
      if (pieChartElement) pieChartElement.style.display = "block";
      if (arrowIcon) arrowIcon.style.display = "inline-block"; // or 'block' depending on your layout
    }
    adjustGridLayout(categories);
  }
  let categories = getCategoriesFromLocalStorage();
  hideElementsIfNoCategories(categories);

  if (categories.length === 0) return; // Exit the function if no categories
  let totalWeight = categories.reduce((acc, cur) => acc + cur.weight, 0);

  if (totalWeight > 1) {
    displayError("Total weight of categories exceeds 100%.");
    applyCategoryTabColors(categories, true);
  } else if (totalWeight < 1) {
    displayError("Total weight of categories is less than 100%.");
    applyCategoryTabColors(categories, false);
  } else {
    displayError(""); // No error
    applyCategoryTabColors(categories, false);
  }

  generatePieChart(categories, totalWeight);
}
// hardReset.addEventListener("click", () => {
//   localStorage.setItem("categories", JSON.stringify(categories));
//   localStorage.setItem("scenarios", JSON.stringify(scenarios));
//   updateAllScenarios();
//   populateTable();
// });

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

function updateAllScenarios() {
  let categories = JSON.parse(localStorage.getItem("categories")) || []; // Parse categories from localStorage
  let scenarios = JSON.parse(localStorage.getItem("scenarios")) || []; // Parse categories from localStorage

  const allCategoriesContainer = document.querySelector(".js-all-categories");
  const noCategories = document.querySelector(".js-no-categories");

  // Construct HTML for category tabs using map and join
  const categoryTabsHTML = categories
    .map((category, i) => {
      return `<div class="category-tab" data-category-index=${i}>
        <label>${category.categoryName} - ${
        category.categoryWeight * 100
      }%</label>
        <i class="fa-solid fa-pen-to-square fa-sm js-edit-icon" data-category-index=${i}></i>
        <i class="fa-solid fa-trash fa-sm js-trash-icon" data-category-index=${i}></i>
      </div>`;
    })
    .join("");

  // Set the innerHTML of the container with the generated HTML
  allCategoriesContainer.innerHTML = categoryTabsHTML;

  if (!categories.length) {
    noCategories.classList.remove("hidden");
    allCategoriesContainer.classList.add("hidden");
  } else {
    noCategories.classList.add("hidden");
    allCategoriesContainer.classList.remove("hidden");
    if (scenarios.length) {
      // calculate result
      populateTable();
    } else {
      const noScenariosAvailable = document.querySelector(".js-no-Scenarios");
      const scenariosTable = document.querySelector(".scenarios-table");
      noScenariosAvailable.classList.remove("hidden");
      scenariosTable.classList.add("hidden");
    }
  }
  initializeCategoriesVisualization();
}

function openCategoryModel() {
  modal.style.display = "block";
  categoryForm.querySelector("#categoryName").removeAttribute("disabled");
  categoryForm.querySelector("#evaluationType").removeAttribute("disabled");
  categoryForm.reset();
  categorySubmitBtn.classList.remove("hidden");
  categorySubmitBtn.focus()
  categoryUpdateBtn.classList.add("hidden");
  categoryUpdateBtn.removeAttribute('type')
}

modalBtn.addEventListener("click", () => {
  openCategoryModel();
});

function createInputField(type, id, value = "") {
  const inputField = `<input type="${type}" class="js-input" id="${id}" value="${value}" required="true" />`;
  return inputField;
}

function createSelectField(id, options, value = "") {
  let selectField = `<select class="js-input" id="${id}" value="${value}" required="true">`;
  options.forEach((option) => {
    selectField += `<option value="${option.value}">${option.label}</option>`;
  });
  selectField += "</select>";
  return selectField;
}

function openAddScenarioModel(scenario, index) {
  jsAddScenarioFormContainer.innerHTML = "";
  addScenarioModel.style.display = "block";
  let value;
  let inputField;
  const categories = JSON.parse(localStorage.getItem("categories")) || [];
  const scenarios = JSON.parse(localStorage.getItem("scenarios")) || [];

  categories.forEach((category) => {
    const id = `js-${category.categoryName.replace(/\s/g, "")}`;
    if (scenario) {
      const updatedScenario = scenarios[index];
      if (category.evaluationType === "numerical") {
        value = updatedScenario[category.categoryName] || "";
        inputField = createInputField("number", id, value);
      } else {
        value = updatedScenario[category.categoryName] || 1;
        inputField = createSelectField(id, scale, value);
      }
    } else {
      if (category.evaluationType === "numerical") {
        inputField = createInputField("number", id, "");
      } else {
        inputField = createSelectField(id, scale, 1);
      }
    }

    const categoryElement = `<div class="form-element">
                                <label class="js-label">${category.categoryName}</label>
                                ${inputField}
                             </div>`;

    jsAddScenarioFormContainer.insertAdjacentHTML("beforeend", categoryElement);
  });

  // Get the Scenario Name input element
  const scenarioNameInput = document.querySelector("#scenarioName");

  // Enable or disable the Scenario Name input based on whether it's an edit or add
  if (scenario) {
    scenarioNameInput.setAttribute("disabled", true);
  } else {
    scenarioNameInput.removeAttribute("disabled");
  }

  if (scenario) {
    const categoryNameInput = document.querySelector(
      "form.js-add-scenario-form #scenarioName"
    );
    const updateScenarioBtn = document.querySelector(".js-update-scenario-btn");
    updateScenarioBtn.classList.remove("hidden");
    updateScenarioBtn.setAttribute("data-index", index);
    jsAddScenarioSubmitBtn.classList.add("hidden");
    categoryNameInput.value = scenario.scenarioName;
  }
}

addScenario.addEventListener("click", () => {
  const categories = JSON.parse(localStorage.getItem("categories")) || [];

  if (categories.length >= 2) {
    openAddScenarioModel();
  } else {
    alert("Please enter at least 2 categories before adding scenarios!");
  }
});

closeBtn.addEventListener("click", () => {
  modal.style.display = "none";
  categoryForm.reset();
  handleClearForm(categoryForm);
});
addScenarioModelClose.addEventListener("click", () => {
  handleAddCategoryModelClose();
  handleClearForm(addScenarioForm);
});

window.addEventListener("click", (event) => {
  if (event.target === modal) {
    modal.style.display = "none";
    handleClearForm(categoryForm);
  }
  if (event.target === addScenarioModel) {
    handleAddCategoryModelClose();
    handleClearForm(addScenarioForm);
  }
});

function handleClearForm(form) {
  form.reset();
}

function updateScenarioForNewCategory(newCategory) {
  const { categoryName, categoryWeight } = newCategory;

  let allScenarios = JSON.parse(localStorage.getItem("scenarios")) || [];

  allScenarios = allScenarios.map((s) => {
    if (!s[categoryName]) {
      const temp = { ...s };
      temp[categoryName] = "-";
      return temp;
    }
    return s;
  });
  localStorage.setItem("scenarios", JSON.stringify(allScenarios));
}

categoryForm.addEventListener("submit", (e) => {
  e.preventDefault();
  let categories = JSON.parse(localStorage.getItem("categories")) || [];
  const categoryName = document.getElementById("categoryName");
  const categoryWeight = document.getElementById("categoryWeight");
  const categoryDirection = document.getElementById("categoryDirection");
  const evaluationType = document.getElementById("evaluationType");
  const temp = {
    categoryName: categoryName.value,
    categoryWeight: parseFloat(categoryWeight.value),
    categoryDirection: categoryDirection.value,
    evaluationType: evaluationType.value,
  };
  if (e.target.querySelector("button[type='submit']").classList.contains("js-update-btn")) {
    let indexToBeUpdated = undefined;
    const categoryToBeUpdated = categories.find((c, i) => {
      if (c.categoryName.toLowerCase() == categoryName.value.toLowerCase()) {
        indexToBeUpdated = i;
        return true;
      }
    });
    categories[indexToBeUpdated] = temp;
    localStorage.setItem("categories", JSON.stringify(categories));
  } else {
    categories = [
      ...categories,
      temp
    ];
    localStorage.setItem("categories", JSON.stringify(categories));
    updateScenarioForNewCategory(temp);
    // Close the modal after processing the input
  }
  handleClearForm(categoryForm);
  modal.style.display = "none";

  updateAllScenarios();
});

function populateTable() {
  const tableBody = document.querySelector(".js-table-body");
  const tableHeader = document.querySelector("table.scenarios-table > thead");
  tableHeader.innerHTML = "";
  tableBody.innerHTML = "";
  // Retrieve categories and scenarios from localStorage
  const categories = JSON.parse(localStorage.getItem("categories")) || [];
  const scenarios = JSON.parse(localStorage.getItem("scenarios")) || [];

  if (scenarios.length) {
    const noScenariosAvailable = document.querySelector(".js-no-Scenarios");
    const scenariosTable = document.querySelector(".scenarios-table");
    noScenariosAvailable.classList.add("hidden");
    scenariosTable.classList.remove("hidden");

    // Create the header row with scenario names as columns
    const headerRow = document.createElement("tr");
    headerRow.innerHTML = "<th>Scenarios</th>";
    categories.forEach((category) => {
      headerRow.innerHTML += `<th>${category.categoryName}</th>`;
    });
    tableHeader.appendChild(headerRow);

    // Iterate through categories and populate the table dynamically
    scenarios.forEach((scenario, i) => {
      const row = document.createElement("tr");
      row.innerHTML = `<td class="scenario-name-table-cell"> 
      <span>${scenario.scenarioName} </span>    
        <i class="fa-solid fa-pen-to-square fa-sm js-edit-scenario-icon" data-index=${i}></i>
        <i class="fa-solid fa-trash fa-sm js-trash-scenario-icon" data-index=${i}></i>
    </td>`;

      // Populate category data for each scenario

      categories.forEach((category) => {
        row.innerHTML += `<td>${scenario[category.categoryName] || "-"}</td>`;
      });

      tableBody.appendChild(row);
    });
  }
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

analyzeDataBtn.addEventListener("click", () => {
  const scenarios = JSON.parse(localStorage.getItem("scenarios")) || [];
  if (scenarios.length >= 2) {
    calculateMODMA();
  } else {
    const noResultsAvailable = document.querySelector(".js-no-results");
    const rankingTable = document.querySelector(".js-ranking-table");
    noResultsAvailable.classList.remove("hidden");
    rankingTable.classList.add("hidden");
  }
});

function populateResults() {
  const rankingTable = document.querySelector(".js-ranking-table");
  const tableHeader = rankingTable.querySelector("thead");
  const tableBody = rankingTable.querySelector(".js-table-body");
  tableBody.innerHTML = "";
  tableHeader.innerHTML = "";

  // Retrieve categories and scenarios from localStorage
  const categories = JSON.parse(localStorage.getItem("categories")) || [];
  let results = JSON.parse(localStorage.getItem("rankingTable"));
  const scenarios = JSON.parse(localStorage.getItem("scenarios")) || [];

  if (results.length) {
    const noResultsAvailable = document.querySelector(".js-no-results");
    const rankingTable = document.querySelector(".js-ranking-table");
    noResultsAvailable.classList.add("hidden");
    rankingTable.classList.remove("hidden");
  }

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
  tableHeader.appendChild(headerRow);

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
  // Find the best and worst scenarios based on performance scores
  const bestScenario = results[0];
  const worstScenario = results[results.length - 1];

  // Construct sentences for best and worst case scenarios
  const bestCaseSentence = `${
    bestScenario.scenarioName
  } with a performance score of ${bestScenario.performanceScore.toFixed(2)}.`;
  const worstCaseSentence = `${
    worstScenario.scenarioName
  } with a performance score of ${worstScenario.performanceScore.toFixed(2)}.`;

  // Display sentences in the UI
  bestCaseScenario.textContent = bestCaseSentence;
  worstCaseScenario.textContent = worstCaseSentence;

  if (results.length >= 2) {
    resultsInsights.classList.remove("hidden");
    plotGraph(categories, results);
  }
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
  if (e.target.querySelector("button[type='submit']").classList.contains("js-update-scenario-btn")) {
    const index = e.target.querySelector("button[type='submit']").attributes["data-index"].value;
    scenarios[index] = { ...scenarios[index], ...temp };
    console.log(scenarios);
    localStorage.setItem("scenarios", JSON.stringify(scenarios));
    const categoryNameInput = document.querySelector(
      "form.js-add-scenario-form #scenarioName"
    );
    const updateScenarioBtn = document.querySelector(".js-update-scenario-btn");
    updateScenarioBtn.classList.add("hidden");
    jsAddScenarioSubmitBtn.classList.remove("hidden");
  } else {

    localStorage.setItem("scenarios", JSON.stringify([...scenarios, temp]));
  }
  handleAddCategoryModelClose();
  handleClearForm(addScenarioForm);
  populateTable();
});

function handleAddCategoryModelClose() {
  const categoryNameInput = document.querySelector(
    "form.js-add-scenario-form #scenarioName"
  );
  const updateScenarioBtn = document.querySelector(".js-update-scenario-btn");
  updateScenarioBtn.classList.add("hidden");
  jsAddScenarioSubmitBtn.classList.remove("hidden");
  addScenarioModel.style.display = "none";
}

function calculateMODMA() {
  const categories = JSON.parse(localStorage.getItem("categories")) || [];
  const scenarios = JSON.parse(localStorage.getItem("scenarios")) || [];

  // Validation checks
  const categoryValidationResult = validateCategories(categories);
  const scenarioValidationResult = validateScenarios(scenarios);
  const weightValidationResult = validateWeights(categories);

  if (
    !categoryValidationResult.isValid ||
    !scenarioValidationResult.isValid ||
    !weightValidationResult.isValid
  ) {
    // Display error messages for failed validation checks
    if (!categoryValidationResult.isValid) {
      alert(categoryValidationResult.message);
    } else if (!scenarioValidationResult.isValid) {
      alert(scenarioValidationResult.message);
    } else {
      alert(weightValidationResult.message);
    }
    return;
  }

  // Find maximum and minimum values for normalization
  const maxValues = {};
  const minValues = {};
  categories.forEach((category) => {
    maxValues[category.categoryName] = Math.max(
      ...scenarios.map((scenario) =>
        parseFloat(
          scenario[category.categoryName] == "-"
            ? 0
            : scenario[category.categoryName]
        )
      )
    );
    minValues[category.categoryName] = Math.min(
      ...scenarios.map((scenario) =>
        parseFloat(
          scenario[category.categoryName] == "-"
            ? 0
            : scenario[category.categoryName]
        )
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
      if (isNaN(value)) {
        normalizedScenario[category.categoryName] = 0;
      } else {
        if (category.categoryDirection === "positive") {
          normalizedScenario[category.categoryName] =
            value / maxValues[category.categoryName];
        } else if (category.categoryDirection === "negative") {
          normalizedScenario[category.categoryName] =
            minValues[category.categoryName] / value;
        }
      }

      // Assign weight and calculate performance score
      normalizedScenario.performanceScore +=
        normalizedScenario[category.categoryName] * category.categoryWeight;
    });
    return normalizedScenario;
  });

  localStorage.setItem("rankingTable", JSON.stringify(normalizedScenarios));
  populateResults();
}
// modmaBtn.addEventListener("click", () => {
//   calculateMODMA();
//   populateResults();
// });

function downloadCSV() {
  const categories = JSON.parse(localStorage.getItem("categories")) || [];
  const scenarios = JSON.parse(localStorage.getItem("scenarios")) || [];

  const fileNameInput = document.getElementById("fileNameInput");
  const fileName = fileNameInput.value.trim();

  // Ensure the user provided a file name
  if (fileName === "") {
    alert("Please enter a valid file name.");
    return;
  }

  // Function to convert an object to CSV row
  function convertToCSVRow(obj) {
    const values = Object.values(obj);
    return values.map((value) => `"${value}"`).join(",");
  }

  // Prepare CSV content for categories
  let categoryCSVContent = "Category,";

  // Add header row for categories properties
  const categoryPropertiesHeader = [
    "categoryName",
    "categoryWeight",
    "categoryDirection",
    "evaluationType",
  ];
  categoryCSVContent += `${categoryPropertiesHeader.join(",")}\n`;

  // Add data rows for categories properties
  categories.forEach((category) => {
    const categoryPropertiesRow = [
      category.categoryName,
      category.categoryWeight,
      category.categoryDirection,
      category.evaluationType,
    ];
    const categoryPropertiesCsvRow = convertToCSVRow({
      ...categoryPropertiesRow,
    });
    categoryCSVContent += `Category,${categoryPropertiesCsvRow}\n`;
  });

  // Prepare CSV content for scenarios
  let scenarioCSVContent = "Scenarios,";

  // Add header row for scenario names
  const scenarioHeader = [
    "scenarioName",
    ...categories.map((category) => category.categoryName),
  ];
  scenarioCSVContent += `${scenarioHeader.join(",")}\n`;

  // Add data rows for scenarios
  scenarios.forEach((scenario) => {
    let rowData = categories.map((category) => scenario[category.categoryName]);
    rowData = [scenario.scenarioName, ...rowData];
    const csvRow = convertToCSVRow({ ...rowData });
    scenarioCSVContent += `Scenarios,${csvRow}\n`;
  });

  // Combine both category and scenario CSV content
  const combinedCSVContent = categoryCSVContent + "\n" + scenarioCSVContent;

  // Create a Blob containing the CSV data
  const blob = new Blob([combinedCSVContent], {
    type: "text/csv;charset=utf-8;",
  });

  // Create a download link and trigger the download
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `${fileName}.csv`);
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();

  // Clean up
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

clearDataButton.addEventListener("click", () => {
  clearAllData();
});

function clearAllData() {
  // Clear categories
  localStorage.removeItem("categories");

  // Clear scenarios
  localStorage.removeItem("scenarios");

  // Clear ranking table
  localStorage.removeItem("rankingTable");

  // Clear result insights section
  const noResultsAvailable = document.querySelector(".js-no-results");
  const rankingTable = document.querySelector(".js-ranking-table");
  noResultsAvailable.classList.remove("hidden");
  rankingTable.classList.add("hidden");

  // Hide best and worst case scenario sections
  const resultsInsights = document.querySelector(".js-results-insights");
  resultsInsights.classList.add("hidden");

  // Clear and hide best case scenario
  const bestCaseScenario = document.querySelector(".js-best-case-scenario > p");
  bestCaseScenario.textContent = "";

  // Clear and hide worst case scenario
  const worstCaseScenario = document.querySelector(
    ".js-worst-case-scenario > p"
  );
  worstCaseScenario.textContent = "";

  // Clear weight distribution and performance score charts (replace these lines with your actual chart clearing logic)
  const piChart = document.querySelector(".js-wight-distribution");
  const barChart = document.querySelector(".js-performance-score");
  piChart.innerHTML = "";
  barChart.innerHTML = "";

  // Update UI
  updateAllScenarios();
  populateTable();
}

function validateCategories(categories) {
  // Check if there are duplicate category names
  const uniqueCategoryNames = new Set(
    categories.map((category) => category.categoryName)
  );
  if (uniqueCategoryNames.size !== categories.length) {
    return {
      isValid: false,
      message: "Error: Duplicate category names are not allowed.",
    };
  }
  return { isValid: true };
}

function validateScenarios(scenarios) {
  // Check if there are duplicate scenario names
  const uniqueScenarioNames = new Set(
    scenarios.map((scenario) => scenario.scenarioName)
  );
  if (uniqueScenarioNames.size !== scenarios.length) {
    return {
      isValid: false,
      message: "Error: Duplicate scenario names are not allowed.",
    };
  }
  return { isValid: true };
}

function validateWeights(categories) {
  // Check if the sum of weights is equal to 1
  const sumOfWeights = categories.reduce(
    (sum, category) => sum + parseFloat(category.categoryWeight),
    0
  );
  if (sumOfWeights !== 1) {
    return {
      isValid: false,
      message:
        "Error: The sum of weights for all categories must be equal to 1(100%).",
    };
  }
  return { isValid: true };
}

const downloadButton = document.getElementById("downloadCSV"); // Replace "downloadButton" with the actual ID of your button
downloadButton.addEventListener("click", downloadCSV);

updateAllScenarios();
populateTable();

const uploadBtn = document.getElementById("uploadBtn");
const fileInputTT = document.getElementById("fileInput");

uploadBtn.addEventListener("click", () => triggerFileInput());
fileInputTT.addEventListener("change", (e) => handleFileSelect(e));
function triggerFileInput() {
  document.getElementById("fileInput").click();
}

function handleFileSelect(event) {
  const fileInput = event.target;
  const files = fileInput.files;

  if (files.length > 0) {
    const selectedFile = files[0];
    console.log("Selected file:", selectedFile);
    uploadCSV(event, cb);
  }
}

var inputs = document.querySelectorAll(".file-upload");

for (var i = 0, len = inputs.length; i < len; i++) {
  customInput(inputs[i]);
}

function customInput(el) {
  const fileInput = el.querySelector('[type="file"]');
  const label = el.querySelector("[data-js-label]");

  fileInput.onchange = fileInput.onmouseout = function () {
    if (!fileInput.value) return;

    var value = fileInput.value.replace(/^.*[\\\/]/, "");
    el.className += " -chosen";
    label.innerText = value;
  };
}
