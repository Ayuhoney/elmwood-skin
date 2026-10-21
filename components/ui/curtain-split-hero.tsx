"use client";

import {
    motion,
    useTransform,
    useReducedMotion,
    useMotionValue,
    useSpring,
    useMotionValueEvent,
    MotionValue,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";

const IMAGES = [
    { src: "/wp-content/uploads/2026/04/post-1.jpg", alt: "Acne Care Treatment", title: "5 Effective Ways to Treat Acne and Prevent Scarring", category: "Acne Care", url: "/index.html?p=141.html" },
    { src: "/wp-content/uploads/2026/04/post-2.jpg", alt: "Laser Hair Removal", title: "Understanding Laser Hair Removal: Benefits & What to Expect", category: "Laser Treatments", url: "/index.html?p=139.html" },
    { src: "/wp-content/uploads/2026/04/post-3.jpg", alt: "Anti Aging Treatments", title: "Top Anti Aging Treatments Youthful, Radiant Skin", category: "Anti Aging", url: "/index.html?p=136.html" },
    { src: "/wp-content/uploads/2026/04/post-4.jpg", alt: "Daily Skincare Routine", title: "Daily Skincare Routine for Healthy and Radiant Skin", category: "Daily Care", url: "/blog/index.html" },
    { src: "/wp-content/uploads/2026/04/post-5.jpg", alt: "Pigmentation Treatment", title: "Understanding Pigmentation and How to Treat It", category: "Pigmentation", url: "/blog/index.html" },
    { src: "/wp-content/uploads/2026/04/post-6.jpg", alt: "PRP Hair Loss Therapy", title: "PRP Therapy for Hair Loss: A Natural Solution", category: "PRP Therapy", url: "/blog/index.html" },
    { src: "/wp-content/uploads/2026/05/transformation-img-after-3.jpg", alt: "Clinical Case Study", title: "Skin Texture & Deep Scar Transformation", category: "Case Study", url: "/casestudy/index.html" },
    { src: "/wp-content/uploads/2026/05/author-1.jpg", alt: "Clinical Dermatology", title: "Expert Insights & Scientific Skin Perfection", category: "Clinical Practice", url: "/our-team/index.html" },
];

const SPRING_CONFIG = { stiffness: 65, damping: 22, mass: 0.5 };

interface StageDimensions {
    width: number;
    height: number;
    isMobile: boolean;
}

interface CurtainCardProps {
    item: { src: string; alt: string; title: string; category: string; url: string };
    index: number;
    total: number;
    progress: MotionValue<number>;
    pointer: { x: MotionValue<number>; y: MotionValue<number> };
    isSpreadActive: boolean;
    stage: StageDimensions;
}

function CurtainCard({
    item,
    index,
    total,
    progress,
    pointer,
    isSpreadActive,
    stage,
}: CurtainCardProps) {
    const half = total / 2;
    const isLeft = index % 2 === 0;
    const wingIndex = Math.floor(index / 2); // 0 to 3
    const norm = wingIndex / (half - 1) - 0.5; // -0.5 to 0.5
    const sideMult = isLeft ? -1 : 1;

    // Expanded card dimensions for prominent, substantial monograph aesthetic
    const cardWidth = stage.isMobile ? 105 : 180;
    const cardHeight = stage.isMobile ? 142 : 245;

    // Compact wing coordinates within container bounds
    const archCurve = Math.cos(norm * Math.PI) * (stage.width * 0.024);
    const targetX = sideMult * (stage.width * (stage.isMobile ? 0.32 : 0.36) + archCurve);
    const targetY = norm * (stage.height * (stage.isMobile ? 0.54 : 0.48));
    const targetRotate = sideMult * (norm * 16);

    const initialX = sideMult * (wingIndex * 8);
    const initialY = norm * 14;
    const initialRotate = sideMult * (wingIndex * 2.8);

    const translate = useTransform(
        [progress, pointer.x, pointer.y],
        ([p, px, py]: number[]) => {
            const easeP = 1 - Math.pow(1 - p, 3);

            const tx = initialX + (targetX - initialX) * easeP;
            const ty = initialY + (targetY - initialY) * easeP;

            const maxParallaxX = stage.isMobile ? 8 : 16;
            const maxParallaxY = stage.isMobile ? 6 : 14;

            const dx = tx + px * (isLeft ? -maxParallaxX : maxParallaxX) * easeP;
            const dy = ty + py * maxParallaxY * easeP;

            return `calc(-50% + ${dx}px) calc(-50% + ${dy}px)`;
        }
    );

    const rotate = useTransform(
        progress,
        [0, 0.45, 1],
        [initialRotate, isLeft ? -14 : 14, targetRotate]
    );

    const scale = useTransform(progress, [0, 0.5, 1], [1, 0.96, 0.92]);

    return (
        <motion.div
            className="absolute left-1/2 top-1/2 will-change-transform cursor-pointer select-none group"
            style={{
                width: cardWidth,
                height: cardHeight,
                zIndex: isLeft ? index + 1 : total - index,
                translate,
                rotate,
                scale,
            }}
            whileHover={
                isSpreadActive
                    ? {
                        scale: 1.1,
                        zIndex: 50,
                        rotate: 0,
                        transition: SPRING_CONFIG,
                    }
                    : { scale: 0.98 }
            }
            whileTap={{ scale: 1.04, zIndex: 50 }}
            onClick={(e: React.MouseEvent) => {
                if (isSpreadActive) {
                    e.stopPropagation();
                    window.location.href = item.url;
                }
            }}
        >
            <div className="relative h-full w-full overflow-hidden rounded-xl bg-[#FAF7F2] dark:bg-stone-900 shadow-xl shadow-stone-950/20 ring-1 ring-[#c18c5d]/30 transition-all duration-300 group-hover:shadow-2xl group-hover:ring-[#c18c5d]/80">
                <img
                    src={item.src}
                    alt={item.alt}
                    draggable={false}
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                />
                {/* Monograph overlay with high-contrast text */}
                <div
                    className={`absolute inset-0 bg-gradient-to-b from-stone-950/60 via-stone-950/20 via-30% via-stone-950/85 via-65% to-stone-950/98 flex flex-col justify-between p-3 transition-opacity duration-300 pointer-events-none ${
                        isSpreadActive ? "opacity-95" : "opacity-0 group-hover:opacity-100"
                    }`}
                >
                    <div className="flex items-center justify-between gap-1">
                        <span className="text-[9.5px] font-mono tracking-wider text-stone-950 font-extrabold uppercase bg-white px-1.5 py-0.5 rounded shadow-sm">
                            {`VOL. 0${index + 1}`}
                        </span>
                        <span className="text-[9px] font-mono tracking-wider text-[#ECC895] font-bold uppercase bg-stone-950/90 border border-[#ECC895]/40 px-1.5 py-0.5 rounded">
                            {item.category}
                        </span>
                    </div>
                    <h4 className="text-[13px] text-white font-bold leading-snug line-clamp-2 drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)]">
                        {item.title}
                    </h4>
                </div>
            </div>
        </motion.div>
    );
}

export default function CurtainSplitHero() {
    const stageRef = useRef<HTMLDivElement>(null);
    const reduce = useReducedMotion();

    const [stage, setStage] = useState<StageDimensions>({
        width: 1000,
        height: 560,
        isMobile: false,
    });

    const rawProgress = useMotionValue(0);
    const progress = useSpring(rawProgress, SPRING_CONFIG);

    const [isSpreadActive, setIsSpreadActive] = useState(false);
    useMotionValueEvent(progress, "change", (p: number) => setIsSpreadActive(p > 0.65));

    const rawX = useMotionValue(0);
    const rawY = useMotionValue(0);
    const pointerX = useSpring(rawX, SPRING_CONFIG);
    const pointerY = useSpring(rawY, SPRING_CONFIG);

    useEffect(() => {
        const el = stageRef.current;
        if (!el) return;

        const updateDimensions = () => {
            const rect = el.getBoundingClientRect();
            setStage({
                width: rect.width,
                height: rect.height,
                isMobile: rect.width < 768,
            });
        };

        updateDimensions();
        const observer = new ResizeObserver(updateDimensions);
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        const el = stageRef.current;
        if (!el) return;

        const onWheel = (e: WheelEvent) => {
            const current = rawProgress.get();
            const delta = e.deltaY * 0.002;
            const next = Math.min(1, Math.max(0, current + delta));

            if ((e.deltaY > 0 && current < 1) || (e.deltaY < 0 && current > 0)) {
                e.preventDefault();
                rawProgress.set(next);
            }
        };

        el.addEventListener("wheel", onWheel, { passive: false });
        return () => el.removeEventListener("wheel", onWheel);
    }, [rawProgress]);

    const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        if (reduce) return;
        const rect = e.currentTarget.getBoundingClientRect();
        rawX.set(((e.clientX - rect.left) / rect.width - 0.5) * 2);
        rawY.set(((e.clientY - rect.top) / rect.height - 0.5) * 2);
    };

    const handlePointerLeave = () => {
        rawX.set(0);
        rawY.set(0);
    };

    const toggleCurtain = () => {
        rawProgress.set(rawProgress.get() > 0.5 ? 0 : 1);
    };

    const textY = useTransform(progress, [0.25, 0.85], [30, 0]);
    const textOpacity = useTransform(progress, [0.3, 0.8], [0, 1]);
    const lineScale = useTransform(progress, [0.35, 0.85], [0, 1]);

    return (
        <section className="relative w-full flex flex-col items-center justify-center my-6">
            <div
                ref={stageRef}
                onClick={toggleCurtain}
                onPointerMove={handlePointerMove}
                onPointerLeave={handlePointerLeave}
                className="relative h-[490px] sm:h-[560px] md:h-[620px] w-full overflow-hidden rounded-2xl sm:rounded-3xl bg-[#F7F4EE] dark:bg-[#141210] text-stone-900 dark:text-stone-100 border border-[#e5ded4] dark:border-stone-800 shadow-xl flex items-center justify-center cursor-pointer transition-colors duration-300"
            >
                {/* Subtle Architectural Dot Pattern */}
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#cfc8bd_1px,transparent_1px)] dark:bg-[radial-gradient(#302c28_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_75%_75%_at_50%_50%,#000_50%,transparent_100%)] opacity-85" />

                {/* Center Editorial Monograph / Book Headline */}
                <motion.div
                    className="pointer-events-none z-[5] flex flex-col items-center text-center px-4 max-w-sm sm:max-w-md"
                    style={{ y: textY, opacity: textOpacity }}
                >
                    <span className="text-[11px] font-mono uppercase tracking-[0.28em] text-[#9a6a38] dark:text-[#d4a373] font-semibold">
                        Clinical Monograph &bull; Vol. IV
                    </span>
                    <h2 className="mt-2 text-2xl sm:text-3xl md:text-4xl font-normal tracking-tight leading-[1.05] font-serif text-[#1e1915] dark:text-[#f3ede4]">
                        Dermatology
                        <br />
                        Chronicles.
                    </h2>
                    <motion.div
                        style={{ scaleX: lineScale }}
                        className="my-3 sm:my-4 h-px w-16 sm:w-20 bg-[#c18c5d] origin-center"
                    />
                    <p className="max-w-[34ch] text-[12px] sm:text-[13px] font-light text-[#5c5550] dark:text-[#b0a89f] leading-relaxed">
                        Unfolding clinical wisdom through advanced dermatological science, restorative care, and patient transformations.
                    </p>
                    <div className="pointer-events-auto mt-4">
                        <a
                            href="/blog/index.html"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#c18c5d] hover:bg-[#a57245] text-white text-xs font-medium tracking-wide transition-colors duration-200 shadow-md"
                        >
                            Read Full Journal <span>&rarr;</span>
                        </a>
                    </div>
                </motion.div>

                {/* Bilateral Curtain Cards */}
                <div className="absolute inset-0 z-10 pointer-events-auto">
                    {IMAGES.map((item, i) => (
                        <CurtainCard
                            key={i}
                            item={item}
                            index={i}
                            total={IMAGES.length}
                            progress={progress}
                            pointer={{ x: pointerX, y: pointerY }}
                            isSpreadActive={isSpreadActive}
                            stage={stage}
                        />
                    ))}
                </div>

                {/* Bottom Status Pill Indicator */}
                <div className="pointer-events-none absolute bottom-4 z-30 flex items-center gap-2 rounded-full bg-[#FAF7F2]/90 dark:bg-stone-900/90 backdrop-blur-md px-4 py-1.5 border border-[#e5ded4] dark:border-stone-700/70 text-[11px] font-medium tracking-wide text-stone-700 dark:text-stone-300 shadow-sm">
                    <span
                        className={`h-2 w-2 rounded-full transition-colors duration-300 ${
                            isSpreadActive ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" : "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]"
                        }`}
                    />
                    <span>{isSpreadActive ? "Scroll up or click to close curtain" : "Scroll down or click to unveil"}</span>
                </div>
            </div>
        </section>
    );
}
