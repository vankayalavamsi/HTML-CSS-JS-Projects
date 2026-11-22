const products = [

{
id:1,
name:"Roadster Shirt",
price:899,
image:"https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500",
description:"Premium cotton shirt with slim fit design."
},

{
id:2,
name:"Nike Shoes",
price:2499,
image:"https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500",
description:"Comfortable running shoes for daily use."
},

{
id:3,
name:"Zara Dress",
price:1299,
image:"https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=500",
description:"Elegant dress perfect for parties."
},

{
id:4,
name:"H&M T-Shirt",
price:699,
image:"https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=500",
description:"Soft cotton t-shirt for casual wear."
},

{
id:5,
name:"Puma Sneakers",
price:1899,
image:"https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500",
description:"Stylish sneakers with superior comfort."
},

{
id:6,
name:"Denim Jacket",
price:1599,
image:"https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500",
description:"Classic denim jacket for every season."
}

];

const selectedId =
Number(
localStorage.getItem(
"selectedProduct"
)
);

const product =
products.find(
p => p.id === selectedId
);

if(product){

document.getElementById("productName")
.innerText = product.name;

document.getElementById("productPrice")
.innerText = "₹" + product.price;

document.getElementById("productImage")
.src = product.image;

document.getElementById("productDescription")
.innerText = product.description;

}

// Add To Cart

document
.getElementById("cartBtn")
.addEventListener("click",()=>{

let cart =
JSON.parse(
localStorage.getItem("cart")
) || [];

cart.push(product.id);

localStorage.setItem(
"cart",
JSON.stringify(cart)
);

alert("Added To Cart 🛒");

});

// Add To Wishlist

document
.getElementById("wishlistBtn")
.addEventListener("click",()=>{

let wishlist =
JSON.parse(
localStorage.getItem("wishlist")
) || [];

if(!wishlist.includes(product.id)){

wishlist.push(product.id);

localStorage.setItem(
"wishlist",
JSON.stringify(wishlist)
);

alert("Added To Wishlist ❤️");

}
else{

alert("Already In Wishlist");

}

});

// Similar Products

const similar =
document.getElementById(
"similarContainer"
);

products.forEach(item=>{

if(item.id !== product.id){

similar.innerHTML += `

<div
class="similar-card"
onclick="openSimilar(${item.id})"
style="cursor:pointer">

<img src="${item.image}">

<h3>${item.name}</h3>

</div>

`;

}

});

function openSimilar(id){

localStorage.setItem(
"selectedProduct",
id
);

location.reload();

}