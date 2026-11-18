document.getElementById("contactForm").addEventListener("submit", function(e) {
    e.preventDefault();
    
    let name = document.getElementById("contactName").value;
    
    // Show success message
    document.getElementById("contactMsg").innerText = "Thanks " + name + ", we have received your message!";
    document.getElementById("contactMsg").style.color = "green";
    
    // Clear the form
    this.reset();
});