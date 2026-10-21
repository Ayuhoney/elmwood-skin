import SocialCards, { CardItem } from "@/components/ui/card-fan-carousel";

const CLINIC_CASE_STUDIES: CardItem[] = [
  {
    imgUrl: "/wp-content/uploads/2026/05/case-study-1.jpg",
    alt: "Skin Tightening & Facial Contouring",
    badge: "Skin Tightening",
    title: "Skin Tightening & Facial Contouring",
    linkUrl: "/casestudy/index.html",
  },
  {
    imgUrl: "/wp-content/uploads/2026/05/case-study-2.jpg",
    alt: "Hair Regrowth With PRP Therapy",
    badge: "PRP Therapy",
    title: "Hair Regrowth With PRP Therapy",
    linkUrl: "/casestudy/index.html",
  },
  {
    imgUrl: "/wp-content/uploads/2026/05/case-study-3.jpg",
    alt: "Pigmentation & Dark Spot Correction",
    badge: "Laser Therapy",
    title: "Pigmentation & Dark Spot Correction",
    linkUrl: "/casestudy/index.html",
  },
  {
    imgUrl: "/wp-content/uploads/2026/05/case-study-4.jpg",
    alt: "Acne Scar Resurfacing Protocol",
    badge: "Acne Care",
    title: "Acne Scar Resurfacing Protocol",
    linkUrl: "/casestudy/index.html",
  },
  {
    imgUrl: "/wp-content/uploads/2026/05/case-study-5.jpg",
    alt: "Collagen Induction & Elasticity",
    badge: "Anti-Aging",
    title: "Collagen Induction & Elasticity",
    linkUrl: "/casestudy/index.html",
  },
  {
    imgUrl: "/wp-content/uploads/2026/05/case-study-6.jpg",
    alt: "Hydra Glow Cellular Renewal",
    badge: "Hydra Glow",
    title: "Hydra Glow Cellular Renewal",
    linkUrl: "/casestudy/index.html",
  },
  {
    imgUrl: "/wp-content/uploads/2026/05/treatment-image-1-royal.jpg",
    alt: "Non-Surgical Jawline Sculpting",
    badge: "Contour Artistry",
    title: "Non-Surgical Jawline Sculpting",
    linkUrl: "/casestudy/index.html",
  },
  {
    imgUrl: "/wp-content/uploads/2026/05/treatment-image-2-royal.jpg",
    alt: "Medical Dermal Rejuvenation",
    badge: "Dermal Care",
    title: "Medical Dermal Rejuvenation",
    linkUrl: "/casestudy/index.html",
  },
];

export default function Demo() {
  return (
    <div className="min-h-screen bg-[#0e0c0a] flex items-center justify-center p-4">
      <SocialCards cards={CLINIC_CASE_STUDIES} />
    </div>
  );
}
