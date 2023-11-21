// document.getElementById("convertButton").addEventListener("click", convertToJSON);

// import { categories } from "./data";

// function convertToJSON() {
//     const fileInput = document.getElementById("csvFile");
//     const file = fileInput.files[0];

//     if (!file) {
//         console.log("Please select a CSV file.");
//         return;
//     }

//     const reader = new FileReader();
//     reader.onload = function (e) {
//         const contents = e.target.result;
//         const lines = contents.split("\n");

//         const data = [];
//         const headers = lines[0].split(",");

//         for (let i = 1; i < lines.length; i++) {
//             const currentLine = lines[i].split(",");
//             if (currentLine.length === headers.length) {
//                 const entry = {};
//                 for (let j = 0; j < headers.length; j++) {
//                     entry[headers[j]] = currentLine[j];
//                 }
//                 data.push(entry);
//             }
//         }

//         const jsonData = JSON.stringify(data, null, 2);
//         localStorage.setItem('scenario', jsonData)
//         console.log(jsonData);
//     };

//     reader.readAsText(file);
// }

// function cb() {
//     console.log("this is cb")
//         // console.log'categories', JSON.stringify(categories))
//         // console.log'scenarios', JSON.stringify(scenarios))
// }
function uploadCSV(event, cb) {
  const file = event.target.files[0];
  const reader = new FileReader();

  reader.onload = function (e) {
    const content = e.target.result;
    const lines = content.split("\n");
    const categories = [];
    const scenarios = [];
    let isCategoryTable = false;
    let isScenarioTable = false;
    let categoryHeaders = [];
    let categoryKeys = [];
    let scenariosKeys = [];

    try {
      lines.forEach((line, index) => {
        const values = line.split(",").map((value) => value.trim());
  
        if (values[0] === "Category") {
          isCategoryTable = true;
          if (index == 0) {
            categoryKeys = values.slice(1);
          } else {
            let temp = {};
            const categoryValues = values.slice(1);
            categoryKeys.forEach((key, index) => {
              temp[key] = categoryValues[index].replaceAll('"', "");
            });
            categories.push(temp);
          }
        } else if (values[0] === "Scenarios") {
          isScenarioTable = true;
          if (isCategoryTable && isCategoryTable) {
            scenariosKeys = values.slice(1);
            isCategoryTable = false;
          } else if (isScenarioTable && !isCategoryTable) {
            let temp = {};
            const scenarioValues = values.slice(1);
            scenariosKeys.forEach((key, index) => {
              temp[key] = scenarioValues[index].replaceAll('"', "");
            });
            scenarios.push(temp);
          }
        }
      });
    } catch (error) {
      alert("Error while parsing .csv")
    }

    //   localStorage.setItem('categories', JSON.stringify(categories))
    //   localStorage.setItem('scenarios', JSON.stringify(scenarios))
    cb(categories, scenarios);
  };

  reader.readAsText(file);
}

export default uploadCSV;
