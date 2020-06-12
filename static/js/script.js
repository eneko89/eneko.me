/*!
 * Copyright © 2020 Eneko Sanz <contact@eneko.me>
 * File distributed under the MIT license.
 */

const scrollToAnchor = document.getElementsByClassName('scroll')[0];
const contactModalElement = document.getElementsByClassName('contact-modal')[0];
const mainElement = document.getElementsByTagName('main')[0];
const getInTouchButton = document.querySelectorAll('.get-in-touch > button')[0];

// Avoids scroll restoration on page reload.
if(history && history.scrollRestoration) {
  history.scrollRestoration = "manual";
}

scrollToAnchor.addEventListener('click', (event) => {
  mainElement.scrollIntoView({
    behavior: 'smooth',
    block: 'start'
  })
  scrollToAnchor.blur();
  event.preventDefault();
});

getInTouchButton.addEventListener('click', (event) => {
  contactModalElement.className = 'contact-modal open';
});

window.addEventListener("keydown", function (event) {
  if (event.key === 'Escape' || event.key === 'Esc') {
    contactModalElement.className = 'contact-modal';
    event.preventDefault();
  }
});
