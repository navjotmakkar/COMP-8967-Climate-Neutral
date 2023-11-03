document.getElementById("convertButton").addEventListener("click", convertToJSON);

function convertToJSON() {
    const fileInput = document.getElementById("csvFile");
    const file = fileInput.files[0];

    if (!file) {
        console.log("Please select a CSV file.");
        return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
        const contents = e.target.result;
        const lines = contents.split("\n");

        const data = [];
        const headers = lines[0].split(",");

        for (let i = 1; i < lines.length; i++) {
            const currentLine = lines[i].split(",");
            if (currentLine.length === headers.length) {
                const entry = {};
                for (let j = 0; j < headers.length; j++) {
                    entry[headers[j]] = currentLine[j];
                }
                data.push(entry);
            }
        }

        const jsonData = JSON.stringify(data, null, 2);
        localStorage.setItem('scenario', jsonData)
        console.log(jsonData);
    };

    reader.readAsText(file);
}
