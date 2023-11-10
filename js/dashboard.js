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
const bestCaseScenario = document.querySelector(".js-best-case-scenario > pre");
const worstCaseScenario = document.querySelector(
  ".js-worst-case-scenario > pre"
);
const categoryUpdateBtn = document.querySelector(".js-update-btn");
const categorySubmitBtn = document.querySelector(".js-submit-btn");
const hardReset = document.querySelector(".js-hard-reset");

const fileInput = document.getElementById("csvFile");

// Call uploadCSV function when the "Upload" button is clicked
const uploadButton = document.getElementById("convertButton");

// Call uploadCSV function when the file input value changes
uploadButton.addEventListener("click", function () {
  fileInput.value = "";
  updateAllScenarios();
  populateTable();
});
let allCategories, allScenarios;

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
}

fileInput.addEventListener("change", (e) => uploadCSV(e, cb));

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
      categoryUpdateBtn.classList.remove("hidden");
      populateCategoryForm(e.target.attributes["data-category-index"].value);
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
});

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
}

function openCategoryModel() {
  modal.style.display = "block";
  categoryForm.querySelector("#categoryName").removeAttribute("disabled");
  categoryForm.querySelector("#evaluationType").removeAttribute("disabled");
  categoryForm.reset();
  categorySubmitBtn.classList.remove("hidden");
  categoryUpdateBtn.classList.add("hidden");
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
  if (e.submitter.classList.contains("js-update-btn")) {
    let indexToBeUpdated = undefined;
    const categoryToBeUpdated = categories.find((c, i) => {
      if (c.categoryName == categoryName.value) {
        indexToBeUpdated = i;
        return true;
      }
    });
    categories[indexToBeUpdated] = temp;
    localStorage.setItem("categories", JSON.stringify(categories));
  } else {
    categories = [
      ...categories,
      {
        categoryName: categoryName.value,
        categoryWeight: categoryWeight.value,
        categoryDirection: categoryDirection.value,
        evaluationType: evaluationType.value,
      },
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
  tableBody.innerHTML = "";
  // Retrieve categories and scenarios from localStorage
  const categories = JSON.parse(localStorage.getItem("categories")) || [];
  const scenarios = JSON.parse(localStorage.getItem("scenarios")) || [];

  if (scenarios.length) {
    const noScenariosAvailable = document.querySelector(".js-no-Scenarios");
    const scenariosTable = document.querySelector(".scenarios-table");
    noScenariosAvailable.classList.add("hidden");
    scenariosTable.classList.remove("hidden");
  }
  // Create the header row with scenario names as columns
  const headerRow = document.createElement("tr");
  headerRow.innerHTML = "<th>Scenarios</th>";
  categories.forEach((category) => {
    headerRow.innerHTML += `<th>${category.categoryName}</th>`;
  });
  tableBody.appendChild(headerRow);

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
  if (scenarios.length >= 2) {
    calculateMODMA();
  } else {
    const noResultsAvailable = document.querySelector(".js-no-results");
    const rankingTable = document.querySelector(".js-ranking-table");
    noResultsAvailable.classList.remove("hidden");
    rankingTable.classList.add("hidden");
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

function populateResults() {
  const rankingTable = document.querySelector(".js-ranking-table");
  const tableBody = rankingTable.querySelector(".js-table-body");
  tableBody.innerHTML = "";

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
  if (e.submitter.classList.contains("js-update-scenario-btn")) {
    const index = e.submitter.attributes["data-index"].value;
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
  link.setAttribute("download", "data.csv");
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();

  // Clean up
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

const downloadButton = document.getElementById("downloadCSV"); // Replace "downloadButton" with the actual ID of your button
downloadButton.addEventListener("click", downloadCSV);

updateAllScenarios();
populateTable();
