// ==========================================================
// 1. YOUR PRODUCTS - edit this list to change what the shop shows.
//    To add a perfume, copy one line, paste it, and change the values.
//    "family" must be Floral, Woody or Citrus to match the filters.
// ==========================================================
const currency = "PKR.";

function money(amount) {
    return currency + amount.toLocaleString("en-US");
}

const products = [
    { name: "Scooch",   family: "Unisex", notes: "Sweet, Vanilla, Fruity",   price: 2799, oldPrice: 3999, color: "#D9778A", image: "images/Scooch_Card_Pic.jpeg" },
    { name: "Wanted",  family: "Men", notes: "Lavender, Aromatic, Soft Spicy",       price: 2999, oldPrice: 3999, color: "#E8D7A8", image: "images/Wanted_Card_Pic.jpeg" },
    { name: "Zoye",   family: "Women",  notes: "Jasmine, Pear Blossom, Sweet",      price: 2599, oldPrice: 3999, color: "#6B4A3A", image: "images/Zoye_Card_Pic.jpeg" },
    { name: "Flora",    family: "Women",  notes: "Caramel, Honey, Blood Orange",         price: 2899, oldPrice: 3999, color: "#8A4B2A", image: "images/Flora_Card_Pic.jpeg" },
    { name: "Candy",  family: "Women", notes: "Sweet, Strawberry, Amber",  price:2699, oldPrice: 3999, color: "#D6B93C", image: "images/Candy.jpeg" },
];

// ==========================================================
// 2. SHOW THE PRODUCTS
//    This builds one card (HTML) per product and puts them in the grid.
// ==========================================================
const grid = document.getElementById("productGrid");

function showProducts(family) {
    const list = family === "All" ? products : products.filter(p => p.family === family);

    grid.innerHTML = list.map(p => {
        // is this product on sale? (has an oldPrice that is higher than price)
        const hasSale = p.oldPrice && p.oldPrice > p.price;
        // e.g. 1 - 1999/2999 = 0.33 -> 33
        const percent = hasSale ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;

        return `
        <article class="card">
            <img src="${p.image}" alt="${p.name} perfume bottle" loading="lazy">
            <h3>${p.name}</h3>
            <p class="notes">${p.notes}</p>
            <p class="price">
                ${hasSale ? `<del>${money(p.oldPrice)}</del>` : ""}
                <span class="now">${money(p.price)}</span>
                ${hasSale ? `<span class="badge">${percent}% off</span>` : ""}
            </p>
            <button class="btn add-btn" data-name="${p.name}">Add to bag</button>
        </article>`;
    }).join("");
}

showProducts("All"); // show everything when the page first loads

// ==========================================================
// 3. FILTER BUTTONS
// ==========================================================
const filterButtons = document.querySelectorAll(".filter");

filterButtons.forEach(button => {
    button.addEventListener("click", () => {
        filterButtons.forEach(b => b.classList.remove("active")); // un-highlight all
        button.classList.add("active");                           // highlight the clicked one
        showProducts(button.dataset.family);                      // data-family from the HTML
    });
});

// ==========================================================
// 4. BAG + ORDERING
// ==========================================================
const deliveryFee = 0;                         // change to e.g. 250 if you charge for delivery
const ORDER_URL = "https://script.google.com/macros/s/AKfycbzUx1T9OtXnHQbA8wLMvJjfv3dNMGngx1k92ySgrYaZk9HRCTI5AgnNf5ElWowcCu8OIA/exec"; // you get this in Part B, step 5

let bag = {};                                  // what is in the bag, e.g. { Wanted: 2, Zoye: 1 }

const drawer = document.getElementById("drawer");
const overlay = document.getElementById("overlay");
const bagItemsEl = document.getElementById("bagItems");
const bagTotalsEl = document.getElementById("bagTotals");
const orderForm = document.getElementById("orderForm");
const orderMsg = document.getElementById("orderMsg");
const orderBtn = document.getElementById("orderBtn");

