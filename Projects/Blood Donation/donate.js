document.getElementById("donateForm").addEventListener("submit", function(e) {
    e.preventDefault();
    
    let name = document.getElementById("donorName").value;
    let blood = document.getElementById("bloodGroup").value;
    
    // Show success message
    document.getElementById("donateMsg").innerText = "Thank you " + name + "! You are now registered as a " + blood + " donor.";
    document.getElementById("donateMsg").style.color = "green";
    
    this.reset();
});