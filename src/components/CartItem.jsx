import { useCart } from "../context/CartContext";

export default function CartItem({ item }) {
  const { updateQuantity, removeFromCart } = useCart();

  return (
    <div className="cart-item">
      <div className="cart-item-image">
        <img src={item.image} alt={item.name} />
      </div>
      <div className="cart-item-details">
        <h4 className="cart-item-name">{item.name}</h4>
        <p className="cart-item-price">Rs. {item.price.toLocaleString()} each</p>
        <div className="cart-item-controls">
          <div className="qty-control">
            <button className="qty-btn" onClick={() => updateQuantity(item.productId, item.quantity - 1)}>−</button>
            <span className="qty-value">{item.quantity}</span>
            <button className="qty-btn" onClick={() => updateQuantity(item.productId, item.quantity + 1)}>+</button>
          </div>
          <button className="remove-btn" onClick={() => removeFromCart(item.productId)}>🗑 Remove</button>
        </div>
      </div>
      <div className="cart-item-total">
        Rs. {(item.price * item.quantity).toLocaleString()}
      </div>
    </div>
  );
}