function priceOf(name) { return products.find(p => p.name === name).price; }
function itemCount() { return Object.values(bag).reduce((a, b) => a + b, 0); }
function subtotal() { return Object.keys(bag).reduce((sum, n) => sum + priceOf(n) * bag[n], 0); }

// redraws the panel and the counter on the Bag button
function renderBag() {
    document.getElementById("bagCount").textContent = itemCount();
    const names = Object.keys(bag);

    bagItemsEl.innerHTML = names.length ? names.map(n => `
        <div class="bag-row">
            <div><strong>${n}</strong><br>${money(priceOf(n))}</div>
            <div class="qty">
                <button data-act="dec" data-name="${n}" aria-label="Remove one ${n}">−</button>
                <span>${bag[n]}</span>
                <button data-act="inc" data-name="${n}" aria-label="Add one ${n}">+</button>
            </div>
        </div>`).join("") : "<p>Your bag is empty.</p>";

    const sub = subtotal();
    bagTotalsEl.innerHTML = names.length ? `
        <div><span>Subtotal</span><span>${money(sub)}</span></div>
        <div><span>Delivery</span><span>${deliveryFee ? money(deliveryFee) : "Free"}</span></div>
        <div class="grand"><span>Total</span><span>${money(sub + deliveryFee)}</span></div>` : "";

    orderBtn.disabled = !names.length;         // can't order an empty bag
}

function openBag(open) {
    drawer.classList.toggle("open", open);
    overlay.classList.toggle("open", open);
    document.body.classList.toggle("no-scroll", open);
}
document.getElementById("bagBtn").addEventListener("click", () => openBag(true));
document.getElementById("closeBag").addEventListener("click", () => openBag(false));
overlay.addEventListener("click", () => openBag(false));
document.addEventListener("keydown", e => { if (e.key === "Escape") openBag(false); });

// one listener for every "Add to bag" button and every + / − button
document.addEventListener("click", event => {
    const add = event.target.closest(".add-btn");
    if (add) {
        const n = add.dataset.name;
        bag[n] = Math.min((bag[n] || 0) + 1, 20);
        renderBag();
        add.textContent = "Added";
        setTimeout(() => { add.textContent = "Add to bag"; }, 1200);
        return;
    }
    const q = event.target.closest(".qty button");
    if (q) {
        const n = q.dataset.name;
        bag[n] = Math.min(bag[n] + (q.dataset.act === "inc" ? 1 : -1), 20);
        if (bag[n] <= 0) delete bag[n];
        renderBag();
    }
});

// accepts 0300 1234567, 03001234567, +92 300 1234567 and returns 03001234567 (or null if invalid)
function cleanPhone(raw) {
    let p = raw.replace(/[\s-]/g, "");
    if (p.startsWith("+92")) p = "0" + p.slice(3);
    else if (p.startsWith("0092")) p = "0" + p.slice(4);
    return /^03\d{9}$/.test(p) ? p : null;
}

orderForm.addEventListener("submit", async event => {
    event.preventDefault();
    orderMsg.textContent = "";
    if (!itemCount()) return;

    // bots fill the hidden field, people never do: pretend it worked and send nothing
    if (document.getElementById("oTrap").value) { orderMsg.textContent = "Thank you."; return; }

    const name = document.getElementById("oName").value.trim();
    const phone = cleanPhone(document.getElementById("oPhone").value);
    const address = document.getElementById("oAddress").value.trim();
    const city = document.getElementById("oCity").value.trim();

    if (!phone) { orderMsg.textContent = "Please enter a valid mobile number, like 0300 1234567."; return; }
    if (name.length < 2 || address.length < 8 || city.length < 2) {
        orderMsg.textContent = "Please fill in your name, full address and city."; return;
    }

    orderBtn.disabled = true;
    orderBtn.textContent = "Sending...";
    try {
        const res = await fetch(ORDER_URL, {
            method: "POST",
            body: JSON.stringify({
                name, phone, address, city,
                items: Object.keys(bag).map(n => ({ name: n, qty: bag[n] })),
                total: subtotal() + deliveryFee
            })
        });
        const data = await res.json();
        if (!data.ok) throw new Error(data.error);

        orderMsg.textContent = `Thank you, ${name}. Order ${data.id} is received. We will call you shortly to confirm it.`;
        bag = {};
        orderForm.reset();
    } catch (err) {
    console.error("Order failed:", err);
    orderMsg.textContent = "Sorry, something went wrong. Please try again";
    }
    orderBtn.textContent = "Place order";
    renderBag();
});

