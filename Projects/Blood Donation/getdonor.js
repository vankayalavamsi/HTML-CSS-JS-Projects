// Fake database of donors for demonstration
const fakeDonors = [
    { name: "Alice Smith", blood: "O+", city: "New York" },
    { name: "Bob Jones", blood: "A-", city: "Chicago" },
    { name: "Charlie Brown", blood: "O+", city: "New York" }
];

document.getElementById("searchForm").addEventListener("submit", function(e) {
    e.preventDefault();
    
    // Get what the user searched for
    let searchInput = document.getElementById("searchBlood").value;
    
    // Find matching donors
    let results = fakeDonors.filter(donor => donor.blood === searchInput);
    
    // Get the table elements
    let table = document.getElementById("donorTable");
    let tableBody = document.getElementById("tableBody");
    
    // Clear old results
    tableBody.innerHTML = "";
    
    if (results.length > 0) {
        // Show the table
        table.style.display = "table";
        
        // Loop through results and add rows to the table
        results.forEach(donor => {
            let row = `<tr>
                <td>${donor.name}</td>
                <td>${donor.blood}</td>
                <td>${donor.city}</td>
            </tr>`;
            tableBody.innerHTML += row;
        });
    } else {
        table.style.display = "none";
        alert("No donors found for this blood group.");
    }
});