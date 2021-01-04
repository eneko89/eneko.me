/*!
 * Copyright © 2020 Eneko Sanz <contact@eneko.me>
 * File distributed under the MIT license.
 */

// Main elements
const mainElement = document.getElementsByTagName('main')[0];
const scrollToAnchor = document.getElementsByClassName('scroll')[0];
const getInTouchButton = document.querySelectorAll('.get-in-touch > button')[0];

// Avoids scroll restoration on page reload
if(history && history.scrollRestoration) {
  history.scrollRestoration = "manual";
}

// Removes .no-animate on body element when the background image
// loads and removes .no-scroll class when the animation finishes
var backgroundImg = new Image();
backgroundImg.onload = () => {
  document.body.classList.remove('no-animate');
  window.setTimeout(() => document.body.classList.remove('no-scroll'), 2000);
}
backgroundImg.src = 'css/images/bg.jpg';

scrollToAnchor.addEventListener('click', () => {
  mainElement.scrollIntoView({
    behavior: 'smooth',
    block: 'start'
  })
  scrollToAnchor.blur();
  event.preventDefault();
});

let contactModal;

getInTouchButton.addEventListener('click', () => {
    contactModal = contactModal || new ContactModal();
    contactModal.open();
});

class ContactModal {

  constructor() {
    this.container = document.getElementsByClassName('contact-modal')[0];
    this.closeIcon = document.querySelectorAll('.contact-modal > svg.close-modal')[0];
    this.notifications = document.querySelectorAll('.contact-modal .notifications')[0];
    this.dismissIcon = document.querySelectorAll('.contact-modal .notifications svg.dismiss')[0];
    this.emailError = document.querySelectorAll('.contact-modal .notifications .email-error')[0];
    this.emptyError = document.querySelectorAll('.contact-modal .notifications .empty-error')[0];
    this.unknownError = document.querySelectorAll('.contact-modal .notifications .unknown-error')[0];
    this.alreadySentError = document.querySelectorAll('.contact-modal .notifications .already-sent-error')[0];
    this.clickToStartOver = document.querySelectorAll('.contact-modal .notifications .already-sent-error > a')[0];
    this.successNotification = document.querySelectorAll('.contact-modal .notifications .success-notification')[0];
    this.nameInput = document.querySelectorAll('.contact-modal input.name-input')[0];
    this.emailInput = document.querySelectorAll('.contact-modal input.email-input')[0];
    this.textInput = document.querySelectorAll('.contact-modal textarea')[0];
    this.inputs = [this.nameInput, this.emailInput, this.textInput];
    this.submitButton = document.querySelectorAll('.contact-modal .submission button')[0];
    this.submitButtonSpinner = document.querySelectorAll('.contact-modal .submission button svg')[0];
    this.submitButtonText = document.querySelectorAll('.contact-modal .submission button span')[0];
    this.setListeners();
  }

  setListeners() {
    this.dismissIcon.addEventListener("click", () => this.dismissNotifications());
    this.closeIcon.addEventListener("click", event => this.close(event));
    this.submitButton.addEventListener("click", event => this.submit(event));
    this.clickToStartOver.addEventListener("click", event => this.reset(event));
    window.addEventListener('keydown', event => this.close(event));
  }

  open() {
    this.container.classList.add('open');
    document.body.classList.add('no-scroll');
  }

  close(event) {
    if (event.type === 'click' || (event.key === 'Escape' || event.key === 'Esc')) {
      this.container.classList.remove('open');
      document.body.classList.remove('no-scroll');
      event.preventDefault();
    }
  }

  reset(event) {
    this.inputs.forEach(input => input.value = '');
    this.dismissNotifications();
    event.preventDefault();
  }

  isEmailValid() {
    return /^.+@.+\..+$/.test(this.emailInput.value);
  }

  isInputEmpty(input) {
    return input.value.trim() === '';
  }

  showNotification(notification, invalidInputs) {
    if (invalidInputs) {
      invalidInputs.forEach(input => input.classList.add('invalid'));
    }

    this.emailError.classList.remove('show');
    this.emptyError.classList.remove('show');
    this.unknownError.classList.remove('show');
    this.alreadySentError.classList.remove('show');
    this.successNotification.classList.remove('show');

    this.notifications.classList.remove('error');
    if (notification.indexOf('Error') !== -1) {
      this.notifications.classList.add('error');
    }

    this[notification].classList.add('show');
    this.notifications.classList.add('show');
  }

  dismissNotifications() {
    this.inputs.forEach(input => input.classList.remove('invalid'));
    this.notifications.classList.remove('show');
  }

  showButtonSpinner() {
    this.submitButton.disabled = true;
    this.submitButton.classList.add('submitting');
    this.submitButtonSpinner.classList.add('show');
    this.submitButtonText.classList.remove('show');
  }

  hideButtonSpinner() {
    this.submitButton.disabled = false;
    this.submitButton.classList.remove('submitting');
    this.submitButtonSpinner.classList.remove('show');
    this.submitButtonText.classList.add('show');
  }

  isDataValid() {
    const emptyInputs = this.inputs.filter(input => this.isInputEmpty(input));

    if (emptyInputs.length) {
      this.showNotification('emptyError', emptyInputs);
      return false;
    }
    if (!this.isEmailValid()) {
      this.showNotification('emailError', [this.emailInput]);
      return false;
    }
    if (this.currentDataHash && this.currentDataHash === this.getDataHash()) {
      this.showNotification('alreadySentError', this.inputs);
      return false;
    }
    return true;
  }

  getDataHash() {
    const data = this.inputs.reduce((acc, cur) => acc + cur.value.trim(), '');
    console.log('data: ', data);
    let hash = 0, i, chr;
    for (i = 0; i < data.length; i++) {
      chr = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + chr;
      hash |= 0;
    }
    return hash;
  }

  submit(event) {
    event.preventDefault();
    this.dismissNotifications();

    if (this.isDataValid()) {
      const request = new XMLHttpRequest();
      this.showButtonSpinner();
      request.open('POST', '/contact', true);

      request.onload = () => {
        this.hideButtonSpinner();
        this.dismissNotifications();
        if (request.status === 200) {
          this.showNotification('successNotification');
          this.currentDataHash = this.getDataHash();
        } else {
          this.showNotification('unknownError');
        }
      };

      request.onerror = () => {
        this.hideButtonSpinner();
        this.dismissNotifications();
        this.showNotification('unknownError');
      }

      request.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
      request.send(JSON.stringify({
        name: this.nameInput.value,
        email: this.emailInput.value,
        text: this.textInput.value
      }));
    }
  }

}