renderBag();                                   // draw the empty bag when the page loads

// ==========================================================
// 5. MOBILE MENU
// ==========================================================
const menuBtn = document.getElementById("menuBtn");
const nav = document.getElementById("nav");

menuBtn.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    menuBtn.setAttribute("aria-expanded", isOpen);
});

// close the menu after tapping a link
nav.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
        nav.classList.remove("open");
        menuBtn.setAttribute("aria-expanded", "false");
    });
});

// ==========================================================
// 6. CUSTOMER REVIEWS (slider)
//    Add real reviews to this list. Copy a line, paste it, edit it.
//    stars is 1 to 5. "image" is optional: leave it out for a text-only review.
//    While the list is empty, the whole section and its menu link stay hidden.
// ==========================================================
const reviews = [
     { name: "Upcoming", city: "Karachi", product: "Zoye", stars: 5, text: "Upcoming", image: "" },
     { name: "Upcoming",  city: "Karachi",  product: "Wanted", stars: 5, text: "Upcoming", image:"" },
     { name: "Upcoming",  city: "Karachi",  product: "Wanted", stars: 5, text: "Upcoming", image:"" },
];

const reviewsSection = document.getElementById("reviews");
const reviewsLink = document.getElementById("reviewsLink");

if (!reviews.length) {
    reviewsSection.hidden = true;                // nothing to show yet
    reviewsLink.hidden = true;
} else {
    const row = document.getElementById("reviewRow");
    const prevBtn = document.getElementById("reviewPrev");
    const nextBtn = document.getElementById("reviewNext");

    row.innerHTML = reviews.map(r => `
        <figure class="review">
            ${r.image ? `<img src="${r.image}" alt="Photo from ${r.name}" loading="lazy">` : ""}
            <div class="stars" role="img" aria-label="${r.stars} out of 5 stars">${"★".repeat(r.stars)}${"☆".repeat(5 - r.stars)}</div>
            <blockquote>${r.text}</blockquote>
            <figcaption class="review-by"><strong>${r.name}</strong>, ${r.city}${r.product ? ` · bought ${r.product}` : ""}</figcaption>
        </figure>`).join("");

    // moves one review left (-1) or right (1), and loops around at either end
        // moves one review left (-1) or right (1), and loops around at either end
    function slideReview(direction) {
        const first = row.children[0], second = row.children[1];
        const step = second ? second.offsetLeft - first.offsetLeft : row.clientWidth;   // width of one review plus the gap
        const maxScroll = row.scrollWidth - row.clientWidth;
        let target = row.scrollLeft + direction * step;
        if (direction > 0 && row.scrollLeft >= maxScroll - 5) target = 0;     // at the end: back to the start
        if (direction < 0 && row.scrollLeft <= 5) target = maxScroll;         // at the start: jump to the end
        row.scrollTo({ left: target, behavior: "smooth" });
    }
    prevBtn.addEventListener("click", () => slideReview(-1));
    nextBtn.addEventListener("click", () => slideReview(1));

    // hide the arrows when all the reviews already fit on screen
    function updateArrows() {
        const fits = row.scrollWidth <= row.clientWidth + 5;
        prevBtn.hidden = fits;
        nextBtn.hidden = fits;
    }
    updateArrows();
    window.addEventListener("resize", updateArrows);

}
// ==========================================================
// 7. FOOTER YEAR (updates itself)
// ==========================================================
document.getElementById("year").textContent = new Date().getFullYear();

