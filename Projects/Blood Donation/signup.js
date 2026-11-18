document.getElementById("signupForm").addEventListener("submit", function(e) {
    e.preventDefault();
    
    let name = document.getElementById("signupName").value;
    
    // Show success message
    document.getElementById("signupMsg").innerText = "Account created for " + name + "!";
    document.getElementById("signupMsg").style.color = "green";
    
    // Clear the form
    this.reset();
});