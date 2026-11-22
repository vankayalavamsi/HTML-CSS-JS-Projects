const products = [

{
id:1,
name:"Roadster Shirt",
price:899
},

{
id:2,
name:"Nike Shoes",
price:2499
},

{
id:3,
name:"Zara Dress",
price:1299
},

{
id:4,
name:"H&M T-Shirt",
price:699
},

{
id:5,
name:"Puma Sneakers",
price:1899
},

{
id:6,
name:"Denim Jacket",
price:1599
}

];

const cartContainer =
document.getElementById("cartItems");

const totalPrice =
document.getElementById("totalPrice");

let cart =
JSON.parse(localStorage.getItem("cart"))
|| [];

function renderCart(){

cartContainer.innerHTML="";

let total = 0;

cart.forEach((id,index)=>{

let product =
products.find(p=>p.id===id);

if(product){

total += product.price;

cartContainer.innerHTML += `

<div class="cart-item">

<div>

<h3>${product.name}</h3>

<p>₹${product.price}</p>

</div>

<button
class="remove-btn"
onclick="removeItem(${index})">

Remove

</button>

</div>

`;

}

});

totalPrice.innerText =
`Total: ₹${total}`;

}

function removeItem(index){

cart.splice(index,1);

localStorage.setItem(
"cart",
JSON.stringify(cart)
);

renderCart();

}

renderCart();

document
.getElementById("checkoutBtn")
.addEventListener("click",()=>{

if(cart.length===0){

alert("Cart is Empty");

}
else{

alert(
"Order Placed Successfully 🎉"
);

localStorage.removeItem("cart");

location.reload();

}

});