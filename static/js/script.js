/*!
 * Copyright © 2020 Eneko Sanz <contact@eneko.me>
 * File distributed under the MIT license.
 */

const scrollToAnchor = document.getElementsByClassName('scroll')[0];
const mainElement = document.getElementsByTagName('main')[0];

// Avoids scroll restoration on page reload.
if(history && history.scrollRestoration) {
  history.scrollRestoration = "manual";
}

scrollToAnchor.addEventListener('click', function(event) {
  mainElement.scrollIntoView({
    behavior: 'smooth',
    block: 'start'
  })
  scrollToAnchor.blur();
  event.preventDefault();
});
