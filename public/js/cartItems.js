// Get if the cart is empty or not
// The cart is empty if the cartItems array in localStorage is empty
// If the cart is empty, the cartItems array will be empty
// If the cart is not empty, the cartItems array will have at least one item
cartIsEmpty = localStorage.getItem('cartItems') === null || localStorage.getItem('cartItems') === '[]';

// If the cart is empty, show the empty cart message
if (cartIsEmpty) {
    document.getElementById('items-count').innerHTML = '0';
} else {
    // If the cart is not empty, show the number of items in the cart
    document.getElementById('items-count').innerHTML = JSON.parse(localStorage.getItem('cartItems')).length;
}