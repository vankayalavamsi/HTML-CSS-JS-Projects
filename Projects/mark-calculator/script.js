const marksInputs = document.querySelectorAll(".marks");

const fullMarksInput = document.getElementById("fullMarks");

const calculateBtn = document.getElementById("calculateBtn");

const resetBtn = document.getElementById("resetBtn");

const totalDisplay = document.getElementById("total");

const percentageDisplay = document.getElementById("percentage");

const gradeDisplay = document.getElementById("grade");

const cgpaDisplay = document.getElementById("cgpa");

const progress = document.getElementById("progress");

const performance = document.getElementById("performance");

calculateBtn.addEventListener("click", function () {

    let total = 0;
    let valid = true;

    marksInputs.forEach(function (input) {

        let value = input.value.trim();

        if (value === "") {
            value = 0;
        }

        value = Number(value);

        if (!Number.isFinite(value) || value < 0 || value > 100) {
            valid = false;
            input.style.borderColor = "#ef4444";
        } else {
            input.style.borderColor = "#e2e8f0";
            total += value;
        }

    });

    const fullMarks = Number(fullMarksInput.value);

    if (!valid) {
        alert("Enter marks between 0 and 100 for every subject.");
        return;
    }

    if (!Number.isFinite(fullMarks) || fullMarks <= 0 || total > fullMarks) {
        alert("Please enter a valid full marks value.");
        return;
    }

    const percentage = (total / fullMarks) * 100;

    let grade = "";
    let cgpa = 0;

    if (percentage > 90) {
        grade = "A+";
        cgpa = 10;
    } else if (percentage > 80) {
        grade = "A";
        cgpa = 9;
    } else if (percentage > 70) {
        grade = "B+";
        cgpa = 8;
    } else if (percentage > 60) {
        grade = "B";
        cgpa = 7;
    } else if (percentage > 50) {
        grade = "C+";
        cgpa = 6;
    } else if (percentage > 40) {
        grade = "C";
        cgpa = 5;
    } else if (percentage > 30) {
        grade = "D";
        cgpa = 4;
    } else {
        grade = "E";
        cgpa = 0;
    }

    totalDisplay.textContent = `${total} / ${fullMarks}`;

    percentageDisplay.textContent = percentage.toFixed(2) + "%";

    gradeDisplay.textContent = grade;

    cgpaDisplay.textContent = cgpa;

    progress.style.width = percentage + "%";

    if (percentage > 90) {
        performance.textContent = "Outstanding Performance! 🏆";
    } else if (percentage > 80) {
        performance.textContent = "Excellent Performance! 🌟";
    } else if (percentage > 60) {
        performance.textContent = "Good Performance! 👏";
    } else if (percentage > 40) {
        performance.textContent = "Keep Improving! 💪";
    } else {
        performance.textContent = "You can do better. Keep trying! 📚";
    }

});

resetBtn.addEventListener("click", function () {

    marksInputs.forEach(function (input) {
        input.value = "";
        input.style.borderColor = "#e2e8f0";
    });

    fullMarksInput.value = 1400;

    totalDisplay.textContent = "0 / 1400";

    percentageDisplay.textContent = "0%";

    gradeDisplay.textContent = "-";

    cgpaDisplay.textContent = "0";

    progress.style.width = "0%";

    performance.textContent = "Start entering your marks!";

});