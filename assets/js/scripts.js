/*!
 * Copyright © 2020 Eneko Sanz <contact@eneko.me>
 * File distributed under the MIT license.
 */
import { GitHubInfo } from './infoClasses';
import { ContactModal } from './ContactModal';

// Main elements
const mainElement = document.getElementsByTagName('main')[0];
const scrollToAnchor = document.getElementsByClassName('scroll')[0];
const getInTouchButton = document.querySelectorAll('.get-in-touch > button')[0];

// Avoids scroll restoration on page reload
if(history && history.scrollRestoration) {
  history.scrollRestoration = 'manual';
}

// Removes .no-animate on body element when the background image
// loads and removes .no-scroll class when the animation finishes
var backgroundImg = new Image();
backgroundImg.onload = () => {
  document.body.classList.remove('no-animate');
  window.setTimeout(() => document.body.classList.remove('no-scroll'), 2000);
};
backgroundImg.src = 'img/bg.jpg';

scrollToAnchor.addEventListener('click', () => {
  mainElement.scrollIntoView({
    behavior: 'smooth',
    block: 'start'
  });
  event.preventDefault();
});

let contactModal;

getInTouchButton.addEventListener('click', () => {
  contactModal = contactModal || new ContactModal();
  contactModal.open();
});

let ghRepos = new GitHubInfo(document.getElementsByTagName('aside')[0], 'eneko89', 5);
ghRepos.fetch().then(() => ghRepos.insert());
