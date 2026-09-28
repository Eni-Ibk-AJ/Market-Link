import { useEffect, useState } from "react";
import {
  BarChart3,
  ClipboardList,
  Package,
  Plus,
  Store,
  X,
} from "lucide-react";
import DashboardSidebar from "../components/DashboardSidebar";
import EmptyState from "../components/EmptyState";
import AsyncStatus from "../components/AsyncStatus";
import useApiCollection from "../hooks/useApiCollection";
import { api, getApiErrorMessage } from "../services/api";
import "../components/Common.css";
import "./RoleDashboards.css";

const vendorNav = [
  { id: "profile", label: "Profile", icon: Store },
  { id: "stock", label: "Weekly stock", icon: Package },
  { id: "orders", label: "Pre-orders", icon: ClipboardList },
  { id: "insights", label: "Insights & reviews", icon: BarChart3 },
];
const categories = [
  "Vegetables",
  "Fruits",
  "Dairy",
  "Baked Goods",
  "Meat & Poultry",
  "Herbs & Spices",
  "Others",
];
const emptyProduct = {
  name: "",
  category: "",
  description: "",
  price: "",
  unit: "",
  stockQuantity: "",
  imageUrl: "",
};
const emptyProfile = {
  stallName: "",
  description: "",
  operatingDays: "",
  pickupTimeSlots: "",
  cutoffTime: "",
  address: "",
  latitude: "",
  longitude: "",
};

