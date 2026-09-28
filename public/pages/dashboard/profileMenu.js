const profileMenuBtn = document.getElementById("profile-menu-btn");
const profileDropdown = document.getElementById("profile-dropdown");

function openProfileMenu() {
  profileMenuBtn.setAttribute("aria-expanded", "true");
  profileDropdown.classList.remove("hidden");
}

function closeProfileMenu() {
  profileMenuBtn.setAttribute("aria-expanded", "false");
  profileDropdown.classList.add("hidden");
}

function profileMenuIsOpen() {
  return !profileDropdown.classList.contains("hidden");
}

profileMenuBtn.addEventListener("click", (e) => {
  e.stopPropagation();

  if (!profileMenuIsOpen()) {
    openProfileMenu();
  } else {
    closeProfileMenu();
  }
});

export { closeProfileMenu, profileMenuIsOpen };
