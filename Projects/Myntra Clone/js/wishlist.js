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

const wishlistContainer =
document.getElementById("wishlistItems");

let wishlist =
JSON.parse(localStorage.getItem("wishlist"))
|| [];

function renderWishlist(){

wishlistContainer.innerHTML="";

if(wishlist.length===0){

wishlistContainer.innerHTML=
"<h2 style='text-align:center'>No Items In Wishlist</h2>";

return;
}

wishlist.forEach((id,index)=>{

let product =
products.find(p=>p.id===id);

if(product){

wishlistContainer.innerHTML += `

<div class="wishlist-item">

<div>

<h3>${product.name}</h3>

<p>₹${product.price}</p>

</div>

<button
class="remove-btn"
onclick="removeWishlist(${index})">

Remove

</button>

</div>

`;

}

});

}

function removeWishlist(index){

wishlist.splice(index,1);

localStorage.setItem(
"wishlist",
JSON.stringify(wishlist)
);

renderWishlist();

}

renderWishlist();