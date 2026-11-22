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

const container =
document.getElementById("productContainer");

function displayProducts(items){

container.innerHTML = "";

items.forEach(product=>{

container.innerHTML += `

<div class="product-box">

<img
src="${product.image}"
alt="${product.name}"
onclick="openProduct(${product.id})"
style="cursor:pointer">

<div class="product-info">

<h3>${product.name}</h3>

<p class="price">₹${product.price}</p>

<div class="btn-group">

<button
class="cart-btn"
onclick="addToCart(${product.id})">

Cart

</button>

<button
class="wishlist-btn"
onclick="addToWishlist(${product.id})">

Wishlist

</button>

</div>

</div>

</div>

`;

});

}

displayProducts(products);

function openProduct(id){

localStorage.setItem(
"selectedProduct",
id
);

window.location.href =
"product-details.html";

}

function addToCart(id){

let cart =
JSON.parse(localStorage.getItem("cart"))
|| [];

cart.push(id);

localStorage.setItem(
"cart",
JSON.stringify(cart)
);

alert("Added To Cart 🛒");

}

function addToWishlist(id){

let wishlist =
JSON.parse(
localStorage.getItem("wishlist")
) || [];

if(!wishlist.includes(id)){

wishlist.push(id);

localStorage.setItem(
"wishlist",
JSON.stringify(wishlist)
);

alert("Added To Wishlist ❤️");

}
else{

alert("Already In Wishlist");

}

}

const search =
document.getElementById("productSearch");

if(search){

search.addEventListener("keyup",()=>{

let value =
search.value.toLowerCase();

let filtered =
products.filter(product=>

product.name
.toLowerCase()
.includes(value)

);

displayProducts(filtered);

});

}