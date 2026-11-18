document.getElementById("loginForm").addEventListener("submit", function(e) {
    // Prevent the page from refreshing
    e.preventDefault();
    
    // Get the values from the inputs
    let email = document.getElementById("loginEmail").value;
    
    // Show a success message (In real life, you would check a database here)
    document.getElementById("loginMsg").innerText = "Login successful! Welcome back.";
    document.getElementById("loginMsg").style.color = "green";
    
    // Clear the form
    this.reset();
});