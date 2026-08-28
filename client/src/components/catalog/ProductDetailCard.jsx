import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Star,
  ShoppingCart,
  Heart,
  Check,
  AlertCircle,
  MessageSquare,
  Award,
  Loader,
} from "lucide-react";
import Badge from "../common/Badge";
import VariantSelector from "../detail/VariantSelector";
import ProductGallery from "../detail/ProductGallery";
import { useAuth } from "../../context/AuthContext";
import {
  addToWishlist,
  removeFromWishlist,
  getWishlist,
  getProductReviews,
  createReview,
} from "../../services/api";

export default function ProductDetailCard({
  product,
  onAddToCart,
  loadingAddToCart = false,
}) {
  const { id, title, price, description, category, image_url, variants } =
    product || {};
  const { user } = useAuth();
  const navigate = useNavigate();

  const [inWishlist, setInWishlist] = useState(false);
  const [loadingWishlist, setLoadingWishlist] = useState(false);
  const [wishlistToast, setWishlistToast] = useState("");
  const [wishlistError, setWishlistError] = useState("");

  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [loadingReviews, setLoadingReviews] = useState(true);

  // Review Form state
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState("");
  const [reviewError, setReviewError] = useState("");

  // Check Wishlist Status
  useEffect(() => {
    let isMounted = true;
    const checkWishlist = async () => {
      if (user && id) {
        try {
          const items = await getWishlist();
          if (isMounted && Array.isArray(items)) {
            const exists = items.some((item) => item.product_id === id);
            setInWishlist(exists);
          }
        } catch (err) {
          console.error("Failed to check wishlist status", err);
        }
      }
    };
    checkWishlist();
    return () => {
      isMounted = false;
    };
  }, [user, id]);

  // Fetch Reviews
  const fetchReviews = async () => {
    if (!id) return;
    setLoadingReviews(true);
    try {
      const data = await getProductReviews(id);
      if (data) {
        setReviews(data.reviews || []);
        setAverageRating(data.average_rating || 0);
        setTotalReviews(data.total_reviews || 0);
      }
    } catch (err) {
      console.error("Failed to fetch product reviews", err);
    } finally {
      setLoadingReviews(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [id]);

  const handleWishlistToggle = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    setLoadingWishlist(true);
    setWishlistToast("");
    setWishlistError("");

    try {
      if (inWishlist) {
        await removeFromWishlist(id);
        setInWishlist(false);
        setWishlistToast("Removed product from your wishlist.");
      } else {
        await addToWishlist(id);
        setInWishlist(true);
        setWishlistToast(
          "Added product to your wishlist! View it anytime on /wishlist.",
        );
      }
      window.dispatchEvent(new Event("wishlist-updated"));
      setTimeout(() => setWishlistToast(""), 4000);
    } catch (err) {
      const msg =
        err.response?.data?.detail || "Could not update wishlist status.";
      setWishlistError(msg);
      setTimeout(() => setWishlistError(""), 4000);
    } finally {
      setLoadingWishlist(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate("/login");
      return;
    }

    setSubmittingReview(true);
    setReviewSuccess("");
    setReviewError("");

    try {
      const result = await createReview({
        product_id: id,
        rating: Number(rating),
        comment: comment.trim() || undefined,
      });

      const pointsEarned = result?.points_awarded || 50;
      setReviewSuccess(
        `Review submitted successfully! You earned +${pointsEarned} loyalty reward points.`,
      );
      setComment("");
      setRating(5);

      // Dispatch reward points update event for header/navbar to pick up
      window.dispatchEvent(new Event("rewards-updated"));

      // Refresh reviews list
      await fetchReviews();

      setTimeout(() => setReviewSuccess(""), 5000);
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        "Failed to submit review. Please try again.";
      setReviewError(msg);
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="bg-white border border-[#e3e8f0] rounded-2xl p-6 lg:p-10 space-y-12">
      {/* Top Section: Gallery & Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Gallery Section */}
        <ProductGallery imageUrl={image_url} title={title} />

        {/* Product Details Section */}
        <div className="space-y-6">
          <div>
            {category && (
              <Badge variant="info" className="mb-2">
                {category.name || category}
              </Badge>
            )}
            <h1 className="text-2xl lg:text-3xl font-bold text-[#171c29]">
              {title}
            </h1>

            <div className="flex items-center gap-2 mt-3">
              <div className="flex text-[#eb9917]">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.round(averageRating)
                        ? "fill-[#eb9917] text-[#eb9917]"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs font-semibold text-[#707a8c]">
                {averageRating > 0
                  ? `${averageRating.toFixed(1)} (${totalReviews} ${
                      totalReviews === 1 ? "Review" : "Reviews"
                    })`
                  : `${totalReviews} Reviews`}
              </span>
            </div>
          </div>

          {/* Price Tag */}
          <div className="text-3xl font-bold text-[#2663eb]">
            ${Number(price || 0).toFixed(2)}
          </div>

          {/* Description */}
          <p className="text-sm text-[#707a8c] leading-relaxed">
            {description ||
              "High quality clothes & accessories designed for daily comfort and timeless style."}
          </p>

          <hr className="border-[#e3e8f0]" />

          {/* Action Buttons: Add to Cart & Add to Wishlist */}
          <div className="space-y-4">
            <VariantSelector
              variants={variants || []}
              onAddToCart={onAddToCart}
              loading={loadingAddToCart}
            />

            <button
              onClick={handleWishlistToggle}
              disabled={loadingWishlist}
              className={`w-full flex items-center justify-center gap-2 border px-6 py-3 rounded-xl font-semibold text-sm transition-colors ${
                inWishlist
                  ? "border-[#db2626] text-[#db2626] bg-[#fef2f2] hover:bg-[#fee2e2]"
                  : "border-[#e3e8f0] text-[#171c29] bg-white hover:bg-[#f7fafc]"
              }`}
            >
              <Heart
                className={`w-4 h-4 ${
                  inWishlist
                    ? "fill-[#db2626] text-[#db2626]"
                    : "text-[#707a8c]"
                }`}
              />
              <span>
                {inWishlist ? "Saved in Wishlist" : "Add to Wishlist"}
              </span>
            </button>
          </div>

          {/* Wishlist Status Confirmation Banner / Toast */}
          {wishlistToast && (
            <div className="bg-[#dcfce7] border border-[#17a34a] text-[#17a34a] px-4 py-3 rounded-xl flex items-center justify-between text-sm font-medium">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>{wishlistToast}</span>
              </div>
              <Link to="/wishlist" className="underline font-bold text-xs">
                View Wishlist
              </Link>
            </div>
          )}

          {wishlistError && (
            <div className="bg-[#fee2e2] border border-[#db2626] text-[#db2626] px-4 py-3 rounded-xl flex items-center gap-2 text-sm font-medium">
              <AlertCircle className="w-4 h-4" />
              <span>{wishlistError}</span>
            </div>
          )}
        </div>
      </div>

      <hr className="border-[#e3e8f0]" />

      {/* Product Reviews Section */}
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-[#171c29] flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[#2663eb]" />
              Product Reviews & Ratings
            </h2>
            <p className="text-xs text-[#707a8c] mt-1">
              Customer feedback and ratings. Leave a review to earn +50 loyalty
              points!
            </p>
          </div>

          <div className="flex items-center gap-3 bg-[#f8fafc] border border-[#e3e8f0] px-4 py-2 rounded-xl">
            <div className="flex text-[#eb9917]">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.round(averageRating)
                      ? "fill-[#eb9917] text-[#eb9917]"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm font-bold text-[#171c29]">
              {averageRating > 0 ? averageRating.toFixed(1) : "0.0"} / 5.0
            </span>
            <span className="text-xs text-[#707a8c]">
              ({totalReviews} {totalReviews === 1 ? "review" : "reviews"})
            </span>
          </div>
        </div>

        {/* Write a Review Form (Accessible if logged in) */}
        <div className="bg-[#f8fafc] border border-[#e3e8f0] rounded-2xl p-6">
          <h3 className="text-base font-bold text-[#171c29] mb-3 flex items-center gap-2">
            <Award className="w-4 h-4 text-[#eb9917]" />
            Write a Review
            <span className="bg-[#eb9917] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              Earn +50 Points
            </span>
          </h3>

          {user ? (
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#171c29] mb-1">
                  Your Rating
                </label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 focus:outline-none transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= (hoverRating || rating)
                            ? "fill-[#eb9917] text-[#eb9917]"
                            : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-xs font-semibold text-[#707a8c]">
                    {rating} out of 5 Stars
                  </span>
                </div>
              </div>

              <div>
                <label
                  htmlFor="review-comment"
                  className="block text-xs font-semibold text-[#171c29] mb-1"
                >
                  Your Review / Feedback
                </label>
                <textarea
                  id="review-comment"
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share details of your experience with this product..."
                  className="w-full border border-[#e3e8f0] rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2663eb] text-[#171c29] bg-white"
                />
              </div>

              {reviewSuccess && (
                <div className="bg-[#dcfce7] border border-[#17a34a] text-[#17a34a] px-4 py-3 rounded-xl flex items-center gap-2 text-sm font-medium">
                  <Check className="w-4 h-4" />
                  <span>{reviewSuccess}</span>
                </div>
              )}

              {reviewError && (
                <div className="bg-[#fee2e2] border border-[#db2626] text-[#db2626] px-4 py-3 rounded-xl flex items-center gap-2 text-sm font-medium">
                  <AlertCircle className="w-4 h-4" />
                  <span>{reviewError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={submittingReview}
                className="bg-[#2663eb] hover:bg-[#1d4ed8] text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {submittingReview ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Star className="w-4 h-4 fill-current text-[#eb9917]" />
                    <span>Submit Review (+50 Points)</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white border border-[#e3e8f0] p-4 rounded-xl">
              <p className="text-sm text-[#707a8c]">
                Please sign in to write a review and claim your +50 loyalty
                reward points.
              </p>
              <button
                onClick={() => navigate("/login")}
                className="bg-[#2663eb] text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-[#1d4ed8] transition-colors shrink-0"
              >
                Sign In to Review
              </button>
            </div>
          )}
        </div>

        {/* Reviews List */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-[#171c29]">
            Customer Reviews ({reviews.length})
          </h3>

          {loadingReviews ? (
            <div className="flex justify-center py-8 text-[#707a8c]">
              <Loader className="w-6 h-6 animate-spin text-[#2663eb]" />
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-8 bg-[#f8fafc] border border-dashed border-[#e3e8f0] rounded-xl text-[#707a8c] text-sm">
              No reviews yet. Be the first to review this product and earn +50
              loyalty points!
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="bg-white border border-[#e3e8f0] rounded-xl p-4 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-[#171c29]">
                        {rev.user_name || "Verified Buyer"}
                      </span>
                      <span className="text-[10px] bg-[#f2f5fa] text-[#2663eb] font-bold px-2 py-0.5 rounded-full">
                        Verified Purchase
                      </span>
                    </div>
                    <span className="text-xs text-[#707a8c]">
                      {rev.created_at
                        ? new Date(rev.created_at).toLocaleDateString()
                        : ""}
                    </span>
                  </div>

                  <div className="flex text-[#eb9917]">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < rev.rating
                            ? "fill-[#eb9917] text-[#eb9917]"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>

                  {rev.comment && (
                    <p className="text-sm text-[#707a8c] leading-relaxed">
                      {rev.comment}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
