/**
 * Copyright © 2020 Eneko Sanz <contact@eneko.me>
 * File distributed under the MIT license.
 */

/**
 * Opens/closes contact modal, validates data and POSTs to '/contact'.
 *
 * @final
 */
export class ContactModal {
  /**
   * Selects required elements.
   */
  constructor() {
    const query = s => document.querySelectorAll(s);
    this.container = document.getElementsByClassName('contact-modal')[0];
    this.closeIcon = query('.contact-modal > svg.close-modal')[0];
    this.notifications = query('.contact-modal .notifications')[0];
    this.dismissIcon = query('.notifications svg.dismiss')[0];
    this.emailError = query('.notifications .email-error')[0];
    this.emptyError = query('.notifications .empty-error')[0];
    this.unknownError = query('.notifications .unknown-error')[0];
    this.alreadySentError = query('.notifications .already-sent-error')[0];
    this.clickToStartOver = query('.notifications .already-sent-error > a')[0];
    this.successNotification = query('.notifications .success-notification')[0];
    this.nameInput = query('.contact-modal input.name-input')[0];
    this.emailInput = query('.contact-modal input.email-input')[0];
    this.textInput = query('.contact-modal textarea')[0];
    this.inputs = [this.nameInput, this.emailInput, this.textInput];
    this.submitButton = query('.submission button')[0];
    this.submitButtonSpinner = query('.submission button svg')[0];
    this.submitButtonText = query('.submission button span')[0];
    this.setListeners();
  }

  /**
   * Sets event listeners.
   */
  setListeners() {
    this.dismissIcon.addEventListener('click', () => this.dismissNotifications());
    this.closeIcon.addEventListener('click', event => this.close(event));
    this.submitButton.addEventListener('click', event => this.submit(event));
    this.clickToStartOver.addEventListener('click', event => this.reset(event));
    window.addEventListener('keydown', event => this.close(event));
  }

  /**
   * Shows the modal window and blocks scroll on the page.
   *
   * @listens MouseEvent
   */
  open() {
    this.container.classList.add('open');
    document.body.classList.add('no-scroll');
  }

  /**
   * Hides the modal. Filters events that aren't clicks or 'Esc' keypesses.
   *
   * @listens MouseEvent
   * @listens KeyboardEvent
   */
  close(event) {
    if (event.type === 'click' || (event.key === 'Escape' || event.key === 'Esc')) {
      this.container.classList.remove('open');
      document.body.classList.remove('no-scroll');
      event.preventDefault();
    }
  }

  /**
   * Clears input fields and dismisses notifications, if any.
   *
   * @listens MouseEvent
   */
  reset(event) {
    this.inputs.forEach(input => input.value = '');
    this.dismissNotifications();
    event.preventDefault();
  }

  /**
   * Returns true if the value in this.emailInput matches dir@domain.tld.
   *
   * @return {boolean}
   */
  isEmailValid() {
    return /^.+@.+\..+$/.test(this.emailInput.value);
  }

  /**
   * @typedef {string} NotificationType
   * 
   * One of these strings:
   *  - emptyError
   *  - emailError
   *  - alreadySentError
   *  - successNotification
   *  - unknownError
   */

  /**
   * Shows .notification with the NotificationType passed as parameter and
   * highlights the input elements in invalidInputs if any.
   * 
   * @param {NotificationType} notification
   * @param {HtmlElement[]}    [invalidInputs] Input or textarea elements
   *                                           to highlight.
   */
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

  /**
   * Hides all notifications.
   *
   * @listens MouseEvent
   */
  dismissNotifications() {
    this.inputs.forEach(input => input.classList.remove('invalid'));
    this.notifications.classList.remove('show');
  }

  /**
   * Disables submitButton and shows a spinner inside.
   */
  showButtonSpinner() {
    this.submitButton.disabled = true;
    this.submitButton.classList.add('submitting');
    this.submitButtonSpinner.classList.add('show');
    this.submitButtonText.classList.remove('show');
  }

  /**
   * Enables submitButton and hides the spinner inside.
   */
  hideButtonSpinner() {
    this.submitButton.disabled = false;
    this.submitButton.classList.remove('submitting');
    this.submitButtonSpinner.classList.remove('show');
    this.submitButtonText.classList.add('show');
  }

  /**
   * Returns true if inputs are not empty after trimming, emailInput contains
   * a valid e-mail and the data has not been already submitted previously.
   * If no, returns false and shows the corresponding error notification.
   * 
   * @return {boolean}
   */
  isDataValid() {
    const emptyInputs = this.inputs.filter(input => input.value.trim() === '');

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

  /**
   * Generates a hash with the data in the inputs after trimming. Based on the
   * String.hashCode implementation in Java.
   * 
   * @return {number} A 32 bit integer.
   */
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

  /**
   * If data in inputs is valid, submits the form to /contact. If the server
   * returns an error or something unexpected happens, it shows unknownError
   * notification. If the request is successful, successNotification is shown
   * and the hash of the data is stored, so that validation prevents from
   * submitting the same again.
   *
   * @listens MouseEvent
   * @param   {MouseEvent} event
   */
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
      };

      request.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
      request.send(JSON.stringify({
        name: this.nameInput.value,
        email: this.emailInput.value,
        text: this.textInput.value
      }));
    }
  }
}
