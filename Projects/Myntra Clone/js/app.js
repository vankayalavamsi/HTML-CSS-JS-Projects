// ======================
// Myntra Clone App JS
// ======================

console.log("Myntra Clone Loaded Successfully");

// Search functionality

const searchInput = document.getElementById("searchInput");

if(searchInput){

    searchInput.addEventListener("keyup", function(){

        let value = searchInput.value.toLowerCase();

        let productCards =
        document.querySelectorAll(".product-card");

        productCards.forEach(card => {

            let productName =
            card.querySelector("h3")
            .innerText
            .toLowerCase();

            if(productName.includes(value)){
                card.style.display = "block";
            }
            else{
                card.style.display = "none";
            }

        });

    });

}


// Add To Cart Buttons

const cartButtons =
document.querySelectorAll(".product-card button");

cartButtons.forEach(button => {

    button.addEventListener("click", () => {

        alert("Product Added To Cart");

    });

});


// Welcome Message

window.addEventListener("load", () => {

    console.log("Welcome to Myntra Clone");

});


// Dark Mode

const darkBtn =
document.createElement("button");

darkBtn.innerText = "🌙";

darkBtn.style.position = "fixed";
darkBtn.style.bottom = "20px";
darkBtn.style.right = "20px";
darkBtn.style.padding = "12px";
darkBtn.style.border = "none";
darkBtn.style.borderRadius = "50%";
darkBtn.style.cursor = "pointer";
darkBtn.style.fontSize = "20px";

document.body.appendChild(darkBtn);

darkBtn.addEventListener("click", () => {

    document.body.classList.toggle("dark-mode");

});


// Save Dark Mode

if(localStorage.getItem("theme") === "dark"){

    document.body.classList.add("dark-mode");

}

darkBtn.addEventListener("click", () => {

    if(document.body.classList.contains("dark-mode")){

        localStorage.setItem("theme","dark");

    }
    else{

        localStorage.setItem("theme","light");

    }

});