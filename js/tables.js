function myCreateFunction(tableId) {
  var table = document.getElementById(tableId);
  var i = table.rows.length;
  var row = table.insertRow(i);

  var inputTypes = ['text', 'number', 'radio', 'select'];
  var inputNames = ['categoryName', 'categoryWeight', 'categoryDirection', 'categoryEvaluationType'];

  for (var j = 0; j < inputTypes.length; j++) {
    var cell = row.insertCell(j);
    if (inputTypes[j] === 'radio') {
      cell.innerHTML = `
        <label class="radio-label"><input type="radio" name="${inputNames[j]}" value="positive"> Positive</label>
        <label class="radio-label"><input type="radio" name="${inputNames[j]}" value="negative"> Negative</label>`;
    } else if (inputTypes[j] === 'select') {
      cell.innerHTML = `
        <select name="${inputNames[j]}">
          <option value="ordinal">Ordinal</option>
          <option value="linear">Linear</option>
          <option value="descriptive">Descriptive</option>
        </select>`;
    } else {
      cell.innerHTML = `<input type="${inputTypes[j]}" name="${inputNames[j]}">`;
    }
  }

  var cell = row.insertCell(row.cells.length);
  cell.innerHTML = "x";
  cell.classList.add("delete_row");
  cell.addEventListener("click", function () {
    deleteRow(this);
  }, false);

  checkCategoryCount();
}

function deleteRow(r) {
  var i = r.parentNode.rowIndex;
  var table = r.parentNode.parentNode;

  if (i !== 0) {
    table.deleteRow(i);

    if (table.id === 'myTable1') {
      checkCategoryCount();
    }
  }

  if (table.id === 'myTable1') {
    checkCategoryCount();
  }
}

function openModal(modalId) {
  var modal = document.getElementById(modalId);
  modal.style.display = "block";

  var form = modal.querySelector('form');
  form.reset();

  if (modalId === 'scenarioModal') {
    var categoryTable = document.getElementById('myTable1');
    var categoryCount = categoryTable.rows.length - 1;

    var modalContent = document.querySelector(`#${modalId} .modal-content`);
    var categoriesInput = '';

    for (var i = 0; i < categoryCount; i++) {
      var categoryName = categoryTable.rows[i + 1].cells[0].innerText;
      var categoryEvaluationType = categoryTable.rows[i + 1].cells[3].innerText.toLowerCase();

      var valueType = '';
      if (categoryEvaluationType === 'linear') {
        valueType = 'number';
      } else if (categoryEvaluationType === 'descriptive') {
        valueType = 'select';
      } else if (categoryEvaluationType === 'ordinal') {
        valueType = 'text';
      }

      var valueOptions = '';
      if (categoryEvaluationType === 'descriptive') {
        valueOptions = `
          <select name="categoryValue${i}" required>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select><br>
        `;
      } else {
        valueOptions = `<input type="${valueType}" name="categoryValue${i}" required><br>`;
      }

      categoriesInput += `
        <label for="categoryValue:${i}">${categoryName} </label>
        ${valueOptions}
      `;
    }

    var categoryValuesContainer = document.getElementById('categoryValues');
    categoryValuesContainer.innerHTML = categoriesInput;

    updateScenarioTableHeaders(categoryCount);
  }
}

function updateScenarioTableHeaders(categoryCount) {
  var scenarioTable = document.getElementById('myTable2');
  var headerRow = scenarioTable.rows[0];

  while (headerRow.cells.length > 1) {
    headerRow.deleteCell(1);
  }

  for (var i = 1; i <= categoryCount; i++) {
    var newCategoryHeader = document.createElement('th');
    newCategoryHeader.textContent = 'Category' + i;
    headerRow.appendChild(newCategoryHeader);
  }
}

function closeModal(modalId) {
  document.getElementById(modalId).style.display = "none";
}

function submitCategory() {
  var form = document.getElementById('categoryForm');
  var formData = new FormData(form);

  var name = formData.get('categoryName');
  var weight = parseFloat(formData.get('categoryWeight'));
  var direction = formData.get('categoryDirection');
  var evaluationType = formData.get('categoryEvaluationType');

  if (name && !isNaN(weight) && direction && evaluationType) {
    var table = document.getElementById('myTable1');
    var i = table.rows.length;
    var row = table.insertRow(i);

    var values = {
      Name: name,
      Weight: weight,
      Direction: direction,
      EvaluationType: evaluationType
    };

    for (var key in values) {
      var cell = row.insertCell();
      cell.innerHTML = values[key];
    }

    var cell = row.insertCell(row.cells.length);
    cell.innerHTML = "x";
    cell.classList.add("delete_row");
    cell.addEventListener("click", function () {
      deleteRow(this);
    }, false);

    closeModal('categoryModal');

    var jsonValues = JSON.stringify(values);
    console.log("Entered Category (JSON):", jsonValues);
  } else {
    alert('Please fill out all fields with valid values.');
  }

  checkCategoryCount();
}

function submitScenario() {
  var form = document.getElementById('scenarioForm');
  var formData = new FormData(form);

  var name = formData.get('scenarioName');
  if (name) {
    var table = document.getElementById('myTable2');
    var i = table.rows.length;
    var row = table.insertRow(i);

    var values = { Name: name };

    var categoryTable = document.getElementById('myTable1');
    var categoryCount = categoryTable.rows.length - 1;
    for (var j = 0; j < categoryCount; j++) {
      var categoryValue = formData.get(`categoryValue${j}`);
      values['Category' + (j + 1)] = categoryValue;
    }

    for (var key in values) {
      var cell = row.insertCell();
      cell.innerHTML = values[key];
    }

    closeModal('scenarioModal');

    var jsonData = JSON.stringify(values);
    console.log("Entered Scenario Data (JSON):", jsonData);

    updateScenarioTableHeaders(categoryCount);
  } else {
    alert('Please fill out all fields.');
  }
}

function checkCategoryCount() {
  var categoryTable = document.getElementById('myTable1');
  var categoryCount = categoryTable.rows.length - 1;

  var addScenarioButton = document.getElementById('addScenarioButton');
  addScenarioButton.disabled = categoryCount < 3;
}
