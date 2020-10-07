/*!
 * Copyright © 2020 Eneko Sanz <contact@eneko.me>
 * File distributed under the MIT license.
 */

// Main elements
const bodyElement = document.getElementsByTagName('body')[0];
const mainElement = document.getElementsByTagName('main')[0];
const scrollToAnchor = document.getElementsByClassName('scroll')[0];
const getInTouchButton = document.querySelectorAll('.get-in-touch > button')[0];

// Avoids scroll restoration on page reload
if(history && history.scrollRestoration) {
  history.scrollRestoration = "manual";
}

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
    this.alreadySentWarning = document.querySelectorAll('.contact-modal .notifications .already-sent-warning')[0];
    this.successNotification = document.querySelectorAll('.contact-modal .notifications .success-notification')[0];
    this.inputs = Array.from(document.querySelectorAll('.contact-modal input, .contact-modal textarea'));
    this.emailInput = document.querySelectorAll('.contact-modal input.email-input')[0];
    this.submitButton = document.querySelectorAll('.contact-modal .submission button')[0];
    this.submitButtonSpinner = document.querySelectorAll('.contact-modal .submission button svg')[0];
    this.submitButtonText = document.querySelectorAll('.contact-modal .submission button span')[0];
    this.setListeners();
  }

  setListeners() {
    this.dismissIcon.addEventListener("click", () => this.dismissNotifications());
    this.closeIcon.addEventListener("click", event => this.close(event));
    this.submitButton.addEventListener("click", event => this.validate(event));
    window.addEventListener('keydown', event => this.close(event));
  }

  open() {
    this.container.classList.add('open');
    bodyElement.classList.add('modal-open');
  }

  close(event) {
    if (!event.key || (event.key === 'Escape' || event.key === 'Esc')) {
      this.container.classList.remove('open');
      bodyElement.classList.remove('modal-open');
      event.preventDefault();
    }
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
    this.alreadySentWarning.classList.remove('show');
    this.successNotification.classList.remove('show');
    this.notifications.classList.remove('error');
    this.notifications.classList.remove('warning');

    if (notification.indexOf('Error') !== -1) {
      this.notifications.classList.add('error');
    } else if (notification.indexOf('Warning') !== -1) {
      this.notifications.classList.add('warning');
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

  validate(event) {
    this.dismissNotifications();
    const emptyInputs = this.inputs.filter(input => this.isInputEmpty(input));
    event.preventDefault();
    if (emptyInputs.length) {
      this.showNotification('emptyError', emptyInputs);
      return false;
    }
    if (!this.isEmailValid()) {
      this.showNotification('emailError', [this.emailInput]);
      return false;
    }
    return true;
  }

}
