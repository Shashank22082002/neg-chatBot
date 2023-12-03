// JavaScript to toggle active navigation content
const navLinks = document.querySelectorAll("nav a");
navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
        e.preventDefault();
        const targetId = e.target.getAttribute("href").substring(1);
        const navContent = document.querySelectorAll(".nav-content");
        navContent.forEach((content) => {
            content.classList.remove("active");
        });
        document.getElementById(targetId).classList.add("active");
    });
});
