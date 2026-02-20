"use client";

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "next/navigation";
import { addRecentlyViewed } from "@/store/features/recentlyViewedSlice";
import { getProduct } from "@/store/features/productSlice";
import AddToCartButton from "@/components/AddToCart";
import WishlistButton from "@/components/WishlistButton";
import Loading from "@/components/Loading";
import Rating from "@/components/Rating";
import { formatAmount } from "@/lib/utils";
import Image from "next/image";
import { AiOutlineExclamation } from "react-icons/ai";
import ProductTabs from "@/components/ProductTabs";
import axios from "axios";
import Accordion from "@/components/Accordion";
import { CheckCircle } from 'lucide-react';
import {
  GoChevronDown,
  GoChevronUp,
  GoChevronLeft,
  GoChevronRight,
} from "react-icons/go"; 
import { formatDistanceToNow } from "date-fns";


async function fetchProduct(id) {
  const res = await fetch(`https://www.filstore.com.ng/api/products/${id}`, {
    cache: 'no-store'
  });
  const data = await res.json();
  return data.product || data;
}



export default function ProductDetailsPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const {
    single: product,
    loading,
    error,
  } = useSelector((state) => state.products);
  const { user } = useSelector((state) => state.auth);

  const points = [
    { img: "/express.png", text: "Fast And Reliable Delivery" },
    { img: "/calender.png", text: "7 Days Return" },
    { img: "/support.png", text: "24/7 Support" },
    {
      img: "/certified.png",
      text: "Best Quality from many years in the market",
    },
  ];

  const deliveryOptions = [
    { img: "/regular-bus.png", text: "Regular Delivery (1-3 Working Days)" },
    {
      img: "/express-bus.png",
      text: "Express Delivery (Within 24 hours, for orders placed before 10am)",
    },
    { img: "/free-bus.png", text: "Free Delivery on Thursdays" },
  ];

  const formatContent = (description) => {
    if (!description) return null;

    const Content = () => {
      const [expanded, setExpanded] = useState(false);

      const words = description.split(/\s+/);
      const truncatedDescription = words.slice(0, 29).join(" ");

      return (
        <span className="mb-2 text-gray-700">
          {expanded ? description : truncatedDescription}
          {words.length > 29 && (
            <>
              {!expanded && "... "}
              <button
                onClick={() => setExpanded(!expanded)}
                className="ml-1 font-medium text-filgreen text-xs hover:underline"
              >
                {expanded ? "Read less" : "Read more"}
              </button>
            </>
          )}
        </span>
      );
    };
    return <Content />;
  };

  const [selectedImage, setSelectedImage] = useState("");
  const [selectedColor, setSelectedColor] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [activeVideo, setActiveVideo] = useState(null);
  const [page, setPage] = useState(1);
  const limit = 5;

  const totalPages = Math.ceil(comments.length / limit);
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;

  const currentComments = comments.slice(startIndex, endIndex);

  const paginatedComments = useMemo(() => {
    const sorted = [...comments].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
    const start = (page - 1) * limit;
    const end = start + limit;
    return sorted.slice(start, end);
  }, [comments, page, limit]);

  const accordionItems = useMemo(
    () => [
      {
        title: "Filter Rating",
        content: (
          <div className="">
            {[5, 4, 3, 2, 1].map((star) => (
              <label
                key={star}
                className="flex items-center gap-2 py-2 text-xs cursor-pointer"
              >
                <input
                  type="checkbox"
                  //checked={filters.minRating === star}
                  // onChange={() =>
                  //   updateSingleFilter(
                  //     "minRating",
                  //     filters.minRating === star ? null : star
                  //   )
                  // }
                  className="peer hidden"
                />
                <span className="flex justify-center items-center peer-checked:bg-black border border-black rounded w-4 h-4">
                  <svg
                    className="peer-checked:block w-4 h-4 text-white"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="3"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </span>
                {star} Star{star > 1 ? "s" : ""}
              </label>
            ))}
          </div>
        ),
      },
    ],
    []
  );

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await axios.get(`/api/products/${id}/comments`);
        setComments(res.data);
      } catch (err) {
        console.error("Error fetching comments:", err);
      }
    };

    if (id) fetchComments();
  }, [id]);

  // Handle comment submission
  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      setSubmitting(true);
      const res = await axios.post(`/api/products/${id}/comments`, {
        text: commentText,
      });

      // Inject full user info manually (so UI doesn’t need to wait for refresh)
      const fullComment = {
        ...res.data,
        user: {
          _id: user._id,
          firstName: user.firstName, // or use user.name
        },
      };

      setComments((prev) => [...prev, fullComment]);
      setCommentText("");
    } catch (err) {
      console.error(err);
      alert("Failed to post comment. Please log in.");
    } finally {
      setSubmitting(false);
    }
  };

  // Fetch product only if not already loaded
  useEffect(() => {
    if (id && (!product || product._id !== id)) {
      dispatch(getProduct(id));
    }
  }, [dispatch, id, product]);

  // Add to recently viewed & set default image
  useEffect(() => {
    if (product && product._id) {
      dispatch(addRecentlyViewed(product));
      setSelectedImage(product.image || "");
    }
  }, [product, dispatch]);

  if (loading)
    return (
      <div className="h-screen">
        <Loading />
      </div>
    );
  if (error) return <p className="text-red-500">{error}</p>;
  if (!product) return <p>Product not found</p>;

  const currentImages = selectedColor
    ? [
        ...(selectedColor.images || []),
        ...(product.secondaryImages || []).filter(
          (img) => !selectedColor.images.includes(img)
        ),
      ]
    : [product.image, ...(product.secondaryImages || [])];

  const handleSelectColor = (color) => {
    setSelectedColor(color);
    setSelectedImage(color.images?.[0] || product.image);
  };

  return (
    <div className="mx-auto w-full max-w-[1140px]">
      <div className="md:flex gap-3 nav:gap-6">
        {/* Left side - Images */}
        <div className="flex flex-col items-center gap-4 md:gap-10 mt-3 md:mt-12 basis-[546px]">
          <div className="w-[200px] nav:w-[381px] xxs:w-[300px] nav:h-[381px]">
            {selectedImage ? (
              <img
                src={selectedImage}
                alt={product.name}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="flex justify-center items-center w-full h-full text-gray-400">
                No image available
              </div>
            )}
          </div>
          {/* Thumbnails */}
          <div className="flex justify-center gap-2 pt-3 md:pt-6 border-[#dfdfdf] border-t w-full">
            {currentImages.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={`Thumbnail ${idx}`}
                className={`xxs:w-[70px] w-[50px] h-[50px] xxs:h-[70px] object-contain border border-[#f5f5f5] rounded-md cursor-pointer p-2 ${
                  selectedImage === img ? "" : ""
                }`}
                onClick={() => setSelectedImage(img)}
              />
            ))}
          </div>

          <div className="self-start mt-[38px]">
            <h3 className="mx-2 font-oswald font-medium text-2xl">
              Product Live Cam
            </h3>

            <div className="flex gap-2 md:gap-4 mx-2 my-4">
              {product.videos.map((video, index) => (
                <div
                  key={index}
                  className="relative w-full"
                >
                  {activeVideo === index ? (
                    <video
                      src={video}
                      controls
                      autoPlay
                      className="shadow rounded-md w-full"
                    />
                  ) : (
                    <div
                      onClick={() => setActiveVideo(index)}
                      className="group relative cursor-pointer"
                    >
                      {/* Video thumbnail */}
                      <video
                        src={video}
                        className="opacity-70 group-hover:opacity-100 rounded-lg w-full"
                        muted
                      />
                      {/* Play button overlay */}
                      <div className="absolute">
                        <img
                          src="/play.svg"
                          alt="play"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Right side - Details */}

        <div className="flex flex-col gap-4 bg-[#fafafa] px-2 nav:px-6 pt-8 basis-[546px]">
          <div className="bg-black px-3 py-1 rounded-2xl w-fit text-[10px] text-white">
            {" "}
            Save{" "}
            {Math.round(
              ((product.originalPrice - product.price) /
                product.originalPrice) *
                100
            )}
            %
          </div>

          <div>
            <h3 className="mb-2 font-oswald font-medium text-2xl">
              {product.name}
            </h3>
            <div className="flex gap-0.5">
              <img
                src="/star.png"
                alt="Star"
              />
              <p className="text-[10px] text-black sm:text-xs">
                {product.averageRating.toFixed(1)}
              </p>
              <p className="text-[10px] text-black sm:text-xs">
                ({product.ratingsCount || 0})
              </p>
            </div>

            <p className="mt-5 text-[#3e3e3e] text-xs">
              {formatContent(product.description)}
            </p>

            {/* Color Options */}
            <div>
              <p className="mt-5 font-medium text-xs">Available Colors</p>

              {product.colors?.length > 0 && (
                <div className="flex items-center gap-2 mt-1 pb-4">
                  {product.colors.map((color, idx) => (
                    <button
                      key={idx}
                      className={`w-8 h-8 rounded-md border-black border-1 ${
                        selectedColor === color
                          ? "border-3 border-filgreen"
                          : ""
                      }`}
                      style={{ backgroundColor: color.name.toLowerCase() }}
                      onClick={() => handleSelectColor(color)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* price */}
            <span className="flex gap-3 mt-6 mb-2">
              {product.originalPrice && (
                <p className="font-medium text-gray-400 text-2xl line-through">
                  {formatAmount(product.originalPrice)}
                </p>
              )}
              <p className="font-medium text-[#1c1b1f] text-2xl">
                {formatAmount(product.price)}
              </p>
            </span>

            {/* buttons */}
            <div className="flex max-xxs:flex-col gap-2 xxs:gap-4 mt-10 fl">
              <WishlistButton
                text
                className="max-xxs:order-2 px-6 max-xxs:px-3 py-3 max-xxs:py-2 border border-[#dfdfdf] rounded-md w-full font-medium text-[#007c42] hover:text-filgreen xs:text-sm whitespace-nowrap transition"
                product={product}
              />

              <AddToCartButton
                className="max-xxs:order-1 bg-filgreen px-6 max-xxs:px-3 py-3 max-xxs:py-2 rounded-md w-full font-medium text-sm whitespace-nowrap transition"
                product={product}
                selectedColor={selectedColor}
              />
            </div>

            {/* Assurance Points */}

            <div className="mt-6">
              <h3 className="mb-4 font-oswald font-medium text-2xl">
                We Assure You
              </h3>

              {points.map((point, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-4 border-[#e5e5e5] border-b"
                >
                  <img
                    src={point.img}
                    alt={point.text}
                    className="w-7 h-7 object-contain"
                  />
                  <p className="py-[18px] text-sm">{point.text}</p>
                </div>
              ))}
            </div>

            <div className="max-nav:hidden mt-6 pb-4 border-[#e5e5e5] border-b">
              <p className="mb-4 font-oswald font-medium text-2xl capitalize">
                PAYMENT METHOD
              </p>
             <div className="flex items-center gap-6">
               <div className="w-[88px] h-[32px]">
                <Image
                  width={88}
                  height={32}
                  src="/paystack.png"
                  alt="paystack"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* <div className="w-full">
                <Image
                  width={200}
                  height={100}
                  src="/flutterwave.png"
                  alt="flutterwave"
                  className="w-[150px] h-[32px] object-cover"
                />
              </div> */}
             </div>
            </div>

            <div className="max-nav:hidden mt-6 rounded-md">
              <p className="mb-4 font-oswald font-medium text-2xl">
                Our Delivery Options
              </p>

              <div className="flex items-center gap-[10px] bg-[#ddebfe] mb-4 px-3 py-[14px] border border-[#331698] rounded-md w-full text-xs text">
                {" "}
                <span className="text-[#331689] text-2xl rotate-180">
                  {" "}
                  <AiOutlineExclamation />
                </span>{" "}
                Please note that delivery within Lagos is 1 - 3 working days and
                outside Lagos and 5 - 7 working days.
              </div>

              {deliveryOptions.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-4 border-[#e5e5e5] border-b"
                >
                  <img
                    src={item.img}
                    alt={item.text}
                    className="w-7 h-7 object-contain"
                  />
                  <p className="py-[18px] text-sm">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <ProductTabs
        description={product.description}
        features={
         <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-3xl mx-auto p-6">
  {product.features?.length > 0 ? (
    product.features.map((feat, idx) => (
      <div
        key={idx}
        className="flex flex-col items-center gap-3 p-6 border bg-gray-500/10 border-[#d9d9d9] rounded-lg  hover:shadow-md transition-shadow"
      >
        <CheckCircle className="w-8 h-8 text-green-600" />
        <p className="text-sm text-center text-gray-800">
          {feat}
        </p>
      </div>
    ))
  ) : (
    <p className="col-span-full text-center text-gray-500">No features available</p>
  )}
</div>
        }
        boxContent={
          <div className="flex justify-center items-center gap-5 nav:gap-40 side:gap-10">
            <div className="flex justify-center items-center w-[200px] sm:w-[381px] h-[200px] sm:h-[381px] overflow-hidden">
              <img
                src={product.image}
                alt={product.name}
              />
            </div>
            <div className="flex flex-col justify-center">
              <p className="mb-6 font-oswald font-medium text-2xl">
                {" "}
                What's in the box?{" "}
              </p>
              {product.boxContent?.map((boxItem, idx) => (
                <p
                  className="pb-4 text-sm"
                  key={idx}
                >
                  {boxItem.quantity} x {boxItem.item}
                </p>
              ))}
            </div>
          </div>
        }
        reviews={
          <div className="">
            <div className="flex max-sm:flex-col gap-2 md:gap-6">
              <div className="bg-white p-4 rounded-md sm:basis-[253px]">
                <div className="text-[#3e3e3e] text-sm text-center">
                  {" "}
                  <span className="font-oswald font-medium text-[40px] text-black">
                    {product.averageRating.toFixed(1)}{" "}
                  </span>
                  out of 5
                </div>
                <Rating
                  productId={product._id}
                  className="flex-justify-center my-2 text-base text-center"
                  readonly
                />
                <p className="pb-2 sm:pb-6 text-[#3e3e3e] text-sm text-center">
                  ({product.ratingsCount} Reviews)
                </p>

                <div className="max-sm:hidden border-[#dfdfdf] border-t">
                  <Accordion
                    items={accordionItems}
                    defaultOpenIndex={0}
                    headerClassName="text-xs pt-6 pb-4 font-medium"
                    contentClassName="text-sm"
                    icon={({ isOpen }) =>
                      isOpen ? <GoChevronUp /> : <GoChevronDown />
                    }
                    iconClassName="text-black text-lg font-bold"
                  />
                </div>
              </div>
              <div className="sm:basis-[816px]">
                {user ? (
                  <div>
                    <div className="flex justify-between items-center mb-4 py-5 border-[#dfdfdf] border-b w-full">
                      <div className="text-[#3e3e3e] text-xs">
                        {Math.min(endIndex, comments.length)} of{" "}
                        {comments.length} Results
                      </div>

                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() =>
                            setPage((prev) => Math.max(prev - 1, 1))
                          }
                          disabled={page === 1}
                          className="flex justify-center items-center bg-black disabled:bg-white rounded-md w-8 h-8 text-xs"
                        >
                          <GoChevronLeft
                            size={14}
                            color={page === 1 ? "#b7b7b7" : "white"}
                          />
                        </button>
                        <button
                          onClick={() =>
                            setPage((prev) => Math.min(prev + 1, totalPages))
                          }
                          disabled={page === totalPages || totalPages === 0}
                          className="flex justify-center items-center bg-black disabled:bg-white rounded-md w-8 h-8 text-xs"
                        >
                          <GoChevronRight
                            size={14}
                            color={
                              page === totalPages || totalPages === 0
                                ? "#b7b7b7"
                                : "white"
                            }
                          />
                        </button>
                      </div>
                    </div>
                    <p className="mb-2 font-medium text-sm">Add Review</p>

                    <form
                      onSubmit={handleSubmitComment}
                      className="sm:flex items-start gap-2"
                    >
                      <div className="bg-white mb-2 rounded-md w-full">
                        <textarea
                          value={commentText}
                          onChange={(e) => {
                            const words = e.target.value.trim().split(/\s+/);

                            if (words.length <= 100) {
                              setCommentText(e.target.value);
                            }
                          }}
                          rows={2}
                          placeholder="Write here..."
                          className="bg-white p-3 rounded-md outline-0 w-full text-xs"
                          required
                        />
                        <div className="mx-3 py-3 border-[#e5e5e5] border-t">
                          <p className="text-[#767676] text-xs">
                            {commentText.trim() === ""
                              ? 0
                              : commentText.trim().split(/\s+/).length}
                            /100 chars
                          </p>
                        </div>
                      </div>
                      <button
                        type="submit"
                        className="bg-black max-sm:mb-4 px-4 py-2 rounded-md font-medium text-white text-xs cursor-pointer"
                        disabled={submitting}
                      >
                        {submitting ? "Posting..." : "Post"}
                      </button>
                    </form>
                  </div>
                ) : (
                  <p className="my-4 text-gray-600 text-sm">
                    <a
                      href="/login"
                      className="text-filgreen underline"
                    >
                      Log in
                    </a>{" "}
                    or{" "}
                    <a
                      href="/register"
                      className="text-filgreen underline"
                    >
                      register
                    </a>{" "}
                    to post a comment.
                  </p>
                )}
                {paginatedComments.length === 0 ? (
                  <p className="text-gray-500">No comments yet.</p>
                ) : (
                  <div>
                    {paginatedComments.map((comment, index) => (
                      <div
                        key={index}
                        className="bg-white mb-2 p-3 rounded-md"
                      >
                        <p className="pb-3 font-medium text-xs">
                          {comment.user && typeof comment.user === "object"
                            ? comment.user.firstName ||
                              comment.user.name ||
                              "User"
                            : "User"}
                        </p>
                        <p className="pb-3 text-[#3e3e3e] text-xs">
                          {comment.text}
                        </p>
                        <p className="pb-3 text-gray-400 text-xs">
                          {formatDistanceToNow(new Date(comment.createdAt), {
                            addSuffix: true,
                          })}
                        </p>

                        <div className="flex items-center gap-1">
                          <img
                            src="/verified.svg"
                            alt=""
                          />
                          <p className="text-[#1a7841] text-xs">
                            Verified Customer
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        }
      />
    </div>
  );
}