export default function VendorDashboard() {
  const [active, setActive] = useState("profile");
  const {
    records: products,
    loading: productsLoading,
    error: productsError,
    reload: reloadProducts,
  } = useApiCollection(api.products.myProducts);
  const {
    records: orders,
    loading: ordersLoading,
    error: ordersError,
    reload: reloadOrders,
  } = useApiCollection(api.orders.farmer);
  const [profile, setProfile] = useState(null);
  const [profileForm, setProfileForm] = useState(emptyProfile);
  const [reviews, setReviews] = useState([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState("");
  const [reviewsError, setReviewsError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [productForm, setProductForm] = useState(emptyProduct);
  const [responseText, setResponseText] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    document.title = "Farmer workspace | MarketLink";
  }, []);
  useEffect(() => {
    let current = true;
    api.user
      .profile()
      .then(async (user) => {
        if (!current) return;
        setProfile(user);
        const farmerProfile = user.farmerProfile || {};
        setProfileForm({
          stallName: farmerProfile.stallName || "",
          description: farmerProfile.description || "",
          operatingDays: (farmerProfile.operatingDays || []).join(", "),
          pickupTimeSlots: (farmerProfile.pickupTimeSlots || []).join(", "),
          cutoffTime: farmerProfile.cutoffTime || "",
          address: farmerProfile.location?.address || "",
          latitude: farmerProfile.location?.latitude ?? "",
          longitude: farmerProfile.location?.longitude ?? "",
        });
        if (user._id) {
          try {
            setReviews(await api.reviews.forFarmer(user._id));
          } catch (requestError) {
            if (current) setReviewsError(getApiErrorMessage(requestError));
          }
        }
      })
      .catch((requestError) => {
        if (current) setProfileError(getApiErrorMessage(requestError));
      })
      .finally(() => {
        if (current) setLoadingProfile(false);
      });
    return () => {
      current = false;
    };
  }, []);

  async function saveProfile(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const result = await api.user.updateFarmerProfile({
        stallName: profileForm.stallName,
        description: profileForm.description,
        operatingDays: profileForm.operatingDays
          .split(",")
          .map((value) => value.trim())
          .filter(Boolean),
        pickupTimeSlots: profileForm.pickupTimeSlots
          .split(",")
          .map((value) => value.trim())
          .filter(Boolean),
        cutoffTime: profileForm.cutoffTime,
        address: profileForm.address,
        latitude:
          profileForm.latitude === ""
            ? undefined
            : Number(profileForm.latitude),
        longitude:
          profileForm.longitude === ""
            ? undefined
            : Number(profileForm.longitude),
      });
      setNotice(result.message);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  }

  async function saveProduct(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");
    try {
      await api.products.create({
        ...productForm,
        price: Number(productForm.price),
        stockQuantity: Number(productForm.stockQuantity),
      });
      setProductForm(emptyProduct);
      setModalOpen(false);
      setNotice("Product added successfully.");
      reloadProducts();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  }

  async function updateOrder(orderId, status) {
    setError("");
    setNotice("");
    try {
      const result = await api.orders.updateStatus(orderId, status);
      setNotice(result.message);
      reloadOrders();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    }
  }

  async function respondToReview(reviewId) {
    const comment = responseText[reviewId]?.trim();
    if (!comment) return;
    try {
      const result = await api.reviews.respond(reviewId, comment);
      setReviews((current) =>
        current.map((item) => (item._id === reviewId ? result.review : item)),
      );
      setResponseText((current) => ({ ...current, [reviewId]: "" }));
    } catch (requestError) {
      setReviewsError(getApiErrorMessage(requestError));
    }
  }

  const pendingOrders = orders.filter((order) =>
    ["placed", "accepted"].includes(order.status),
  ).length;
  const revenue = orders
    .filter((order) => order.status === "completed")
    .reduce((total, order) => total + order.totalAmount, 0);

  return (
    <div className="role-dashboard page-shell">
      <div className="content-width">
        <header className="role-heading">
          <div>
            <span className="eyebrow">Producer workspace</span>
            <h1>Farmer dashboard</h1>
            <p>
              Manage your profile, weekly availability, and customer pre-orders.
            </p>
          </div>
          <span className="role-date">
            {profile?.farmerProfile?.stallName || "Vendor portal"}
          </span>
        </header>
        {(error || notice) && (
          <p
            className={error ? "form-error" : "form-success"}
            role={error ? "alert" : "status"}
          >
            {error || notice}
          </p>
        )}
        <div className="role-dashboard-layout">
          <DashboardSidebar
            label="Vendor tools"
            items={vendorNav}
            active={active}
            onChange={setActive}
          />
          <main className="role-workspace">
            {active === "profile" && (
              <section className="workspace-card panel">
                <div className="role-section-heading">
                  <div>
                    <span className="eyebrow">Your listing</span>
                    <h2>Profile management</h2>
                    <p>Keep your stall and pickup details up to date.</p>
                  </div>
                  <Store size={21} />
                </div>
                <AsyncStatus loading={loadingProfile} error={profileError} />
                <form className="role-form" onSubmit={saveProfile}>
                  <label className="field">
                    Stall or farm name
                    <input
                      value={profileForm.stallName}
                      onChange={(event) =>
                        setProfileForm((current) => ({
                          ...current,
                          stallName: event.target.value,
                        }))
                      }
                      required
                    />
                  </label>
                  <label className="field">
                    Operating days
                    <input
                      value={profileForm.operatingDays}
                      onChange={(event) =>
                        setProfileForm((current) => ({
                          ...current,
                          operatingDays: event.target.value,
                        }))
                      }
                      placeholder="Separate days with commas"
                    />
                  </label>
                  <label className="field">
                    Pickup time slots
                    <input
                      value={profileForm.pickupTimeSlots}
                      onChange={(event) =>
                        setProfileForm((current) => ({
                          ...current,
                          pickupTimeSlots: event.target.value,
                        }))
                      }
                      placeholder="Separate time slots with commas"
                    />
                  </label>
                  <label className="field">
                    Order cutoff time
                    <input
                      value={profileForm.cutoffTime}
                      onChange={(event) =>
                        setProfileForm((current) => ({
                          ...current,
                          cutoffTime: event.target.value,
                        }))
                      }
                      placeholder="e.g. 5:00 PM"
                    />
                  </label>
                  <label className="field">
                    Description
                    <textarea
                      value={profileForm.description}
                      onChange={(event) =>
                        setProfileForm((current) => ({
                          ...current,
                          description: event.target.value,
                        }))
                      }
                    />
                  </label>
                  <label className="field">
                    Pickup address
                    <input
                      value={profileForm.address}
                      onChange={(event) =>
                        setProfileForm((current) => ({
                          ...current,
                          address: event.target.value,
                        }))
                      }
                    />
                  </label>
                  <div className="coordinate-fields">
                    <label className="field">
                      Latitude
                      <input
                        value={profileForm.latitude}
                        onChange={(event) =>
                          setProfileForm((current) => ({
                            ...current,
                            latitude: event.target.value,
                          }))
                        }
                        inputMode="decimal"
                      />
                    </label>
                    <label className="field">
                      Longitude
                      <input
                        value={profileForm.longitude}
                        onChange={(event) =>
                          setProfileForm((current) => ({
                            ...current,
                            longitude: event.target.value,
                          }))
                        }
                        inputMode="decimal"
                      />
                    </label>
                  </div>
                  <div className="form-bottom">
                    <span>
                      Profile updates are saved to your farmer account.
                    </span>
                    <button
                      className="button button-primary"
                      type="submit"
                      disabled={saving || loadingProfile}
                    >
                      {saving ? "Saving…" : "Save profile"}
                    </button>
                  </div>
                </form>
              </section>
            )}

            {active === "stock" && (
              <section className="workspace-card panel">
                <div className="role-section-heading">
                  <div>
                    <span className="eyebrow">Weekly availability</span>
                    <h2>Stock & pricing</h2>
                    <p>Keep current product availability in one place.</p>
                  </div>
                  <button
                    className="button button-primary"
                    type="button"
                    onClick={() => setModalOpen(true)}
                  >
                    <Plus size={17} /> Add product
                  </button>
                </div>
                <AsyncStatus
                  loading={productsLoading}
                  error={productsError}
                  onRetry={reloadProducts}
                />
                {!productsLoading && !productsError && (
                  <div className="data-table-wrap">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Product</th>
                          <th>Category</th>
                          <th>Price</th>
                          <th>Unit</th>
                          <th>Stock quantity</th>
                          <th>Availability</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map((product) => (
                          <tr key={product._id}>
                            <td>{product.name}</td>
                            <td>{product.category}</td>
                            <td>{product.price}</td>
                            <td>{product.unit}</td>
                            <td>{product.stockQuantity}</td>
                            <td>
                              {product.isAvailable
                                ? "Available"
                                : "Unavailable"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {products.length === 0 && (
                      <div className="blank-table-note">
                        No products listed yet
                      </div>
                    )}
                  </div>
                )}
              </section>
            )}

            {active === "orders" && (
              <section className="workspace-card panel">
                <div className="role-section-heading">
                  <div>
                    <span className="eyebrow">Incoming requests</span>
                    <h2>Pre-order queue</h2>
                    <p>Review requests and manage order status.</p>
                  </div>
                  <span className="table-count">{orders.length} incoming</span>
                </div>
                <AsyncStatus
                  loading={ordersLoading}
                  error={ordersError}
                  onRetry={reloadOrders}
                />
                {!ordersLoading && !ordersError && (
                  <div className="data-table-wrap">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Order</th>
                          <th>Customer</th>
                          <th>Items</th>
                          <th>Pickup time</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map((order) => (
                          <tr key={order._id}>
                            <td>{order._id.slice(-7)}</td>
                            <td>
                              {order.customer?.firstName}{" "}
                              {order.customer?.lastName}
                            </td>
                            <td>
                              {order.items
                                .map(
                                  (item) =>
                                    `${item.product?.name || "Product"} × ${item.quantity}`,
                                )
                                .join(", ")}
                            </td>
                            <td>
                              {new Date(order.pickupDate).toLocaleDateString()}{" "}
                              · {order.pickupTimeSlot}
                            </td>
                            <td>{order.status}</td>
                            <td>
                              {order.status === "placed" && (
                                <>
                                  <button
                                    className="table-action"
                                    type="button"
                                    onClick={() =>
                                      updateOrder(order._id, "accepted")
                                    }
                                  >
                                    Accept
                                  </button>
                                  <button
                                    className="table-action danger"
                                    type="button"
                                    onClick={() =>
                                      updateOrder(order._id, "declined")
                                    }
                                  >
                                    Decline
                                  </button>
                                </>
                              )}
                              {order.status === "accepted" && (
                                <button
                                  className="table-action"
                                  type="button"
                                  onClick={() =>
                                    updateOrder(order._id, "ready_for_pickup")
                                  }
                                >
                                  Ready for pickup
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {orders.length === 0 && (
                      <div className="blank-table-note">No incoming orders</div>
                    )}
                  </div>
                )}
              </section>
            )}

            {active === "insights" && (
              <>
                <AsyncStatus
                  loading={ordersLoading}
                  error={ordersError}
                  onRetry={reloadOrders}
                />
                <div className="metric-grid">
                  <article className="metric-card panel">
                    <span>Total orders</span>
                    <strong>{orders.length}</strong>
                    <ClipboardList size={20} />
                  </article>
                  <article className="metric-card panel">
                    <span>Pending orders</span>
                    <strong>{pendingOrders}</strong>
                    <Package size={20} />
                  </article>
                  <article className="metric-card panel">
                    <span>Revenue</span>
                    <strong>{revenue}</strong>
                    <BarChart3 size={20} />
                  </article>
                </div>
                <section className="workspace-card panel">
                  <div className="role-section-heading">
                    <div>
                      <span className="eyebrow">Customer feedback</span>
                      <h2>Reviews & responses</h2>
                    </div>
                    <span className="table-count">
                      {reviews.length} reviews
                    </span>
                  </div>
                  <AsyncStatus loading={loadingProfile} error={reviewsError} />
                  {!loadingProfile &&
                    !reviewsError &&
                    (reviews.length ? (
                      reviews.map((review) => (
                        <article
                          className="review-response-row"
                          key={review._id}
                        >
                          <div>
                            <strong>
                              {review.customer?.firstName}{" "}
                              {review.customer?.lastName}
                            </strong>
                            <span>{review.rating} / 5</span>
                            <p>{review.comment}</p>
                          </div>
                          {review.farmerResponse?.comment ? (
                            <p className="existing-response">
                              Your response: {review.farmerResponse.comment}
                            </p>
                          ) : (
                            <div className="review-response-form">
                              <label className="field">
                                Respond
                                <textarea
                                  value={responseText[review._id] || ""}
                                  onChange={(event) =>
                                    setResponseText((current) => ({
                                      ...current,
                                      [review._id]: event.target.value,
                                    }))
                                  }
                                />
                              </label>
                              <button
                                className="button button-light"
                                type="button"
                                onClick={() => respondToReview(review._id)}
                              >
                                Send response
                              </button>
                            </div>
                          )}
                        </article>
                      ))
                    ) : (
                      <EmptyState
                        title="No reviews yet"
                        detail="Customer feedback will appear here."
                        icon={Store}
                      />
                    ))}
                </section>
              </>
            )}
          </main>
        </div>
      </div>
      {modalOpen && (
        <div
          className="modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setModalOpen(false);
          }}
        >
          <section
            className="product-modal panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="product-modal-title"
          >
            <div className="modal-heading">
              <div>
                <span className="eyebrow">Weekly stock</span>
                <h2 id="product-modal-title">Add a product</h2>
              </div>
              <button
                className="modal-close"
                type="button"
                onClick={() => setModalOpen(false)}
                aria-label="Close modal"
              >
                <X size={19} />
              </button>
            </div>
            <form className="role-form" onSubmit={saveProduct}>
              <label className="field">
                Product name
                <input
                  value={productForm.name}
                  onChange={(event) =>
                    setProductForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  required
                />
              </label>
              <label className="field">
                Category
                <select
                  value={productForm.category}
                  onChange={(event) =>
                    setProductForm((current) => ({
                      ...current,
                      category: event.target.value,
                    }))
                  }
                  required
                >
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category}>{category}</option>
                  ))}
                </select>
              </label>
              <label className="field">
                Description
                <textarea
                  value={productForm.description}
                  onChange={(event) =>
                    setProductForm((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                />
              </label>
              <label className="field">
                Image URL
                <input
                  type="url"
                  value={productForm.imageUrl}
                  onChange={(event) =>
                    setProductForm((current) => ({
                      ...current,
                      imageUrl: event.target.value,
                    }))
                  }
                  placeholder="https://…"
                />
              </label>
              <div className="coordinate-fields">
                <label className="field">
                  Price
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={productForm.price}
                    onChange={(event) =>
                      setProductForm((current) => ({
                        ...current,
                        price: event.target.value,
                      }))
                    }
                    required
                  />
                </label>
                <label className="field">
                  Unit
                  <input
                    value={productForm.unit}
                    onChange={(event) =>
                      setProductForm((current) => ({
                        ...current,
                        unit: event.target.value,
                      }))
                    }
                    placeholder="kg, lb, piece"
                    required
                  />
                </label>
              </div>
              <label className="field">
                Stock quantity
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={productForm.stockQuantity}
                  onChange={(event) =>
                    setProductForm((current) => ({
                      ...current,
                      stockQuantity: event.target.value,
                    }))
                  }
                  required
                />
              </label>
              {error && (
                <p className="form-error" role="alert">
                  {error}
                </p>
              )}
              <div className="form-bottom">
                <button
                  className="button button-light"
                  type="button"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className="button button-primary"
                  type="submit"
                  disabled={saving}
                >
                  {saving ? "Saving…" : "Save product"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
