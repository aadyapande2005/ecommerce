import { useEffect, useMemo, useState } from "react";
import axios from "axios";

const apiBaseUrl = import.meta.env.VITE_API_URL || "";

export default function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [customerName, setCustomerName] = useState("Student User");
  const [quantities, setQuantities] = useState({});

  const client = useMemo(() => {
    return axios.create({
      baseURL: apiBaseUrl,
    });
  }, []);

  async function loadProducts() {
    try {
      setLoading(true);
      const res = await client.get("/api/products");
      setProducts(res.data);
      const initialQuantities = {};
      for (const item of res.data) {
        initialQuantities[item._id] = 1;
      }
      setQuantities(initialQuantities);
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to load products.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  async function handleBuy(productId) {
    try {
      setMessage("");
      const qty = Number(quantities[productId] || 1);
      const res = await client.post("/api/purchase", {
        productId,
        quantity: qty,
        customerName,
      });
      setMessage(res.data.message);
      await loadProducts();
    } catch (error) {
      setMessage(error.response?.data?.message || "Purchase failed.");
    }
  }

  return (
    <div className="page">
      <header>
        <h1>Minimal E-Commerce</h1>
        <p>Browse products and simulate purchase.</p>
      </header>

      <section className="customer">
        <label htmlFor="customerName">Customer Name</label>
        <input
          id="customerName"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          placeholder="Enter name"
        />
      </section>

      {message && <p className="message">{message}</p>}

      {loading ? (
        <p>Loading products...</p>
      ) : (
        <div className="grid">
          {products.map((product) => (
            <article key={product._id} className="card">
              <h2>{product.name}</h2>
              <p>{product.description}</p>
              <p>Price: Rs {product.price}</p>
              <p>Stock: {product.stock}</p>
              <div className="buy-row">
                <input
                  type="number"
                  min="1"
                  max={product.stock || 1}
                  value={quantities[product._id] || 1}
                  onChange={(e) =>
                    setQuantities((prev) => ({
                      ...prev,
                      [product._id]: e.target.value,
                    }))
                  }
                />
                <button
                  disabled={product.stock === 0}
                  onClick={() => handleBuy(product._id)}
                >
                  {product.stock === 0 ? "Out of stock" : "Buy"}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
