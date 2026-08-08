import { useParams, useNavigate } from "react-router-dom";
import { useStore } from "../context/StoreContext";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useCallback, useEffect, useMemo, useState } from "react";
import { addProductReview, updateProductReview, deleteProductReview, checkReviewEligibility, getProductReviews } from "../api/reviewApi";
import { ArrowLeft, Check, Loader2, MessageSquare, Minus, Plus, ShoppingCart, Star, XCircle, Zap } from "lucide-react";

const getReviewerName = (review) =>
  review?.name ||
  review?.customer?.name ||
  review?.user?.name ||
  "Customer";

const getRatingValue = (rating) => {
  const value = Number(rating);
  return Number.isFinite(value) ? Math.min(5, Math.max(0, value)) : 0;
};

function RatingStars({ rating, size = "h-5 w-5" }) {
  const value = getRatingValue(rating);

  return (
    <span className="flex items-center gap-1 text-yellow-500">
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          className={size}
          fill={index < Math.round(value) ? "currentColor" : "none"}
          aria-hidden="true"
        />
      ))}
    </span>
  );
}

export default function ProductDetail() {
  const { id } = useParams();
  const { products } = useStore();
  const { addToCart } = useCart();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsLoadError, setReviewsLoadError] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewDeleting, setReviewDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState("");
  const [canReview, setCanReview] = useState(false);
  const [eligibilityLoading, setEligibilityLoading] = useState(false);
  const [eligibilityError, setEligibilityError] = useState("");
  const [editingReview, setEditingReview] = useState(false);
  const [existingReview, setExistingReview] = useState(null);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: "",
  });

  const product = products.find((p) => p._id === id);
  const currentUserId = currentUser?._id || currentUser?.id;

  const currentUserReview = useMemo(() => {
    if (!currentUserId) return null;

    return reviews.find((review) => {
      const reviewUserId =
        review?.user?._id ||
        review?.user ||
        review?.customer?._id ||
        review?.customer;

      return reviewUserId && String(reviewUserId) === String(currentUserId);
    }) || null;
  }, [currentUserId, reviews]);
  const savedReview = currentUserReview || existingReview;

  const startEditingReview = (review = savedReview) => {
    if (!review) return;

    setExistingReview(review);
    setReviewForm({
      rating: Number(review?.rating) || 5,
      comment: review?.comment || "",
    });
    setEditingReview(true);
    setShowDeleteConfirm(false);
    setReviewError("");
    setReviewSuccess("");
  };

  const requestDeleteReview = () => {
    setShowDeleteConfirm(true);
    setReviewError("");
    setReviewSuccess("");
  };

  const handleDeleteReview = async () => {
    setReviewDeleting(true);
    setReviewError("");
    setReviewSuccess("");

    try {
      const token = localStorage.getItem("token");

      await deleteProductReview(id, token);

      setExistingReview(null);
      setEditingReview(false);
      setShowDeleteConfirm(false);

      setReviewForm({
        rating: 5,
        comment: "",
      });

      setReviewSuccess("Your review has been deleted.");

      await Promise.all([
        fetchReviews(),
        fetchReviewEligibility(),
      ]);
    } catch (error) {
  console.error("DELETE REVIEW ERROR:", error);
  console.error("RESPONSE:", error.response?.data);
  console.error("STATUS:", error.response?.status);

  setReviewError(
    error.response?.data?.message ||
      "Unable to delete your review."
  );
} finally {
      setReviewDeleting(false);
    }
  };
  const fetchReviews = useCallback(async () => {
    setReviewsLoading(true);
    setReviewsLoadError("");

    try {
      const { data } = await getProductReviews(id);
      setReviews(data.reviewsList || []);
    } catch (error) {
      setReviews([]);
      setReviewsLoadError(
        error.response?.data?.message ||
        "Unable to load reviews right now."
      );
    } finally {
      setReviewsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchReviews();
    }
  }, [fetchReviews, id]);

  const fetchReviewEligibility = useCallback(async () => {
    if (currentUser?.role !== "customer") {
      setCanReview(false);
      setExistingReview(null);
      setEligibilityError("");
      return;
    }

    setEligibilityLoading(true);
    setEligibilityError("");

    try {
      const token = localStorage.getItem("token");
      const { data } = await checkReviewEligibility(id, token);

      setCanReview(Boolean(data.canReview));
      setExistingReview(data.review || null);
    } catch (error) {
      setCanReview(false);
      setExistingReview(null);

      setEligibilityError(
        error.response?.data?.message ||
        "Unable to check review eligibility."
      );
    } finally {
      setEligibilityLoading(false);
    }
  }, [currentUser?.role, id]);

  useEffect(() => {
    fetchReviewEligibility();
  }, [fetchReviewEligibility]);

  const averageRating = useMemo(() => {
    if (reviews.length === 0) return 0;

    const total = reviews.reduce(
      (sum, review) => sum + getRatingValue(review?.rating),
      0
    );

    return total / reviews.length;
  }, [reviews]);

  const reviewCount = reviews.length;
  const displayRating = reviewCount > 0 ? averageRating.toFixed(1) : null;

  if (!product) {
    return (
      <div className="not-found-page">
        <h1>Product not found</h1>
        <button onClick={() => navigate("/")} className="btn-primary">Go Home</button>
      </div>
    );
  }

  const discountPct = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleAddToCart = () => {
    if (!currentUser) { navigate("/login"); return; }
    if (currentUser.role === "seller") return;
    addToCart(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    if (!currentUser) { navigate("/login"); return; }
    addToCart(product, qty);
    navigate("/cart");
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewError("");
    setReviewSuccess("");

    if (!currentUser) {
      setReviewError("Please login as a customer to write a review.");
      return;
    }

    if (currentUser.role !== "customer") {
      setReviewError("Reviews can only be submitted by customers.");
      return;
    }

    if (!canReview && !editingReview) {
      setReviewError("You can only review products from delivered orders.");
      return;
    }

    const rating = Number(reviewForm.rating);
    const comment = reviewForm.comment.trim();

    if (!comment) {
      setReviewError("Review comment is required.");
      return;
    }

    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      setReviewError("Rating must be between 1 and 5.");
      return;
    }

    setReviewSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      const reviewPayload = {
        rating,
        comment,
      };

      if (editingReview) {
        await updateProductReview(id, reviewPayload, token);
      } else {
        await addProductReview(id, reviewPayload, token);
      }

      setReviewForm({
        rating: 5,
        comment: "",
      });
      setReviewSuccess(
        editingReview
          ? "Your review has been updated."
          : "Your review has been submitted."
      );
      setEditingReview(false);

      await Promise.all([
        fetchReviews(),
        fetchReviewEligibility(),
      ]);
    } catch (error) {
      setReviewError(
        error.response?.data?.message ||
        "Unable to submit your review."
      );
    } finally {
      setReviewSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-7xl mx-auto px-4">

        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 inline-flex items-center gap-2 text-violet-600 font-medium hover:text-violet-700"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 bg-white rounded-3xl shadow-lg p-8">

          {/* Product Image */}
          <div className="relative">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-[500px] object-cover rounded-2xl"
            />

            {discountPct > 0 && (
              <span className="absolute top-4 left-4 bg-red-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                -{discountPct}% OFF
              </span>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col">

            <span className="text-sm font-medium text-violet-600 uppercase">
              {product.category}
            </span>

            <h1 className="text-4xl font-bold text-gray-900 mt-2">
              {product.name}
            </h1>

            <div className="flex items-center gap-3 mt-4">
              <RatingStars rating={reviewCount > 0 ? averageRating : product.rating} />

              <span className="text-gray-500">
                {reviewCount > 0
                  ? `${displayRating} (${reviewCount} ${reviewCount === 1 ? "review" : "reviews"})`
                  : "No reviews yet"}
              </span>
            </div>

            {/* Price */}
            <div className="mt-6 flex flex-wrap items-center gap-4">

              <span className="text-4xl font-bold text-violet-600">
                Rs. {product.price.toLocaleString()}
              </span>

              {product.originalPrice && (
                <>
                  <span className="text-gray-400 line-through text-xl">
                    Rs. {product.originalPrice.toLocaleString()}
                  </span>

                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                    Save Rs. {(product.originalPrice - product.price).toLocaleString()}
                  </span>
                </>
              )}

            </div>

            {/* Description */}
            <p className="mt-6 text-gray-600 leading-7">
              {product.description}
            </p>

            {/* Tags */}
            {product.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-6">
                {product.tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-violet-100 text-violet-700 px-3 py-1 rounded-full text-sm"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Stock */}
            <div className="mt-6">
              {product.stock > 0 ? (
                <span className="inline-flex items-center gap-2 rounded-full bg-green-100 text-green-700 px-4 py-2 text-sm font-medium">
                  <Check className="h-4 w-4" aria-hidden="true" />
                  In Stock ({product.stock} available)
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 rounded-full bg-red-100 text-red-700 px-4 py-2 text-sm font-medium">
                  <XCircle className="h-4 w-4" aria-hidden="true" />
                  Out of Stock
                </span>
              )}
            </div>

            {/* Purchase */}
            {currentUser?.role !== "seller" && product.stock > 0 && (
              <div className="mt-8">

                <div className="flex items-center gap-4 mb-6">

                  <span className="font-medium">
                    Quantity
                  </span>

                  <div className="flex items-center border rounded-xl overflow-hidden">

                    <button
                      onClick={() => setQty(Math.max(1, qty - 1))}
                      className="px-4 py-2 hover:bg-gray-100"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="h-4 w-4" aria-hidden="true" />
                    </button>

                    <span className="px-5 font-semibold">
                      {qty}
                    </span>

                    <button
                      onClick={() =>
                        setQty(Math.min(product.stock, qty + 1))
                      }
                      className="px-4 py-2 hover:bg-gray-100"
                      aria-label="Increase quantity"
                    >
                      <Plus className="h-4 w-4" aria-hidden="true" />
                    </button>

                  </div>

                </div>

                <div className="flex flex-col sm:flex-row gap-4">

                  <button
                    onClick={handleAddToCart}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 font-semibold transition ${added
                      ? "bg-green-600 text-white"
                      : "bg-violet-600 hover:bg-violet-700 text-white"
                      }`}
                  >
                    {added ? (
                      <>
                        <Check className="h-5 w-5" aria-hidden="true" />
                        Added to Cart
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="h-5 w-5" aria-hidden="true" />
                        Add to Cart
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleBuyNow}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl py-3 border-2 border-violet-600 text-violet-600 hover:bg-violet-50 font-semibold transition"
                  >
                    <Zap className="h-5 w-5" aria-hidden="true" />
                    Buy Now
                  </button>

                </div>

              </div>
            )}

            {!currentUser && (
              <div className="mt-8 rounded-xl bg-yellow-50 border border-yellow-200 p-4">
                <p className="text-yellow-800">
                  Please{" "}
                  <button
                    onClick={() => navigate("/login")}
                    className="font-semibold text-violet-600 hover:underline"
                  >
                    login
                  </button>{" "}
                  to purchase this product.
                </p>
              </div>
            )}

          </div>

        </div>

        <section className="mt-10 grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Customer Reviews
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  {reviewCount > 0
                    ? `${displayRating} average from ${reviewCount} ${reviewCount === 1 ? "review" : "reviews"}`
                    : "No reviews yet"}
                </p>
              </div>

              {reviewCount > 0 && (
                <div className="flex items-center gap-3">
                  <RatingStars rating={averageRating} />
                  <span className="text-lg font-semibold text-gray-900">
                    {displayRating}
                  </span>
                </div>
              )}
            </div>

            {reviewsLoadError && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                {reviewsLoadError}
              </div>
            )}

            {reviewsLoading ? (
              <div className="flex items-center justify-center gap-3 rounded-2xl border border-dashed border-gray-300 py-16 text-gray-500">
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                Loading reviews...
              </div>
            ) : reviews.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-6 py-14 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-violet-100 text-violet-600">
                  <MessageSquare className="h-8 w-8" aria-hidden="true" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  No reviews yet
                </h3>
                <p className="mt-2 text-gray-500">
                  Be the first customer to review this product.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((review, index) => {
                  const name = getReviewerName(review);
                  const reviewDate = review?.createdAt || review?.updatedAt;

                  return (
                    <article
                      key={review?._id || review?._id || index}
                      className="rounded-2xl border border-gray-200 p-5 transition hover:border-violet-200 hover:shadow-sm"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-violet-100 font-semibold text-violet-700">
                          {name.charAt(0).toUpperCase()}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="font-semibold text-gray-900">
                                  {name}
                                </h3>

                                {review?.verifiedPurchase === true && (
                                  <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                                    ✓ Verified Purchase
                                  </span>
                                )}
                              </div>

                              <RatingStars rating={review?.rating} size="h-4 w-4" />
                            </div>

                            {reviewDate && (
                              <time className="text-sm text-gray-400">
                                {new Date(reviewDate).toLocaleDateString("en-NP", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })}
                              </time>
                            )}
                          </div>

                          <p className="mt-3 leading-7 text-gray-600">
                            {review?.comment}
                          </p>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>

          <aside className="h-fit rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900">
              {editingReview ? "Edit Your Review" : "Write a Review"}
            </h2>

            {!currentUser ? (
              <p className="mt-4 rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
                Please login as a customer to write a review.
              </p>
            ) : currentUser.role !== "customer" ? (
              <p className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
                Reviews can only be submitted by customers.
              </p>
            ) : eligibilityLoading ? (
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Checking review eligibility...
              </div>
            ) : savedReview && !editingReview ? (
              <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-4">
                <p className="font-medium text-green-800">
                  ✓ You have already reviewed this product.
                </p>

                <p className="mt-1 text-sm text-green-700">
                  You can update or delete your review here.
                </p>

                <div className="mt-4 space-y-2">
                  <button
                    type="button"
                    onClick={() => startEditingReview(savedReview)}
                    className="w-full rounded-xl bg-green-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-800"
                  >
                    Edit Review
                  </button>

                  <button
                    type="button"
                    onClick={requestDeleteReview}
                    disabled={reviewDeleting || showDeleteConfirm}
                    className="w-full rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Delete Review
                  </button>
                </div>

                {showDeleteConfirm && (
                  <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4">
                    <p className="font-medium text-red-700">
                      Delete your review?
                    </p>

                    <p className="mt-1 text-sm text-red-600">
                      This will remove your rating and comment from this product.
                    </p>

                    <div className="mt-4 grid gap-2 sm:grid-cols-2">
                      <button
                        type="button"
                        onClick={() => setShowDeleteConfirm(false)}
                        disabled={reviewDeleting}
                        className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Cancel
                      </button>

                      <button
                        type="button"
                        onClick={handleDeleteReview}
                        disabled={reviewDeleting}
                        className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                      >
                        {reviewDeleting ? "Deleting..." : "Confirm Delete"}
                      </button>
                    </div>
                  </div>
                )}

                {reviewError && (
                  <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                    {reviewError}
                  </div>
                )}
              </div>
            ) : !canReview && !editingReview ? (
              <div className="mt-4 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
                <p className="font-medium text-yellow-800">
                  You can only review products from delivered orders.
                </p>

                <p className="mt-1 text-sm text-yellow-700">
                  {eligibilityError ||
                    "Once your order is delivered, you can share your experience here."}
                </p>
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} className="mt-5 space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Rating
                  </label>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }, (_, index) => {
                      const value = index + 1;

                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() =>
                            setReviewForm((prev) => ({
                              ...prev,
                              rating: value,
                            }))
                          }
                          className="rounded-lg p-1 text-yellow-500 transition hover:bg-yellow-50"
                          aria-label={`Rate ${value} ${value === 1 ? "star" : "stars"}`}
                        >
                          <Star
                            className="h-7 w-7"
                            fill={value <= reviewForm.rating ? "currentColor" : "none"}
                            aria-hidden="true"
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Comment
                  </label>

                  <textarea
                    rows={5}
                    value={reviewForm.comment}
                    onChange={(e) =>
                      setReviewForm((prev) => ({
                        ...prev,
                        comment: e.target.value,
                      }))
                    }
                    placeholder="Share what you liked, how it fit, or anything other customers should know..."
                    className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-200"
                  />
                </div>

                {reviewError && (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                    {reviewError}
                  </div>
                )}

                {reviewSuccess && (
                  <div className="rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700">
                    {reviewSuccess}
                  </div>
                )}
                {editingReview && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingReview(false);

                      setReviewForm({
                        rating: 5,
                        comment: "",
                      });

                      setReviewError("");
                      setReviewSuccess("");
                    }}
                    className="flex w-full items-center justify-center rounded-xl border border-gray-300 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
                  >
                    Cancel Edit
                  </button>
                )}
                <button
                  type="submit"
                  disabled={reviewSubmitting}
                  className="flex w-full items-center justify-center rounded-xl bg-violet-600 py-3 font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                >
                  {reviewSubmitting
                    ? editingReview
                      ? "Updating..."
                      : "Submitting..."
                    : editingReview
                      ? "Update Review"
                      : "Submit Review"}
                </button>

              </form>
            )}
          </aside>
        </section>
      </div>
    </div>

  );
}