// ==========================================================
// 8. HERO SLIDER
//    Each line picks a product (by exact name from your list above)
//    and the label shown on its photo. Add, remove or reorder freely.
// ==========================================================
const sliderItems = [
    { name: "Wanted",  tag: "New arrival" },
    { name: "Scooch",  tag: "Most Loved" },
    { name: "Zoye",    tag: "New arrival" },
    { name: "Flora",   tag: "Limited edition" }
];

const slideTrack = document.getElementById("heroSlides");
const slideDots  = document.getElementById("heroDots");

// build one slide and one dot per item
sliderItems.forEach((item, i) => {
    const p = products.find(prod => prod.name === item.name);
    if (!p) return;                                  // skips any name that is not in your list

    slideTrack.insertAdjacentHTML("beforeend", `
        <a class="slide" href="#collection">
            <img src="${p.image}" alt="${p.name} perfume">
            <span class="tag">${item.tag}</span>
            <div class="slide-info">
                <h3>${p.name}</h3>
                <p>${money(p.price)}</p>
            </div>
        </a>`);
    slideDots.insertAdjacentHTML("beforeend",
        `<button class="dot" aria-label="Show slide ${i + 1}"></button>`);
});

const slideCount = slideTrack.children.length;
const dotEls = slideDots.querySelectorAll(".dot");
let currentSlide = 0;
let sliderPaused = false;

function goToSlide(i) {
    slideTrack.scrollTo({ left: slideTrack.clientWidth * i, behavior: "smooth" });
}

function markActiveDot() {
    currentSlide = Math.round(slideTrack.scrollLeft / slideTrack.clientWidth);
    dotEls.forEach((d, i) => d.classList.toggle("active", i === currentSlide));
}

slideTrack.addEventListener("scroll", markActiveDot);   // also fires when the visitor swipes
dotEls.forEach((dot, i) => dot.addEventListener("click", () => goToSlide(i)));
markActiveDot();

// auto-advance every 4 seconds, unless the visitor prefers less motion
const slowMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if (!slowMotion && slideCount > 1) {
    setInterval(() => {
        if (!sliderPaused) goToSlide((currentSlide + 1) % slideCount);
    }, 4000);
}
// pause while the visitor is touching or pointing at the slider
const sliderBox = document.querySelector(".hero-art");
sliderBox.addEventListener("pointerenter", () => sliderPaused = true);
sliderBox.addEventListener("pointerleave", () => sliderPaused = false);

// ==========================================================
// 9. SCROLL REVEALS
//    Skipped for visitors who prefer reduced motion, and for
//    very old browsers, so content is never left hidden.
// ==========================================================
if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {

    // runs whenever a tagged element scrolls into view
    const revealObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            revealObserver.unobserve(el);               // each element animates only once
            el.classList.add("in");                     // this triggers the CSS transition

            // afterwards, remove the helper classes so the card's normal hover effect works again
            const wait = parseInt(el.style.getPropertyValue("--d")) || 0;
            setTimeout(() => {
                el.classList.remove("reveal", "in");
                el.style.removeProperty("--d");
            }, wait + 1000);
        });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });   // fires when 12% is visible

    // hides an element and starts watching it
    function reveal(el, delay = 0) {
        if (el.dataset.rv) return;                      // never tag the same element twice
        el.dataset.rv = "1";
        el.classList.add("reveal");
        el.style.setProperty("--d", delay + "ms");
        revealObserver.observe(el);
    }

    // headings, filter buttons, the reviews slider and each paragraph or list in About Us
    document.querySelectorAll(".section h2, .filters, .review-slider, .story-body > *")
        .forEach(el => reveal(el));

    // product cards: each row appears left to right, 130ms apart
    function revealCards() {
        const columns = window.innerWidth >= 900 ? 3 : window.innerWidth >= 600 ? 2 : 1;
        grid.querySelectorAll(".card").forEach((card, i) => reveal(card, (i % columns) * 130));
    }
    revealCards();
    // the cards are rebuilt every time a filter is tapped, so tag the new ones too
    new MutationObserver(revealCards).observe(grid, { childList: true });
}